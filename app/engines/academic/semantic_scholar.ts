import { Engine, EngineResult } from '../../lib/engine.js';
import grab from 'grab-url';

export const semantic_scholar: Engine = {
    name: 'semantic_scholar',
    categories: ['science', 'academic'],
    request: async (query: string, params: any = {}) => {
        const pageno = params.pageno || 1;

        const url = 'https://www.semanticscholar.org/api/1/search';

        const payload = {
            queryString: query,
            page: pageno,
            pageSize: 10,
            sort: 'relevance',
            getQuerySuggestions: false,
            authors: [],
            coAuthors: [],
            venues: [],
            performTitleMatch: true,
        };

        return await grab(url, {
            post: true,
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
            body: JSON.stringify(payload)
        });

    },
    response: async (data: any) => {
        const results: EngineResult[] = [];

        if (!data.results) {
            return results;
        }

        for (const result of data.results) {
            // Get URL
            let url = result.primaryPaperLink?.url;
            if (!url && result.links && result.links.length > 0) {
                url = result.links[0];
            }
            if (!url && result.alternatePaperLinks && result.alternatePaperLinks.length > 0) {
                url = result.alternatePaperLinks[0].url;
            }
            if (!url) {
                url = `https://www.semanticscholar.org/paper/${result.id}`;
            }

            const title = result.title?.text || '';
            const abstract = result.abstract?.text || '';

            // Build metadata
            const metadata: string[] = [];

            // Authors
            if (result.authors && result.authors.length > 0) {
                const authorNames = result.authors.map((a: any) => a.name).slice(0, 3);
                metadata.push(`Authors: ${authorNames.join(', ')}${result.authors.length > 3 ? ' et al.' : ''}`);
            }

            // Year
            if (result.year) {
                metadata.push(`Year: ${result.year}`);
            }

            // Venue
            if (result.venue) {
                metadata.push(`Venue: ${result.venue}`);
            }

            // Citations
            if (result.citationCount) {
                metadata.push(`Citations: ${result.citationCount}`);
            }

            const content = metadata.length > 0
                ? `${metadata.join(' | ')}\n\n${abstract}`
                : abstract;

            results.push({
                url,
                title,
                content,
                engine: 'semantic_scholar'
            });
        }

        return results;
    }
};
