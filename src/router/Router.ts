import { ResponseCosmic } from './ResponseCosmic.ts';
import { Next, RequestCosmic } from '../../types.d.ts';

export interface RouterBody {
	path: string;
	method: string;
	middlewares?: MiddlewareBody[];
	handler: (req: RequestCosmic, res: ResponseCosmic) => Promise<void>;
}

interface MiddlewareBody {
	path: string;
	middleware: Middleware;
}

interface RouterOptions {
	prefix: string;
}

interface MethodOptions {
	hasPrefix: boolean;
}

type RouterCallback = (req: RequestCosmic, res: ResponseCosmic) => Promise<void>;
type Middleware = (req: RequestCosmic, res: ResponseCosmic, next: Next) => Promise<void>;

type Method = 'ALL' | 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export class Router {
	private routes: RouterBody[] = [];
	private middlewares: MiddlewareBody[] = [];
	private prefix: string | undefined;

	constructor(options?: RouterOptions) {
		this.prefix = options?.prefix;
	}

	public get(
		path: string,
		options: MethodOptions | Middleware | RouterCallback,
		middleware?: Middleware | RouterCallback,
		callback?: RouterCallback,
	) {
		return this.request('GET', path, options, middleware, callback);
	}

	public post(
		path: string,
		options: MethodOptions | Middleware | RouterCallback,
		middleware?: Middleware | RouterCallback,
		callback?: RouterCallback,
	) {
		return this.request('POST', path, options, middleware, callback);
	}

	public put(
		path: string,
		options: MethodOptions | Middleware | RouterCallback,
		middleware?: Middleware | RouterCallback,
		callback?: RouterCallback,
	) {
		return this.request('PUT', path, options, middleware, callback);
	}

	public patch(
		path: string,
		options: MethodOptions | Middleware | RouterCallback,
		middleware?: Middleware | RouterCallback,
		callback?: RouterCallback,
	) {
		return this.request('PATCH', path, options, middleware, callback);
	}

	public delete(
		path: string,
		options: MethodOptions | Middleware | RouterCallback,
		middleware?: Middleware | RouterCallback,
		callback?: RouterCallback,
	) {
		return this.request('DELETE', path, options, middleware, callback);
	}

	public all(
		path: string,
		options: MethodOptions | Middleware | RouterCallback,
		middleware?: Middleware | RouterCallback,
		callback?: RouterCallback,
	) {
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
		options: MethodOptions | Middleware | RouterCallback,
		middleware?: Middleware | RouterCallback,
		callback?: RouterCallback,
	) {
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
			handler: callbackResponse as RouterCallback,
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
