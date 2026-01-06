import { Engine, EngineResult } from '../lib/engine';
import grab from 'grab-url';

export const github: Engine = {
    name: 'github',
    categories: ['it', 'code'],
    request: async (query: string, params: any = {}) => {
        const pageno = params.pageno || 1;
        const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&page=${pageno}&per_page=10`;

        return await grab(url, {
            headers: {
                'User-Agent': 'HonoxSearX/1.0',
                'Accept': 'application/vnd.github.v3+json'
            }
        });

    },
    response: async (json: any) => {
        const results: EngineResult[] = [];

        if (json && json.items) {
            json.items.forEach((item: any) => {
                results.push({
                    url: item.html_url,
                    title: item.full_name,
                    content: item.description || 'No description',
                    engine: 'github'
                });
            });
        }

        return results;
    }
};
