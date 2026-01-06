import { Engine, EngineResult } from '../lib/engine';
import grab from 'grab-url';

export const archive: Engine = {
    name: 'archive',
    categories: ['general', 'files'],
    request: async (query: string, params: any = {}) => {
        const pageno = params.pageno || 1;
        const url = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(query)}&fl[]=identifier,title,description,mediatype,downloads&sort[]=&sort[]=&sort[]=&rows=50&page=${pageno}&output=json`;

        return await grab(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
            }
        });

    },
    response: async (json: any) => {
        const results: EngineResult[] = [];

        if (json && json.response && json.response.docs) {
            json.response.docs.forEach((doc: any) => {
                const identifier = doc.identifier;
                const title = doc.title || identifier;
                const description = doc.description || 'No description available';
                const mediatype = doc.mediatype || 'unknown';
                const downloads = doc.downloads || 0;
                const url = `https://archive.org/details/${identifier}`;

                results.push({
                    url,
                    title,
                    content: `${description} | Type: ${mediatype} | Downloads: ${downloads}`,
                    thumbnail: `https://archive.org/services/img/${identifier}`,
                    engine: 'archive'
                });
            });
        }

        return results;
    }
};
