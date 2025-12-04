import { Engine, EngineResult } from '../../lib/engine.js';
import grab from 'grab-url';

export const wikipedia: Engine = {
    name: 'wikipedia',
    categories: ['general', 'reference'],
    request: async (query: string, params: any = {}) => {
        const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&sroffset=${(params.pageno - 1) * 10}`;
        return {
            url,
            method: 'GET',
            headers: {
                'User-Agent': 'HonoxSearX/1.0 (mailto:admin@example.com)'
            },
            data: {},
            ...params
        };
    },
    response: async (params) => {
        return await grab(params.url, { responseType: 'text' });
        const data = await response.json();

        return (data.query?.search || []).map((item: any) => ({
            title: item.title,
            link: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, '_'))}`,
            content: item.snippet.replace(/<[^>]+>/g, ''), // Remove HTML tags
            engine: 'wikipedia'
        }));
    }
};
