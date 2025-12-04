import { Engine, EngineResult } from '../../lib/engine.js';
import grab from 'grab-url';

export const crossref: Engine = {
    name: 'crossref',
    categories: ['academic', 'science'],
    request: async (query: string, params: any = {}) => {
        const pageno = params.pageno || 1;
        const offset = 20 * (pageno - 1);

        const url = `https://api.crossref.org/works?query=${encodeURIComponent(query)}&offset=${offset}`;

        return await grab(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
            }
        });
    },
    response: async (json: any) => {
        const results: EngineResult[] = [];

        if (!json || !json.message || !json.message.items) {
            return results;
        }

        for (const record of json.message.items) {
            // Skip components (files published along with papers)
            if (record.type === 'component') {
                continue;
            }

            let title = '';
            let journal = '';

            if (record.type === 'book-chapter') {
                title = record['container-title']?.[0] || '';
                if (record.title?.[0] && record.title[0].toLowerCase().trim() !== title.toLowerCase().trim()) {
                    title += ` (${record.title[0]})`;
                }
            } else {
                title = record.title?.[0] || record['container-title']?.[0] || '';
                journal = record['container-title']?.[0] && record.title?.[0] ? record['container-title'][0] : '';
            }

            const authors = (record.author || [])
                .map((a: any) => `${a.given || ''} ${a.family || ''}`.trim())
                .filter((a: string) => a)
                .join(', ');

            const content = [
                record.abstract || '',
                journal ? `Journal: ${journal}` : '',
                authors ? `Authors: ${authors}` : '',
                record.publisher ? `Publisher: ${record.publisher}` : '',
                record.DOI ? `DOI: ${record.DOI}` : ''
            ].filter(Boolean).join('\n');

            results.push({
                url: record.URL || `https://doi.org/${record.DOI}` || '',
                title,
                content,
                engine: 'crossref'
            });
        }

        return results;
    }
};
