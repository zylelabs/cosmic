import { ResponseCosmic } from './ResponseCosmic.ts';
import { RouterBody } from './Router.ts';
import { RequestCosmic } from '../../types.d.ts';
import { App } from './../App.ts';

class RouterManager {
	public async check(
		app: App,
		request: RequestCosmic,
		callback: (
			route: RouterBody,
			response: ResponseCosmic,
			blocked: boolean | undefined,
		) => Promise<void> | void,
	) {
		const response = new ResponseCosmic();
		let isBlocked: boolean | undefined = undefined;

		for (const route of app.getRoutes()) {
			if (
				`${request.url}/`.match(`${route.path}/`) &&
				(route.method === request.method || route.method === 'ALL')
			) {
				for await (const middlewareBody of route.middlewares!) {
					if (`${middlewareBody.path}`.match(`${route.path}`)) {
						try {
							await middlewareBody.middleware(request, response, (next) => {
								if (isBlocked === undefined) {
									next === undefined ? (isBlocked = true) : (isBlocked = next);
								}
							});
						} catch (error) {
							console.log(error);
						}
					}
				}

				if (isBlocked !== undefined && !isBlocked) {
					return await callback(route, response, true);
				}

				return await callback(route, response, false);
			}
		}
	}
}

export default new RouterManager();
