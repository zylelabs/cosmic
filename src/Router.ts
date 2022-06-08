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

export interface RouterOptions {
	prefix: string;
}

export interface MethodOptions {
	hasPrefix: boolean;
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
	private prefix: string | undefined;

	constructor(options?: RouterOptions) {
		this.prefix = options?.prefix;
	}

	public get(
		path: string,
		options: MethodOptions | Middleware | Callback,
		middleware?: Middleware | Callback,
		callback?: Callback,
	): RouterBody {
		return this.request('GET', path, options, middleware, callback);
	}

	public post(
		path: string,
		options: MethodOptions | Middleware | Callback,
		middleware?: Middleware | Callback,
		callback?: Callback,
	): RouterBody {
		return this.request('POST', path, options, middleware, callback);
	}

	public put(
		path: string,
		options: MethodOptions | Middleware | Callback,
		middleware?: Middleware | Callback,
		callback?: Callback,
	): RouterBody {
		return this.request('PUT', path, options, middleware, callback);
	}

	public patch(
		path: string,
		options: MethodOptions | Middleware | Callback,
		middleware?: Middleware | Callback,
		callback?: Callback,
	): RouterBody {
		return this.request('PATCH', path, options, middleware, callback);
	}

	public delete(
		path: string,
		options: MethodOptions | Middleware | Callback,
		middleware?: Middleware | Callback,
		callback?: Callback,
	): RouterBody {
		return this.request('DELETE', path, options, middleware, callback);
	}

	public all(
		path: string,
		options: MethodOptions | Middleware | Callback,
		middleware?: Middleware | Callback,
		callback?: Callback,
	): RouterBody {
		return this.request('ALL', path, options, middleware, callback);
	}

	public use(dirPath: string, middleware: Middleware): MiddlewareBody {
		const path = this.prefix ? this.prefix + dirPath : dirPath;
		const middlewareBody: MiddlewareBody = { path: path, middleware: middleware };

		this.middlewares.push({
			path,
			middleware,
		});

		return middlewareBody;
	}

	private request(
		method: Method,
		dirPath: string,
		options: MethodOptions | Middleware | Callback,
		middleware?: Middleware | Callback,
		callback?: Callback,
	): RouterBody {
		const optionsResponse = callback ? options : middleware ? options : undefined;
		const middlewareResponse = middleware === undefined ? undefined : callback ? middleware : options;
		const callbackResponse = callback ? callback : middleware === undefined ? options : middleware;

		let path = dirPath;

		if (optionsResponse && typeof optionsResponse === 'object') {
			path = this.prefix ? this.prefix + dirPath : dirPath;
		}

		if (middlewareResponse && typeof middlewareResponse === 'function') {
			this.middlewares.push({
				path,
				middleware: middlewareResponse as Middleware,
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
