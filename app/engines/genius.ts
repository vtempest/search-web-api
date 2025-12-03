import { Engine, EngineResult } from '../lib/engine';
import * as cheerio from 'cheerio';

export const genius: Engine = {
    name: 'genius',
    categories: ['music'],
    request: async (query: string, params: any = {}) => {
        const url = `https://genius.com/api/search/multi?per_page=5&q=${encodeURIComponent(query)}`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
            }
        });

        return await response.json();
    },
    response: async (json: any) => {
        const results: EngineResult[] = [];

        if (json && json.response && json.response.sections) {
            json.response.sections.forEach((section: any) => {
                if (section.type === 'song' || section.type === 'lyric') {
                    section.hits.forEach((hit: any) => {
                        if (hit.result) {
                            results.push({
                                url: hit.result.url,
                                title: hit.result.full_title,
                                content: `Artist: ${hit.result.artist_names}`,
                                thumbnail: hit.result.song_art_image_thumbnail_url,
                                engine: 'genius'
                            });
                        }
                    });
                }
            });
        }

        return results;
    }
};
