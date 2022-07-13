import { ResponseCosmic } from './ResponseCosmic.ts';
import { RouterBody } from './Router.ts';
import { RequestCosmic } from '../../types.d.ts';
import { App } from './../App.ts';

class RouterManager {
	public async check(
		app: App,
		request: RequestCosmic,
		callback: (route: RouterBody, response: ResponseCosmic) => Promise<void> | void
	) {
		let isNext = true;
		const response = new ResponseCosmic();

		for (const route of app.getRoutes()) {
			if (
				`${request.url}/`.match(`${route.path}/`) &&
				(route.method === request.method || route.method === 'ALL')
			) {
				route.middlewares?.forEach((middlewareBody) => {
					middlewareBody.middleware(request, response, (next) => {
						next === undefined ? (isNext = true) : (isNext = next);
					});
				});

				if (!isNext) {
					break;
				}

				await callback(route, response);

				break;
			}
		}
	}
}

export default new RouterManager();
