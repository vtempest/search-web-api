import { Engine, EngineResult } from '../lib/engine';
import grab from 'grab-url';

export const dockerhub: Engine = {
    name: 'dockerhub',
    categories: ['it', 'packages'],
    request: async (query: string, params: any = {}) => {
        const pageno = params.pageno || 1;
        const url = `https://hub.docker.com/api/search/v3/catalog/search?q=${encodeURIComponent(query)}&page=${pageno}&page_size=25`;

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
            json.results.forEach((item: any) => {
                const name = item.name || item.slug;
                const namespace = item.namespace || '';
                const fullName = namespace ? `${namespace}/${name}` : name;
                const description = item.description || item.short_description || 'No description';
                const stars = item.star_count || 0;
                const pulls = item.pull_count || 0;
                const isOfficial = item.is_official || false;

                results.push({
                    url: `https://hub.docker.com/r/${fullName}`,
                    title: `${fullName}${isOfficial ? ' [OFFICIAL]' : ''}`,
                    content: `${description} | ⭐ ${stars} | 📥 ${pulls.toLocaleString()} pulls`,
                    engine: 'dockerhub'
                });
            });
        }

        return results;
    }
};
