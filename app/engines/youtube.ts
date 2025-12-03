import { Engine, EngineResult } from '../lib/engine';

// Multiple Invidious instances for fallback
const INVIDIOUS_INSTANCES = [
    'https://inv.nadeko.net',
    'https://invidious.privacyredirect.com',
    'https://yewtu.be',
    'https://invidious.nerdvpn.de',
    'https://inv.riverside.rocks'
];

async function tryInvidiousInstances(query: string, pageno: number): Promise<any> {
    for (const instance of INVIDIOUS_INSTANCES) {
        try {
            const url = `${instance}/api/v1/search?q=${encodeURIComponent(query)}&page=${pageno}&type=video`;

            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'HonoxSearX/1.0'
                },
                signal: AbortSignal.timeout(5000) // 5 second timeout
            });

            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            // Try next instance
            continue;
        }
    }

    throw new Error('All Invidious instances failed');
}

export const youtube: Engine = {
    name: 'youtube',
    categories: ['videos', 'music'],
    request: async (query: string, params: any = {}) => {
        const pageno = params.pageno || 1;
        return await tryInvidiousInstances(query, pageno);
    },
    response: async (json: any) => {
        const results: EngineResult[] = [];

        if (Array.isArray(json)) {
            json.forEach((item: any) => {
                if (item.type === 'video') {
                    const duration = item.lengthSeconds ?
                        `${Math.floor(item.lengthSeconds / 60)}:${String(item.lengthSeconds % 60).padStart(2, '0')}` : '';
                    const views = item.viewCount ? item.viewCount.toLocaleString() : '';
                    const published = item.publishedText || '';

                    results.push({
                        url: `https://www.youtube.com/watch?v=${item.videoId}`,
                        title: item.title,
                        content: `${item.description || ''} | ${duration} | ${views} views | ${published}`.trim(),
                        thumbnail: item.videoThumbnails && item.videoThumbnails.length > 0 ?
                            item.videoThumbnails[0].url : undefined,
                        engine: 'youtube'
                    });
                }
            });
        }

        return results;
    }
};
