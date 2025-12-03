import { describe, it, expect } from 'vitest';
import { thepiratebay } from '../thepiratebay';
import { validateEngineResults, TEST_QUERIES, retry } from '../../lib/test-utils';

describe('ThePirateBay Torrent Engine', () => {
    it('should return valid torrent results', async () => {
        const query = TEST_QUERIES.torrent[0]; // 'ubuntu'

        const html = await retry(() => thepiratebay.request(query, { pageno: 1 }));
        const results = await thepiratebay.response(html);

        expect(results).toBeDefined();
        expect(Array.isArray(results)).toBe(true);
        expect(validateEngineResults(results)).toBe(true);

        if (results.length > 0) {
            expect(results[0].engine).toBe('thepiratebay');
            expect(results[0].url).toContain('magnet:');
            expect(results[0].content).toContain('Seeds');
        }
    }, 30000);

    it('should extract magnet links', async () => {
        const query = 'linux mint';

        const html = await retry(() => thepiratebay.request(query, { pageno: 1 }));
        const results = await thepiratebay.response(html);

        expect(results).toBeDefined();
        if (results.length > 0) {
            expect(results[0].url).toMatch(/^magnet:\?xt=urn:btih:/);
        }
    }, 30000);
});
