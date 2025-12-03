import { describe, it, expect } from 'vitest';
import { github } from '../github';
import { validateEngineResults, TEST_QUERIES, retry } from '../../lib/test-utils';

describe('GitHub Engine', () => {
    it('should return valid results for a code query', async () => {
        const query = TEST_QUERIES.code[0]; // 'react hooks'

        const json = await retry(() => github.request(query, { pageno: 1 }));
        const results = await github.response(json);

        expect(results).toBeDefined();
        expect(Array.isArray(results)).toBe(true);
        expect(validateEngineResults(results)).toBe(true);

        if (results.length > 0) {
            expect(results[0].engine).toBe('github');
            expect(results[0].url).toContain('github.com');
            expect(results[0].title).toBeTruthy();
        }
    }, 30000);

    it('should return repository information', async () => {
        const query = 'nodejs express';

        const json = await retry(() => github.request(query, { pageno: 1 }));
        const results = await github.response(json);

        expect(results).toBeDefined();
        if (results.length > 0) {
            expect(results[0].url).toBeTruthy();
            expect(results[0].content).toBeTruthy();
        }
    }, 30000);
});
