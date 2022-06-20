import { RequestCosmic } from '../../types.d.ts';

export class NativeServer {
	public async received(event: Deno.RequestEvent): Promise<RequestCosmic> {
		const request = event.request;
		return {
			_event: event,
			url: new URL(request.url).pathname,
			method: request.method.toUpperCase(),
			headers: request.headers,
			body: await this.parseBody(request),
		};
	}

	private async parseBody(request: Request) {
		try {
			switch (request.headers.get('content-type')) {
				case 'application/json':
					return await request.json();
				case 'text/plain':
				case 'text/yaml':
					return await request.text();
				default:
					return request.body;
			}
		} catch {
			return undefined;
		}
	}
}
