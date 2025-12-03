import { describe, it, expect } from 'vitest';
import { nyaa } from '../nyaa';
import { validateEngineResults, TEST_QUERIES, retry } from '../../lib/test-utils';

describe('Nyaa Anime Torrent Engine', () => {
    it('should return valid anime torrent results', async () => {
        const query = TEST_QUERIES.anime[0]; // 'one piece'

        const html = await retry(() => nyaa.request(query, { pageno: 1 }));
        const results = await nyaa.response(html);

        expect(results).toBeDefined();
        expect(Array.isArray(results)).toBe(true);
        expect(validateEngineResults(results)).toBe(true);

        if (results.length > 0) {
            expect(results[0].engine).toBe('nyaa');
            expect(results[0].url).toContain('magnet:');
            expect(results[0].content).toContain('Category');
        }
    }, 30000);

    it('should extract category information', async () => {
        const query = 'naruto';

        const html = await retry(() => nyaa.request(query, { pageno: 1 }));
        const results = await nyaa.response(html);

        expect(results).toBeDefined();
        if (results.length > 0) {
            expect(results[0].content).toMatch(/Category|Seeds|Size/);
        }
    }, 30000);
});
