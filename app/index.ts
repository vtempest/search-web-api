
import { Hono } from 'hono';
import { swaggerUI } from '@hono/swagger-ui';
import searchRoute from './routes/search.js';
import { openAPISpec } from './openapi.js';

const app = new Hono();

// Swagger UI endpoint
app.get('/docs', swaggerUI({ url: '/openapi.json' }));

// OpenAPI JSON spec endpoint
app.get('/openapi.json', (c) => {
    return c.json(openAPISpec);
});

app.route('/', searchRoute);

app.get('/', (c) => {
    return c.text('SearXNG HonoX API is running! Visit /docs for API documentation.');
});

const port = 3000;
console.log(`Server is running on port ${port}`);

// Bun's native server
export default {
    port,
    fetch: app.fetch,
};
