import { describe, it, expect } from 'vitest';
import { google } from '../google';
import { validateEngineResults, TEST_QUERIES, retry } from '../../lib/test-utils';

describe('Google Engine', () => {
    it('should return valid results for a general query', async () => {
        const query = TEST_QUERIES.general[0]; // 'javascript'

        const html = await retry(() => google.request(query, { pageno: 1 }));
        const results = await google.response(html);

        expect(results).toBeDefined();
        expect(Array.isArray(results)).toBe(true);
        expect(validateEngineResults(results)).toBe(true);

        if (results.length > 0) {
            expect(results[0].engine).toBe('google');
            expect(results[0].title).toBeTruthy();
            expect(results[0].content).toBeTruthy();
        }
    }, 30000);

    it('should handle pagination', async () => {
        const query = 'python programming';

        const html = await retry(() => google.request(query, { pageno: 2 }));
        const results = await google.response(html);

        expect(results).toBeDefined();
        expect(Array.isArray(results)).toBe(true);
    }, 30000);
});
