// deno-lint-ignore-file no-explicit-any
export interface RouterBody {
	path: string;
	method: string;
	middleware?: Middleware;
	handler: Callback;
}

export type Next = (arg?: any) => void;

type Middleware = (req: any, res: any, next: Next) => Next;

type Callback = (...args: any[]) => void;

export class Router {
	private routes: RouterBody[] = [];

	public get(path: string, callback: Callback): void;
	public get(path: string, middleware: Middleware | Callback, callback?: Callback): void;
	public get(path: string, middleware: Middleware | Callback, callback?: Callback): RouterBody {
		const callbackResponse = callback === undefined ? middleware : callback!;
		const middlewareResponse = callback === undefined ? undefined : (middleware as Middleware);

		const route: RouterBody = {
			path,
			method: 'GET',
			middleware: middlewareResponse,
			handler: (callbackResponse as Callback),
		};

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
