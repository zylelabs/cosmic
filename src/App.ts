import { Router } from './Router.ts';

interface ListenOptions {
	port?: number;
	hostname?: string;
}

const ListenOptionsDefault = {
	port: 3000,
	hostname: '0.0.0.0',
};

export class App extends Router {
	public listen(options?: ListenOptions, callback?: (options: ListenOptions) => void) {
		const serverOptions = { ...ListenOptionsDefault, ...options };
		const server = Deno.listen(serverOptions);

		this.serve(server);

		callback?.(serverOptions);
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

		let res = {};

		res = {
			path: url.pathname,
			error: 'Not Found',
			statusCode: 404,
		};

		let isNext = true;

		for (const r of this.getRoutes()) {
			if (`${url.pathname}/`.match(`${r.path}/`)) {
				res = {};

				if (r.middleware) {
					r.middleware(req, res, (next) => {
						next === undefined ? isNext = true : isNext = next;
					});
				}

				if (!isNext) {
					break;
				}

				r.handler(
					{
						headers: req.headers,
						middleware: r.middleware,
						method: req.method,
						url: req.url,
					},
					res,
				);
				break;
			}
		}

		return new Response(JSON.stringify(res), { status: 200 });
	}
}
