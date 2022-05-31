export interface RouterBody {
	path: string;
	method: string;
	middleware?: Middleware;
	handler: Callback;
}

interface UseBody {
	path: string;
	middleware: Middleware;
}

export type RequestCosmic = Request & IMiddleware;

export interface IMiddleware {
	middleware?: string;
}

export interface ResponseCosmic {
	status: (statusCode: number) => Omit<ResponseCosmic, 'status'>;
	set: (obj: Record<string, string> | string, value?: string) => void;
	send: (body: Body) => void;
}

type Method =
	| 'ALL'
	| 'GET'
	| 'POST'
	| 'PUT'
	| 'PATCH'
	| 'DELETE';

export type Body = BodyInit | JSON | Record<string | number, unknown> | null | undefined | unknown;

export type Next = (pass?: boolean) => void;

export type Middleware = (req: RequestCosmic, res: ResponseCosmic, next: Next) => void;

type Callback = (req: RequestCosmic, res: ResponseCosmic) => void;

export class Router {
	private routes: RouterBody[] = [];
	private middlewares: UseBody[] = [];

	public get(path: string, middleware: Middleware | Callback, callback?: Callback): RouterBody {
		return this.request('GET', path, middleware, callback);
	}

	public post(path: string, middleware: Middleware | Callback, callback?: Callback): RouterBody {
		return this.request('POST', path, middleware, callback);
	}

	public put(path: string, middleware: Middleware | Callback, callback?: Callback): RouterBody {
		return this.request('PUT', path, middleware, callback);
	}

	public patch(path: string, middleware: Middleware | Callback, callback?: Callback): RouterBody {
		return this.request('PATCH', path, middleware, callback);
	}

	public delete(
		path: string,
		middleware: Middleware | Callback,
		callback?: Callback,
	): RouterBody {
		return this.request('DELETE', path, middleware, callback);
	}

	public all(path: string, middleware: Middleware | Callback, callback?: Callback): RouterBody {
		return this.request('ALL', path, middleware, callback);
	}

	public use(path: string, middleware: Middleware): UseBody {
		const useBody: UseBody = { path: path, middleware: middleware };

		if (this.routes.some((route) => route.path === path)) {
			this.routes.forEach((route) => {
				if (route.path == path) route.middleware = middleware;
			});
		} else {
			this.middlewares.push({
				path,
				middleware,
			});
		}

		return useBody;
	}

	private request(
		method: Method,
		path: string,
		middleware: Middleware | Callback,
		callback?: Callback,
	): RouterBody {
		const callbackResponse = callback === undefined ? middleware : callback!;
		const middlewareResponse = callback === undefined ? undefined : (middleware as Middleware);

		const route: RouterBody = {
			path,
			method: method,
			middleware: undefined,
			handler: (callbackResponse as Callback),
		};

		this.middlewares.forEach((middleware) => {
			if (middleware.path === path) {
				route.middleware = middleware.middleware;
			}
		});

		if (middlewareResponse) {
			route.middleware = middlewareResponse;
		}

		this.routes.push(route);

		return route;
	}

	public registerRouter(router: Router) {
		router.getRoutes().forEach((route) => {
			this.routes.push(route);
		});
	}

	public getRoutes() {
		return this.routes;
	}
}
