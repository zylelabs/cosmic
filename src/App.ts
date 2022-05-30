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

		let body: Body;
		let status = 200;

		const res: ResponseCosmic = {
			status: (statusCode: number) => {
				status = statusCode;
				return res;
			},
			send: (bodyResponse: Body) => {
				body = typeof bodyResponse === 'object'
					? JSON.stringify(bodyResponse)
					: bodyResponse;
			},
		};

		let isNext = true;

		for (const r of this.getRoutes()) {
			if (
				(`${url.pathname}/`.match(`${r.path}/`)) &&
				(r.method === req.method || r.method === 'ALL')
			) {
				if (r.middleware) {
					r.middleware(req, res, (next) => {
						next === undefined ? isNext = true : isNext = next;
					});
				}

				if (!isNext) {
					break;
				}

				r.handler(
					Object.assign(req, { middleware: r.middleware?.name }),
					res,
				);
				break;
			}
		}
		return new Response(body as BodyInit, { status: status });
	}
}
