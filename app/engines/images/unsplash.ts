import { Engine, EngineResult } from '../lib/engine';

export const unsplash: Engine = {
    name: 'unsplash',
    categories: ['images'],
    request: async (query: string, params: any = {}) => {
        const pageno = params.pageno || 1;
        // Unsplash requires an API key for their official API, but we can try scraping or using a public frontend/proxy if available.
        // Or we can use the napi (internal API) if possible, but that's fragile.
        // Let's try scraping the search page HTML which contains JSON data often.
        // Actually, Unsplash has a frontend API that might be accessible.
        // Let's try a simple search URL and see if we can parse HTML.
        const url = `https://unsplash.com/napi/search/photos?query=${encodeURIComponent(query)}&per_page=20&page=${pageno}`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
            }
        });

        return await response.json();
    },
    response: async (json: any) => {
        const results: EngineResult[] = [];

        if (json && json.results) {
            json.results.forEach((item: any) => {
                results.push({
                    url: item.links.html,
                    title: item.description || item.alt_description || 'Unsplash Image',
                    content: `By ${item.user.name}`,
                    thumbnail: item.urls.small,
                    engine: 'unsplash'
                });
            });
        }

        return results;
    }
};
