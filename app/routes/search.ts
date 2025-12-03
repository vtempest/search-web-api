import { Hono } from 'hono';
import { Search } from '../lib/search.js';

const app = new Hono();

const search = new Search();

app.get('/search', async (c) => {
    const query = c.req.query('q');
    const format = c.req.query('format') || 'json';
    const pageno = parseInt(c.req.query('pageno') || '1');
    const enginesParam = c.req.query('engines');
    const categoriesParam = c.req.query('categories');

    if (!query) {
        return c.json({ error: 'Missing query parameter' }, 400);
    }

    if (format !== 'json') {
        return c.json({ error: 'Only JSON format is supported' }, 400);
    }

    const engineNames = enginesParam ? enginesParam.split(',') : undefined;
    const categories = categoriesParam ? categoriesParam.split(',') : undefined;

    // Filter engines by category if provided
    // This requires engines to have a 'categories' property, which we need to add to the Engine interface
    // For now, we'll just pass the categories to the search method if we update it, 
    // or we can filter engines here if we update the Engine interface.

    // Let's update the Search class to handle categories or do it here.
    // Since Engine interface doesn't have categories yet, I should add it.

    const results = await search.search(query, pageno, engineNames, categories);

    if (format === 'json') {
        return c.json({
            query,
            results
        });
    }

    return c.text('Only JSON format is supported in this version.');
});

export default app;
