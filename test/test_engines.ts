
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/search';
const QUERY = 'test';

const engines = ['google', 'bing', 'duckduckgo', 'wikipedia', 'reddit'];

async function testEngine(engine: string) {
    try {
        const url = `${BASE_URL}?q=${QUERY}&engines=${engine}&format=json`;
        console.log(`Testing ${engine}...`);
        const response = await fetch(url);

        if (response.status !== 200) {
            console.error(`[FAILED] ${engine}: HTTP ${response.status}`);
            return;
        }

        const data = await response.json();
        if (data.results && data.results.length > 0) {
            console.log(`[SUCCESS] ${engine}: Found ${data.results.length} results.`);
        } else {
            console.warn(`[WARNING] ${engine}: No results found (possibly blocked).`);
        }
    } catch (error) {
        console.error(`[ERROR] ${engine}: ${error.message}`);
    }
}

async function runTests() {
    console.log('Starting engine verification...');
    for (const engine of engines) {
        await testEngine(engine);
    }
    console.log('Verification complete.');
}

runTests();
