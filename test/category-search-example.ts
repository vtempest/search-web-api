/**
 * Example: Multi-Category Search with Weighted Results
 *
 * This example demonstrates how to use the TypeScript search API to:
 * 1. Search across multiple categories
 * 2. Combine results from different search engines
 * 3. Apply weighted ranking based on engine and category
 *
 * Based on the Python SearXNG implementation
 */

import { Search } from '../app/lib/search.js';

async function main() {
    const search = new Search();

    console.log('=== Search Web API - Category-Based Search Example ===\n');

    // Example 1: Search a single category
    console.log('Example 1: Search only General web engines');
    console.log('Query: "typescript"');
    const generalResults = await search.searchByCategories('typescript', ['general']);
    console.log(`Found ${generalResults.length} results from general category`);
    console.log('Top 3 results:');
    generalResults.slice(0, 3).forEach((result, i) => {
        console.log(`  ${i + 1}. [${result.category}] ${result.title}`);
        console.log(`     Score: ${result.score.toFixed(2)}, Engines: ${result.engines.join(', ')}`);
        console.log(`     URL: ${result.url || result.link}\n`);
    });

    console.log('\n' + '='.repeat(80) + '\n');

    // Example 2: Search multiple categories and combine results
    console.log('Example 2: Search across General + IT + Academic categories');
    console.log('Query: "machine learning"');
    const multiCategoryResults = await search.searchByCategories(
        'machine learning',
        ['general', 'it', 'academic']
    );
    console.log(`Found ${multiCategoryResults.length} combined results`);

    // Show results grouped by category
    const byCategory = new Map<string, typeof multiCategoryResults>();
    for (const result of multiCategoryResults.slice(0, 20)) {
        const cat = result.category || 'unknown';
        if (!byCategory.has(cat)) {
            byCategory.set(cat, []);
        }
        byCategory.get(cat)!.push(result);
    }

    console.log('\nTop results by category:');
    for (const [category, results] of byCategory.entries()) {
        console.log(`\n  ${category.toUpperCase()} (${results.length} results):`);
        results.slice(0, 3).forEach((result, i) => {
            console.log(`    ${i + 1}. ${result.title}`);
            console.log(`       Score: ${result.score.toFixed(2)}, Engines: ${result.engines.join(', ')}`);
        });
    }

    console.log('\n' + '='.repeat(80) + '\n');

    // Example 3: Compare results from different categories
    console.log('Example 3: Comparing News vs General results');
    console.log('Query: "climate change"');

    const newsResults = await search.searchByCategories('climate change', ['news']);
    const generalResults2 = await search.searchByCategories('climate change', ['general']);

    console.log(`\nNews category: ${newsResults.length} results`);
    console.log('Top 3 news results:');
    newsResults.slice(0, 3).forEach((result, i) => {
        console.log(`  ${i + 1}. ${result.title} (Score: ${result.score.toFixed(2)})`);
    });

    console.log(`\nGeneral category: ${generalResults2.length} results`);
    console.log('Top 3 general results:');
    generalResults2.slice(0, 3).forEach((result, i) => {
        console.log(`  ${i + 1}. ${result.title} (Score: ${result.score.toFixed(2)})`);
    });

    console.log('\n' + '='.repeat(80) + '\n');

    // Example 4: Get category statistics
    console.log('Example 4: Category and Engine Statistics');
    const categoryStats = search.getCategoryStats();
    console.log('\nCategory Statistics:');
    console.log(`Total engines: ${categoryStats.totalEngines}`);
    console.log(`Total categories: ${categoryStats.categories}`);
    console.log('\nEngines per category:');
    for (const [category, count] of Object.entries(categoryStats.enginesByCategory)) {
        console.log(`  ${category}: ${count} engines`);
    }

    console.log('\n' + '='.repeat(80) + '\n');

    // Example 5: Understanding the weighted scoring
    console.log('Example 5: Understanding Weighted Scoring');
    console.log('Query: "python programming"');

    const results = await search.searchByCategories('python programming', ['general', 'it']);

    console.log('\nScoring breakdown for top 5 results:');
    results.slice(0, 5).forEach((result, i) => {
        console.log(`\n${i + 1}. ${result.title}`);
        console.log(`   Category: ${result.category}`);
        console.log(`   Score: ${result.score.toFixed(2)}`);
        console.log(`   Found by ${result.engines.length} engine(s): ${result.engines.join(', ')}`);
        console.log(`   Position(s): ${result.positions.join(', ')}`);
        console.log(`   URL: ${result.url || result.link}`);
    });

    console.log('\n' + '='.repeat(80) + '\n');

    // Example 6: Demonstrating result deduplication
    console.log('Example 6: Result Deduplication Across Engines');
    console.log('Query: "github"');

    const githubResults = await search.searchByCategories('github', ['general', 'it']);

    const mergedResults = githubResults.filter(r => r.engines.length > 1);
    console.log(`\nFound ${mergedResults.length} results that appeared in multiple engines:`);
    mergedResults.slice(0, 5).forEach((result, i) => {
        console.log(`\n${i + 1}. ${result.title}`);
        console.log(`   Merged from ${result.engines.length} engines: ${result.engines.join(', ')}`);
        console.log(`   Positions: ${result.positions.join(', ')}`);
        console.log(`   Final Score: ${result.score.toFixed(2)}`);
    });

    console.log('\n=== Example Complete ===\n');
}

// Run the examples
main().catch(error => {
    console.error('Error running examples:', error);
    process.exit(1);
});
