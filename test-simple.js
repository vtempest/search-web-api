import { Search } from './app/lib/search.js';

const search = new Search();

console.log('Testing search for "linux"...');
const results = await search.search('linux', 1);

console.log(`Found ${results.length} results`);
console.log(`First result: ${results[0]?.title}`);
console.log('Test completed successfully!');
