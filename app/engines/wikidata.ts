import { Engine, EngineResult } from '../lib/engine';

export const wikidata: Engine = {
    name: 'wikidata',
    categories: ['general'],
    request: async (query: string, params: any = {}) => {
        const url = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(query)}&language=en&format=json&limit=20`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
            }
        });

        return await response.json();
    },
    response: async (json: any) => {
        const results: EngineResult[] = [];

        if (json && json.search) {
            json.search.forEach((item: any) => {
                const id = item.id;
                const title = item.label || id;
                const description = item.description || 'No description available';
                const url = item.url || `https://www.wikidata.org/wiki/${id}`;

                results.push({
                    url,
                    title,
                    content: description,
                    engine: 'wikidata'
                });
            });
        }

        return results;
    }
};
