import { Engine, EngineResult } from '../../lib/engine.js';

export const vimeo: Engine = {
    name: 'vimeo',
    categories: ['videos'],
    request: async (query: string, params: any = {}) => {
        const pageno = params.pageno || 1;

        const queryParams = new URLSearchParams({
            q: query
        });

        const url = `https://vimeo.com/search/page:${pageno}?${queryParams.toString()}`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
            }
        });

        return await response.text();
    },
    response: async (html: string) => {
        const results: EngineResult[] = [];

        try {
            // Extract JSON data from the page
            const dataMatch = html.match(/var data = ({.*?});/s);
            if (!dataMatch) {
                return results;
            }

            const data = JSON.parse(dataMatch[1]);
            const filteredData = data?.filtered?.data || [];

            for (const resultItem of filteredData) {
                const type = resultItem.type;
                const result = resultItem[type];

                if (!result) continue;

                const videoId = result.uri?.split('/').pop();
                if (!videoId) continue;

                const url = `https://vimeo.com/${videoId}`;
                const title = result.name || '';
                const thumbnail = result.pictures?.sizes?.slice(-1)[0]?.link || '';
                const publishedDate = result.created_time || '';

                results.push({
                    url,
                    title,
                    content: publishedDate ? `Published: ${publishedDate.split('T')[0]}` : '',
                    thumbnail,
                    engine: 'vimeo'
                });
            }
        } catch (e) {
            console.error('Error parsing Vimeo response:', e);
        }

        return results;
    }
};
