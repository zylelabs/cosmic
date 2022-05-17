// deno-lint-ignore-file no-explicit-any
export interface RouterBody {
	path: string;
	method: string;
	middleware?: Middleware;
	handler: Callback;
}

export interface RequestCosmic {
	request: Request;
	middleware?: Middleware;
}

export interface ResponseCosmic {
	status: (statusCode: number) => Omit<ResponseCosmic, 'status'>;
	send: Send;
}

type Send = (body: Body) => void;

export type Body = BodyInit | JSON | Record<string, string> | null | undefined;

export type Next = (arg?: any) => void;

export type Middleware = (req: Request, res: ResponseCosmic, next: Next) => Next;

type Callback = (req: RequestCosmic, res: ResponseCosmic) => void;

export class Router {
	private routes: RouterBody[] = [];

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
