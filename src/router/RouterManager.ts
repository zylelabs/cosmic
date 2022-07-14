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
			isMiddleware: boolean
		) => Promise<void> | void
	) {
		const response = new ResponseCosmic();
		let isNext = true;

		for (const route of app.getRoutes()) {
			if (
				`${request.url}/`.match(`${route.path}/`) &&
				(route.method === request.method || route.method === 'ALL')
			) {
				route.middlewares?.forEach(async (middlewareBody) => {
					await middlewareBody.middleware(request, response, (next) => {
						next === undefined ? (isNext = true) : (isNext = next);
					});
				});

				if (!isNext) {
					return await callback(route, response, true);
				}

				return await callback(route, response, false);
			}
		}
	}
}

export default new RouterManager();
