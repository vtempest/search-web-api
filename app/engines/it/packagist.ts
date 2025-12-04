import { Engine, EngineResult } from '../lib/engine';
import grab from 'grab-url';

export const packagist: Engine = {
    name: 'packagist',
    categories: ['it', 'packages'],
    request: async (query: string, params: any = {}) => {
        const pageno = params.pageno || 1;
        const per_page = 15;
        const url = `https://packagist.org/search.json?q=${encodeURIComponent(query)}&page=${pageno}&per_page=${per_page}`;

        return await grab(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept': 'application/json'
            }
        });

    },
    response: async (json: any) => {
        const results: EngineResult[] = [];

        if (json && json.results) {
            json.results.forEach((pkg: any) => {
                const name = pkg.name;
                const description = pkg.description || 'No description';
                const downloads = pkg.downloads || 0;
                const favers = pkg.favers || 0;

                results.push({
                    url: pkg.url || `https://packagist.org/packages/${name}`,
                    title: name,
                    content: `${description} | 📥 ${downloads.toLocaleString()} downloads | ⭐ ${favers} favorites`,
                    engine: 'packagist'
                });
            });
        }

        return results;
    }
};
