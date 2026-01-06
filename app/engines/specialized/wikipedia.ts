import { Engine, EngineResult, extractResponseData } from '../../lib/engine.js';
import grab from 'grab-url';

export const wikipedia: Engine = {
    name: 'wikipedia',
    categories: ['general', 'reference'],
    request: async (query: string, params: any = {}) => {
        const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&sroffset=${(params.pageno - 1) * 10}`;
        return await grab(url, {
            headers: {
                'User-Agent': 'HonoxSearX/1.0 (mailto:admin@example.com)'
            }
        });
    },
    response: async (response: any) => {
        const data = extractResponseData(response);

        return (data.query?.search || []).map((item: any) => ({
            url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, '_'))}`,
            title: item.title,
            content: item.snippet.replace(/<[^>]+>/g, ''), // Remove HTML tags
            engine: 'wikipedia'
        }));
    }
};
