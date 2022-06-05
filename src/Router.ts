interface RouterBody {
	path: string;
	method: string;
	middlewares?: MiddlewareBody[];
	handler: Callback;
}

interface MiddlewareBody {
	path: string;
	middleware: Middleware;
}

export type RequestCosmic = Request & IMiddleware;

interface IMiddleware {
	middlewares?: MiddlewareBody[];
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
	private middlewares: MiddlewareBody[] = [];

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

	public use(path: string, middleware: Middleware): MiddlewareBody {
		const middlewareBody: MiddlewareBody = { path: path, middleware: middleware };

		this.middlewares.push({
			path,
			middleware,
		});

		return middlewareBody;
	}

	private request(
		method: Method,
		path: string,
		middleware: Middleware | Callback,
		callback?: Callback,
	): RouterBody {
		const callbackResponse = callback === undefined ? middleware : callback!;
		const middlewareResponse = callback === undefined ? undefined : (middleware as Middleware);

		if (middlewareResponse) {
			this.middlewares.push({
				path,
				middleware,
			});
		}

		const route: RouterBody = {
			path,
			method: method,
			middlewares: this.middlewares,
			handler: (callbackResponse as Callback),
		};

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
