import { Engine, EngineResult } from '../lib/engine';

export const openstreetmap: Engine = {
    name: 'openstreetmap',
    categories: ['maps'],
    request: async (query: string, params: any = {}) => {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=10`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'HonoxSearX/1.0'
            }
        });

        return await response.json();
    },
    response: async (json: any) => {
        const results: EngineResult[] = [];

        if (Array.isArray(json)) {
            json.forEach((item: any) => {
                results.push({
                    url: `https://www.openstreetmap.org/${item.osm_type}/${item.osm_id}`,
                    title: item.display_name,
                    content: `Type: ${item.type}, Class: ${item.class}`,
                    engine: 'openstreetmap'
                });
            });
        }

        return results;
    }
};
