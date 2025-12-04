import { Engine, EngineResult } from '../../lib/engine.js';

export const mastodon: Engine = {
    name: 'mastodon',
    categories: ['social'],
    request: async (query: string, params: any = {}) => {
        const baseUrl = 'https://mastodon.social';
        const pageSize = 40;

        const queryParams = new URLSearchParams({
            q: query,
            resolve: 'false',
            type: 'accounts', // can be: accounts, hashtags, statuses
            limit: String(pageSize),
        });

        const url = `${baseUrl}/api/v2/search?${queryParams.toString()}`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json',
            }
        });

        return await response.json();
    },
    response: async (data: any) => {
        const results: EngineResult[] = [];

        const accounts = data.accounts || [];

        for (const account of accounts) {
            const url = account.uri || account.url;
            const username = account.username || '';
            const displayName = account.display_name || username;
            const followersCount = account.followers_count || 0;
            const note = account.note || '';

            // Strip HTML tags from note
            const cleanNote = note.replace(/<[^>]*>/g, '').trim();

            const title = `${displayName} (@${username})`;
            const content = `Followers: ${followersCount}\n${cleanNote}`;

            const thumbnail = account.avatar || account.avatar_static;

            results.push({
                url,
                title,
                content,
                thumbnail,
                engine: 'mastodon'
            });
        }

        return results;
    }
};
