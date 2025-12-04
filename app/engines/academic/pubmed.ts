import { Engine, EngineResult } from '../../lib/engine.js';
import grab from 'grab-url';
import { parseHTML } from 'linkedom';

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
        document.querySelectorAll('Id').forEach((elem) => {
            const pmid = elem.textContent;
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

        document.querySelectorAll('PubmedArticle').forEach((article) => {
            const articleElem = article;

            const title = $article.querySelector('ArticleTitle').textContent || '';
            const pmid = $article.querySelector('PMID').textContent || '';
            const url = `https://www.ncbi.nlm.nih.gov/pubmed/${pmid}`;

            const abstract = $article.querySelectorAll('AbstractText').textContent || '';
            const journal = $article.querySelector('Journal Title').textContent || '';
            const doi = $article.querySelector('ELocationID[EIdType="doi"]').textContent || '';

            // Parse authors
            const authors: string[] = [];
            $article.querySelectorAll('AuthorList Author').each((_, author) => {
                const authorElem = author;
                const firstName = $author.querySelectorAll('ForeName').textContent;
                const lastName = $author.querySelectorAll('LastName').textContent;
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
