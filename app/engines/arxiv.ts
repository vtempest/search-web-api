import { Engine, EngineResult } from '../lib/engine.js';
import * as cheerio from 'cheerio';
import { extractText } from '../lib/utils.js';

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

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/atom+xml,application/xml,text/xml',
            }
        });

        return await response.text();
    },
    response: async (xml: string) => {
        const results: EngineResult[] = [];

        // Parse XML using cheerio
        const $ = cheerio.load(xml, { xmlMode: true });

        // Get all entry elements
        $('entry').each((i, entry) => {
            const $entry = $(entry);

            // Extract title
            const title = extractText($entry.find('title')).replace(/\s+/g, ' ').trim();

            // Extract URL (id)
            const url = extractText($entry.find('id'));

            // Extract abstract (summary)
            let abstract = extractText($entry.find('summary')).replace(/\s+/g, ' ').trim();

            // Truncate abstract if too long
            if (abstract.length > 500) {
                abstract = abstract.substring(0, 500) + '...';
            }

            // Extract authors
            const authors: string[] = [];
            $entry.find('author name').each((j, authorName) => {
                authors.push($(authorName).text().trim());
            });

            // Extract published date
            const publishedDate = extractText($entry.find('published'));

            // Extract categories (tags)
            const categories: string[] = [];
            $entry.find('category').each((j, cat) => {
                const term = $(cat).attr('term');
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
