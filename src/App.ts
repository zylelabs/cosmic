import { Router } from './Router.ts';

export class App extends Router {
	public async listen(port: number, callback?: () => void) {
		const server = Deno.listen({ port: port });

		callback?.();

		for await (const listener of server) {
			const httpConn = Deno.serveHttp(listener);

			for await (const event of httpConn) {
				event.respondWith(this.handler(event.request));
			}
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

		for (const r of this.getRoutes()) {
			if (`${url.pathname}/`.match(`${r.path}/`)) {
				res = {};
				r.handler(
					{
						headers: req.headers,
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
