import { Engine, EngineResult } from '../../lib/engine.js';
import grab from 'grab-url';
import { parseHTML } from 'linkedom';
export const arxiv: Engine = {
    name: 'arxiv',
    categories: ['science', 'academic'],
    request: async (query: string, params: any = {}) => {
        const pageno = params.pageno || 1;
        const maxResults = 10;
        const start = (pageno - 1) * maxResults;

        const queryParams = new URLSearchParams({
            search_query: `all:${query}`,
            start: String(start),
            max_results: String(maxResults),
        });

        const url = `https://export.arxiv.org/api/query?${queryParams.toString()}`;

        return await grab(url, {
            responseType: 'text',
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/atom+xml,application/xml,text/xml',
            }
        });

    },
    response: async (xml: string) => {
        const results: EngineResult[] = [];

        // Parse XML using cheerio
        const $ = cheerio.load(xml, { xmlMode: true });

        // Get all entry elements
        document.querySelectorAll('entry').forEach((entry) => {
            const entryElem = entry;

            // Extract title
            const title = ($entry.querySelectorAll('title')?.textContent?.trim() || \'\').replace(/\s+/g, ' ').trim();

            // Extract URL (id)
            const url = ($entry.querySelectorAll('id')?.textContent?.trim() || \'\');

            // Extract abstract (summary)
            let abstract = ($entry.querySelectorAll('summary')?.textContent?.trim() || \'\').replace(/\s+/g, ' ').trim();

            // Truncate abstract if too long
            if (abstract.length > 500) {
                abstract = abstract.substring(0, 500) + '...';
            }

            // Extract authors
            const authors: string[] = [];
            $entry.querySelectorAll('author name').each((j, authorName) => {
                authors.push(authorName.textContent?.trim() || \'\');
            });

            // Extract published date
            const publishedDate = ($entry.querySelectorAll('published')?.textContent?.trim() || \'\');

            // Extract categories (tags)
            const categories: string[] = [];
            $entry.querySelectorAll('category').each((j, cat) => {
                const term = cat.getAttribute('term');
                if (term) {
                    categories.push(term);
                }
            });

            // Build content with metadata
            const metadata: string[] = [];
            if (authors.length > 0) {
                metadata.push(`Authors: ${authors.slice(0, 3).join(', ')}${authors.length > 3 ? ' et al.' : ''}`);
            }
            if (publishedDate) {
                metadata.push(`Published: ${publishedDate.split('T')[0]}`);
            }
            if (categories.length > 0) {
                metadata.push(`Categories: ${categories.slice(0, 3).join(', ')}`);
            }

            const content = metadata.length > 0
                ? `${metadata.join(' | ')}\n\n${abstract}`
                : abstract;

            if (url && title) {
                results.push({
                    url,
                    title,
                    content,
                    engine: 'arxiv'
                });
            }
        });

        return results;
    }
};
