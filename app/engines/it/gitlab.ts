import { Engine, EngineResult, extractResponseData } from '../../lib/engine';
import grab from 'grab-url';

/**
 * GitLab Search Engine
 *
 * Searches GitLab.com and other GitLab instances for:
 * - Projects and repositories
 * - Project descriptions
 * - Star counts and popularity
 * - Maintainer information
 */
export const gitlab: Engine = {
    name: 'gitlab',
    categories: ['it', 'repos'],
    request: async (query: string, params: any = {}) => {
        const pageno = params.pageno || 1;
        const baseUrl = params.base_url || 'https://gitlab.com';
        const apiPath = params.api_path || 'api/v4/projects';

        const queryParams = new URLSearchParams({
            search: query,
            page: String(pageno),
        });

        const url = `${baseUrl}/${apiPath}?${queryParams.toString()}`;

        return await grab(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json',
            },
            responseType: 'json'
        });
    },
    response: async (response: any) => {
        const data = extractResponseData(response);
        const results: EngineResult[] = [];

        if (!Array.isArray(data)) {
            return results;
        }

        for (const item of data) {
            try {
                const result: EngineResult = {
                    url: item.web_url || '',
                    title: item.name || '',
                    content: item.description || '',
                    thumbnail: item.avatar_url,
                    publishedDate: new Date(item.last_activity_at || item.created_at),
                    engine: 'gitlab'
                };

                // Add extra fields
                (result as any).template = 'packages';
                (result as any).package_name = item.name;
                (result as any).maintainer = item.namespace?.name;
                (result as any).tags = item.tag_list || [];
                (result as any).popularity = item.star_count;
                (result as any).homepage = item.readme_url;
                (result as any).source_code_url = item.http_url_to_repo;

                results.push(result);
            } catch (error) {
                // Skip malformed results
                continue;
            }
        }

        return results;
    }
};
