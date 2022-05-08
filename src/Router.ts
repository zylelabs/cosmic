// deno-lint-ignore-file no-explicit-any
export interface IRouter {
	path: string;
	method: string;
	handler: (...args: any[]) => void;
}

export class Router {
	private routes: IRouter[] = [];

	public get(path: string, callback: (...args: any[]) => void) {
		const route: IRouter = { path, method: 'GET', handler: callback };
		this.routes.push(route);
		return route;
	}

	public getRoutes() {
		return this.routes;
	}

	public registerRouter(router: Router) {
		router.getRoutes().forEach((route) => {
			this.routes.push(route);
		});
	}
}
