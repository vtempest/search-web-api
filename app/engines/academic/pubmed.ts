import { Engine, EngineResult } from '../../lib/engine.js';
import grab from 'grab-url';
import * as cheerio from 'cheerio';

export const pubmed: Engine = {
    name: 'pubmed',
    categories: ['academic', 'science'],
    request: async (query: string, params: any = {}) => {
        const pageno = params.pageno || 1;
        const number_of_results = 10;
        const retstart = (pageno - 1) * number_of_results;

        // Step 1: Search for PMIDs
        const esearchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retstart=${retstart}&hits=${number_of_results}`;

        const esearchData = await grab(esearchUrl, {
            responseType: 'text',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
            }
        });

        // Parse XML to get PMIDs
        const $ = cheerio.load(esearchData, { xmlMode: true });
        const pmids: string[] = [];
        $('Id').each((_, elem) => {
            const pmid = $(elem).text();
            if (pmid) pmids.push(pmid);
        });

        if (pmids.length === 0) {
            return { pmids: [] };
        }

        // Step 2: Fetch full article data
        const efetchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&retmode=xml&id=${pmids.join(',')}`;

        return await grab(efetchUrl, {
            responseType: 'text',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
            }
        });
    },
    response: async (data: any) => {
        const results: EngineResult[] = [];

        if (!data || typeof data !== 'string') {
            return results;
        }

        const $ = cheerio.load(data, { xmlMode: true });

        $('PubmedArticle').each((_, article) => {
            const $article = $(article);

            const title = $article.find('ArticleTitle').first().text() || '';
            const pmid = $article.find('PMID').first().text() || '';
            const url = `https://www.ncbi.nlm.nih.gov/pubmed/${pmid}`;

            const abstract = $article.find('AbstractText').text() || '';
            const journal = $article.find('Journal Title').first().text() || '';
            const doi = $article.find('ELocationID[EIdType="doi"]').first().text() || '';

            // Parse authors
            const authors: string[] = [];
            $article.find('AuthorList Author').each((_, author) => {
                const $author = $(author);
                const firstName = $author.find('ForeName').text();
                const lastName = $author.find('LastName').text();
                const authorName = `${firstName} ${lastName}`.trim();
                if (authorName) authors.push(authorName);
            });

            const content = [
                abstract,
                journal ? `Journal: ${journal}` : '',
                authors.length ? `Authors: ${authors.join(', ')}` : '',
                doi ? `DOI: ${doi}` : ''
            ].filter(Boolean).join('\n');

            results.push({
                url,
                title,
                content,
                engine: 'pubmed'
            });
        });

        return results;
    }
};
