import { Body } from '../../types.d.ts';

export class ResponseCosmic {
	private response: { body: Body; status: number; headers: Record<string, string> };

	constructor() {
		this.response = {
			body: undefined,
			status: 200,
			headers: {},
		};
	}

	public send(body: Body) {
		this.response.body = typeof body === 'object' ? JSON.stringify(body) : body;
	}

	public status(statusCode: number) {
		this.response.status = statusCode;
		return this;
	}

	public set(obj: Record<string, string> | string, value?: string) {
		if (typeof obj === 'object') {
			Object.assign(this.response.headers, obj);
			return;
		}

		this.response.headers[obj] = value as string;
	}

	public getResponse() {
		return this.response;
	}
}
