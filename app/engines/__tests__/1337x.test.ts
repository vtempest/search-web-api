import { describe, it, expect } from 'vitest';
import { torrent_1337x } from '../1337x';
import { validateEngineResults, TEST_QUERIES, retry } from '../../lib/test-utils';

describe('1337x Torrent Engine', () => {
    it('should return valid torrent results', async () => {
        const query = TEST_QUERIES.torrent[0]; // 'ubuntu'

        const html = await retry(() => torrent_1337x.request(query, { pageno: 1 }));
        const results = await torrent_1337x.response(html);

        expect(results).toBeDefined();
        expect(Array.isArray(results)).toBe(true);
        expect(validateEngineResults(results)).toBe(true);

        if (results.length > 0) {
            expect(results[0].engine).toBe('1337x');
            expect(results[0].url).toContain('1337x.to');
            expect(results[0].content).toContain('Seeds');
            expect(results[0].content).toContain('Size');
        }
    }, 30000);

    it('should extract torrent metadata', async () => {
        const query = 'debian';

        const html = await retry(() => torrent_1337x.request(query, { pageno: 1 }));
        const results = await torrent_1337x.response(html);

        expect(results).toBeDefined();
        if (results.length > 0) {
            expect(results[0].content).toMatch(/Seeds|Leeches|Size/);
        }
    }, 30000);
});
