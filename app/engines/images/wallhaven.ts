import { Engine, EngineResult } from '../../lib/engine.js';
import grab from 'grab-url';

export const wallhaven: Engine = {
    name: 'wallhaven',
    categories: ['images'],
    request: async (query: string, params: any = {}) => {
        const pageno = params.pageno || 1;
        const purity = '100';  // SFW only by default

        const url = `https://wallhaven.cc/api/v1/search?q=${encodeURIComponent(query)}&page=${pageno}&purity=${purity}`;

        return await grab(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
            }
        });
    },
    response: async (response: any) => {
        const results: EngineResult[] = [];
        const json = response.data || response;

        if (!json || !json.data) {
            return results;
        }

        for (const result of json.data) {
            const fileSize = result.file_size ? `${(result.file_size / 1024 / 1024).toFixed(2)} MB` : '';
            const content = [
                `${result.category} / ${result.purity}`,
                result.resolution ? `Resolution: ${result.resolution}` : '',
                fileSize ? `Size: ${fileSize}` : '',
                result.file_type ? `Format: ${result.file_type}` : ''
            ].filter(Boolean).join(' | ');

            results.push({
                url: result.url,
                title: result.resolution || 'Wallpaper',
                content,
                engine: 'wallhaven',
                img_src: result.path,
                thumbnail: result.thumbs?.small || result.thumbs?.original
            });
        }

        return results;
    }
};
