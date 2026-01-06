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

        const esearchResponse = await grab(esearchUrl, {
            responseType: 'text',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
            }
        });

        // Parse XML to get PMIDs using linkedom
        const esearchData = esearchResponse.data || esearchResponse;
        const { document } = parseHTML(esearchData);
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
    response: async (response: any) => {
        const results: EngineResult[] = [];
        const data = response.data || response;

        if (!data || typeof data !== 'string') {
            return results;
        }

        // Parse XML using linkedom
        const { document } = parseHTML(data);

        document.querySelectorAll('PubmedArticle').forEach((article) => {
            const title = article.querySelector('ArticleTitle')?.textContent || '';
            const pmid = article.querySelector('PMID')?.textContent || '';
            const url = `https://www.ncbi.nlm.nih.gov/pubmed/${pmid}`;

            // Get abstract text
            const abstractElements = article.querySelectorAll('AbstractText');
            const abstract = Array.from(abstractElements).map(el => el.textContent).join(' ');

            const journal = article.querySelector('Journal Title')?.textContent || '';
            const doi = article.querySelector('ELocationID[EIdType="doi"]')?.textContent || '';

            // Parse authors
            const authors: string[] = [];
            article.querySelectorAll('AuthorList Author').forEach((author) => {
                const firstName = author.querySelector('ForeName')?.textContent || '';
                const lastName = author.querySelector('LastName')?.textContent || '';
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
