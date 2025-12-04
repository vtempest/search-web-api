import { Engine, EngineResult } from '../lib/engine';

export const crates: Engine = {
    name: 'crates',
    categories: ['it', 'packages'],
    request: async (query: string, params: any = {}) => {
        const pageno = params.pageno || 1;
        const per_page = 10;
        const url = `https://crates.io/api/v1/crates?q=${encodeURIComponent(query)}&page=${pageno}&per_page=${per_page}`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept': 'application/json'
            }
        });

        return await response.json();
    },
    response: async (json: any) => {
        const results: EngineResult[] = [];

        if (json && json.crates) {
            json.crates.forEach((crate: any) => {
                const name = crate.name;
                const version = crate.max_version || crate.newest_version;
                const description = crate.description || 'No description';
                const downloads = crate.downloads || 0;
                const recent_downloads = crate.recent_downloads || 0;

                results.push({
                    url: `https://crates.io/crates/${name}`,
                    title: `${name} ${version}`,
                    content: `${description} | 📥 ${downloads.toLocaleString()} total, ${recent_downloads.toLocaleString()} recent`,
                    engine: 'crates'
                });
            });
        }

        return results;
    }
};
