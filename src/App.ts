import { Body, ResponseCosmic, Router } from './Router.ts';

type ListenCallback = (options: { port?: number; hostname?: string }) => void;

export class App extends Router {
	public listen(port: number, hostname: string | ListenCallback, callback?: ListenCallback) {
		const normalizeHostname = callback === undefined ? '0.0.0.0' : hostname;
		const serverOptions = {
			...{ port: 3000, hostname: '0.0.0.0' },
			...{ port: port, hostname: (normalizeHostname as string) },
		};

		this.serve(Deno.listen(serverOptions));

		if (callback === undefined) {
			(hostname as ListenCallback)(serverOptions);
		} else {
			callback?.(serverOptions);
		}
	}

	private async serve(server: Deno.Listener) {
		try {
			for await (const conn of server) {
				(async () => {
					const httpConn = Deno.serveHttp(conn);

					try {
						for await (const event of httpConn) {
							await event.respondWith(this.handler(event.request));
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

	private handler(req: Request): Response {
		const url = new URL(req.url);

		let isNext = true;
		let isRoute = false;

		const objRes = {
			body: undefined as Body,
			status: 200,
			headers: {} as Record<string, string>,
		};

		const res: ResponseCosmic = {
			status: (statusCode: number) => {
				objRes.status = statusCode;
				return res;
			},
			set: (obj: Record<string, string> | string, value?: string) => {
				if (typeof obj === 'object') {
					Object.assign(objRes.headers, obj);
					return;
				}

				objRes.headers[obj] = value as string;
			},
			send: (bodyResponse: Body) => {
				objRes.body = typeof bodyResponse === 'object' ? JSON.stringify(bodyResponse) : bodyResponse;
			},
		};

		try {
			for (const r of this.getRoutes()) {
				if (
					(`${url.pathname}/`.match(`${r.path}/`)) &&
					(r.method === req.method || r.method === 'ALL')
				) {
					r.middlewares?.forEach((middlewareBody) => {
						middlewareBody.middleware(req, res, (next) => {
							next === undefined ? isNext = true : isNext = next;
						});
					});

					if (!isNext) {
						break;
					}

					r.handler(
						Object.assign(req, { middlewares: r.middlewares }),
						res,
					);
					isRoute = true;
					break;
				}
			}
		} catch (error) {
			res.status(500).send({
				statusCode: 500,
				message: 'Internal Error',
				error: error,
			});

			console.log(error);

			isRoute = true;
		}

		if (!isRoute) {
			res.status(404).send({
				statusCode: 404,
				message: 'Not Found',
				error: 'This route doesn\'t exist',
			});
		}

		return new Response(objRes.body as BodyInit, {
			status: objRes.status,
			headers: objRes.headers,
		});
	}
}
