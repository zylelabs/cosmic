export interface RequestCosmic {
	_event: Deno.RequestEvent;
	url: string;
	method: string;
	headers: Headers;
	body: BodyValue;
}

type BodyValue = null | undefined | { [name: string]: BodyValue };

export type Next = (pass?: boolean) => void;

export type Body = BodyInit | JSON | Record<string | number, unknown> | null | undefined;
