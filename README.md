# 🪐 Cosmic - Deno Web Framework 🪐

> Minimalist & fast web framework for Deno 🦕💫

## Features

- Lightweight and high-performance
- Simple implementation
- 0 dependencies
- Routes and middlewares included

## Example usage
```typescript
import { App, RequestCosmic, ResponseCosmic } from '../cosmic/mod.ts';

const app = new App();

app.get('/', (_req: RequestCosmic, res: ResponseCosmic) => {
	res.send({ Hello: 'World' });
});

app.listen(3000, (server) => {
	console.log(`Application running on http://${server.hostname}:${server.port}/`);
});
```
