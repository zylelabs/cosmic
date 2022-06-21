import { Body } from './../../types.d.ts';

export class NativeResponse {
	public response: { body: Body; init?: ResponseInit };

	constructor() {
		this.response = {
			body: undefined,
			init: {
				headers: undefined,
				status: 200,
			},
		};
	}

	public setBody(body: Body) {
		this.response.body = body;
		return this;
	}

	public setStatus(status: number) {
		this.response.init!.status = status;
		return this;
	}

	public setHeaders(headers: HeadersInit) {
		this.response.init!.headers = headers;
		return this;
	}

	public getResponse(): Response {
		return new Response(this.response.body as BodyInit, this.response.init!);
	}
}
