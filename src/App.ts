import RouterManager from './router/RouterManager.ts';
import { Router } from './router/Router.ts';
import { NativeServer } from './native/NativeServer.ts';
import { NativeResponse } from './native/NativeResponse.ts';
import { ResponseCosmic } from './router/ResponseCosmic.ts';
import { RequestCosmic } from '../types.d.ts';

type ListenCallback = (listenOptions: ListenResponseCallback) => void;

interface ListenResponseCallback extends ListenOptions {
	port: number;
}

interface ListenOptions {
	hostname?: string;
}

export class App extends Router {
	public listen(
		port: number,
		options: string | ListenOptions | ListenCallback,
		callback?: ListenCallback,
	) {
		let listenOptions: ListenOptions = {
			...{ hostname: '0.0.0.0' },
		};

		if (typeof options === 'string') {
			listenOptions = {
				...{ hostname: options as string },
			};
		}

		if (typeof options === 'object') {
			listenOptions = {
				...options,
			};
		}

		listenOptions.hostname = listenOptions.hostname === undefined ? '0.0.0.0' : listenOptions.hostname;

		this.serve(Deno.listen({ hostname: listenOptions.hostname, port: port }));

		if (typeof options === 'function') {
			(options as ListenCallback)({ ...listenOptions, ...{ port: port } });
		} else {
			callback?.({ ...listenOptions, ...{ port: port } });
		}
	}

	private async serve(server: Deno.Listener) {
		try {
			for await (const conn of server) {
				(async () => {
					const httpConn = Deno.serveHttp(conn);

					try {
						for await (const event of httpConn) {
							const nativeServer = new NativeServer();
							this.handle(await nativeServer.received(event));
						}
					} catch (error) {
						console.log('ListenerError', error);
					}
				})();
			}
		} catch (error) {
			console.warn('ServerError', error);
		}
	}

	private async handle(req: RequestCosmic) {
		let response: ResponseCosmic | undefined = undefined;

		const nativeRequest = new NativeResponse();

		try {
			await RouterManager.check(this, req, async (route, res, isMiddleware) => {
				if (!isMiddleware) {
					await route.handler(req, res);
				}

				nativeRequest
					.setBody(res.getResponse().body)
					.setStatus(res.getResponse().status)
					.setHeaders(res.getResponse().headers);

				response = res;
			});

			if (!response) {
				nativeRequest
					.setBody(
						JSON.stringify({
							statusCode: 404,
							message: 'Not Found',
							error: 'This route doesn\t exist',
						}),
					)
					.setStatus(404);
			}
		} catch (error) {
			nativeRequest
				.setBody(
					JSON.stringify({
						statusCode: 500,
						message: 'Internal Error',
						error: error,
					}),
				)
				.setStatus(500);

			console.log(error);
		}

		req._event.respondWith(nativeRequest.getResponse());
	}
}
