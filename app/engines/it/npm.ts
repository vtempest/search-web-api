import { Engine, EngineResult } from '../lib/engine';
import grab from 'grab-url';

export const npm: Engine = {
    name: 'npm',
    categories: ['it', 'packages'],
    request: async (query: string, params: any = {}) => {
        const pageno = params.pageno || 1;
        const from = (pageno - 1) * 10;
        const url = `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(query)}&size=10&from=${from}`;

        return await grab(url, {
            headers: {
                'User-Agent': 'HonoxSearX/1.0'
            }
        });

    },
    response: async (json: any) => {
        const results: EngineResult[] = [];

        if (json && json.objects) {
            json.objects.forEach((item: any) => {
                results.push({
                    url: item.package.links.npm,
                    title: item.package.name,
                    content: item.package.description || '',
                    engine: 'npm'
                });
            });
        }

        return results;
    }
};
