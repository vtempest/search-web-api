import { Engine, EngineResult } from '../lib/engine';
import grab from 'grab-url';

export const rubygems: Engine = {
    name: 'rubygems',
    categories: ['it', 'packages'],
    request: async (query: string, params: any = {}) => {
        const pageno = params.pageno || 1;
        const url = `https://rubygems.org/api/v1/search.json?query=${encodeURIComponent(query)}&page=${pageno}`;

        return await grab(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept': 'application/json'
            }
        });

    },
    response: async (json: any) => {
        const results: EngineResult[] = [];

        if (Array.isArray(json)) {
            json.forEach((gem: any) => {
                const name = gem.name;
                const version = gem.version;
                const info = gem.info || 'No description';
                const downloads = gem.downloads || 0;
                const authors = gem.authors || '';

                results.push({
                    url: `https://rubygems.org/gems/${name}`,
                    title: `${name} ${version}`,
                    content: `${info} | By: ${authors} | 📥 ${downloads.toLocaleString()} downloads`,
                    engine: 'rubygems'
                });
            });
        }

        return results;
    }
};
