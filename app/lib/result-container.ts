import { EngineResult } from './engine.js';

export type PriorityType = 'low' | 'normal' | 'high';

export interface MergedResult extends EngineResult {
    engines: string[];
    positions: number[];
    score: number;
    priority: PriorityType;
    category?: string;
    template?: string;
    resultHash?: string;
}

export interface EngineWeight {
    [engineName: string]: number;
}

/**
 * ResultContainer - Manages search results from multiple engines
 * Based on SearXNG's results.py implementation
 *
 * Features:
 * - Result deduplication by URL hash
 * - Position-based scoring algorithm
 * - Engine weight consideration
 * - Result merging (combines duplicate results from different engines)
 * - Category-based grouping for better organization
 */
export class ResultContainer {
    private mainResultsMap: Map<string, MergedResult> = new Map();
    private mainResultsSorted: MergedResult[] | null = null;
    private closed: boolean = false;
    private engineWeights: EngineWeight = {};

    /**
     * Configure engine weights for scoring
     * Higher weight = more important results from this engine
     */
    setEngineWeights(weights: EngineWeight) {
        this.engineWeights = weights;
    }

    /**
     * Get the weight for a specific engine (default: 1.0)
     */
    private getEngineWeight(engineName: string): number {
        return this.engineWeights[engineName] || 1.0;
    }

    /**
     * Calculate a hash for a result to detect duplicates
     * Based on URL normalization
     */
    private calculateResultHash(result: EngineResult): string {
        const url = result.url || result.link || '';

        try {
            const urlObj = new URL(url);
            // Remove protocol, www, trailing slashes, and query params for better dedup
            let normalized = urlObj.hostname.replace(/^www\./, '') + urlObj.pathname;
            normalized = normalized.replace(/\/$/, '').toLowerCase();

            // Also include title in hash to differentiate pages with same path but different content
            const titlePart = (result.title || '').toLowerCase().replace(/\s+/g, '');

            return `${normalized}:${titlePart.substring(0, 50)}`;
        } catch {
            // Fallback for invalid URLs - use title or content
            const fallback = (result.title || result.content || url).toLowerCase();
            return fallback.replace(/\s+/g, '').substring(0, 100);
        }
    }

    /**
     * Merge two results when a duplicate is found
     * Implements the logic from merge_two_main_results in Python
     */
    private mergeTwoResults(origin: MergedResult, other: EngineResult): void {
        // Use content with more text
        if ((other.content || '').length > (origin.content || '').length) {
            origin.content = other.content;
        }

        // Use title with more text
        if ((other.title || '').length > (origin.title || '').length) {
            origin.title = other.title;
        }

        // Merge additional fields - prefer non-empty values
        if (!origin.img_src && other.img_src) {
            origin.img_src = other.img_src;
        }
        if (!origin.thumbnail && other.thumbnail) {
            origin.thumbnail = other.thumbnail;
        }
        if (!origin.publishedDate && other.publishedDate) {
            origin.publishedDate = other.publishedDate;
        }
        if (!origin.author && other.author) {
            origin.author = other.author;
        }

        // Prefer HTTPS URLs
        const originUrl = origin.url || origin.link || '';
        const otherUrl = other.url || other.link || '';
        if (originUrl && !originUrl.startsWith('https://') && otherUrl.startsWith('https://')) {
            origin.url = other.url;
            origin.link = other.link;
        }

        // Add engine to list of result-engines
        if (other.engine && !origin.engines.includes(other.engine)) {
            origin.engines.push(other.engine);
        }
    }

    /**
     * Add results from an engine
     *
     * @param engineName - Name of the engine providing results
     * @param results - Array of results from the engine
     */
    extend(engineName: string, results: EngineResult[]): void {
        if (this.closed) {
            console.warn('ResultContainer is closed, ignoring results from', engineName);
            return;
        }

        let mainCount = 0;

        for (const result of results) {
            mainCount++;
            this.mergeMainResult(result, mainCount, engineName);
        }
    }

    /**
     * Merge a main result into the container
     * Implements _merge_main_result from Python
     */
    private mergeMainResult(result: EngineResult, position: number, engineName: string): void {
        const resultHash = this.calculateResultHash(result);

        const existing = this.mainResultsMap.get(resultHash);

        if (!existing) {
            // New result - add it
            const mergedResult: MergedResult = {
                ...result,
                engine: engineName,
                engines: [engineName],
                positions: [position],
                score: 0,
                priority: (result as any).priority || 'normal',
                resultHash
            };

            this.mainResultsMap.set(resultHash, mergedResult);
        } else {
            // Duplicate found - merge it
            this.mergeTwoResults(existing, result);
            existing.positions.push(position);
        }
    }

    /**
     * Calculate score for a result
     * Implements calculate_score from Python
     *
     * Algorithm:
     * - weight starts at 1.0
     * - multiply by engine weight for each engine that found this result
     * - multiply by number of positions (appearances)
     * - for each position:
     *   - if priority is 'low': skip
     *   - if priority is 'high': add full weight
     *   - if priority is 'normal': add weight/position
     */
    private calculateScore(result: MergedResult): number {
        let weight = 1.0;

        // Apply engine weights
        for (const engineName of result.engines) {
            weight *= this.getEngineWeight(engineName);
        }

        // Multiply by number of occurrences
        weight *= result.positions.length;

        let score = 0;

        for (const position of result.positions) {
            if (result.priority === 'low') {
                continue; // Low priority doesn't contribute to score
            } else if (result.priority === 'high') {
                score += weight; // High priority gets full weight
            } else {
                // Normal priority: inverse position scoring
                // First result (position 1) gets full weight
                // Second result (position 2) gets half weight, etc.
                score += weight / position;
            }
        }

        return score;
    }

    /**
     * Close the container and calculate all scores
     * Must be called before getting ordered results
     */
    close(): void {
        if (this.closed) {
            return;
        }

        this.closed = true;

        // Calculate scores for all results
        for (const result of this.mainResultsMap.values()) {
            result.score = this.calculateScore(result);
        }
    }

    /**
     * Get ordered results with category grouping
     * Implements get_ordered_results from Python
     *
     * Two-pass algorithm:
     * 1. Sort by score (descending)
     * 2. Group results by category/template to cluster similar results together
     */
    getOrderedResults(): MergedResult[] {
        if (!this.closed) {
            this.close();
        }

        if (this.mainResultsSorted) {
            return this.mainResultsSorted;
        }

        // Pass 1: Sort by score (descending)
        const results = Array.from(this.mainResultsMap.values())
            .sort((a, b) => b.score - a.score);

        // Pass 2: Group results by category and template
        const groupedResults: MergedResult[] = [];
        const categoryPositions: Map<string, { index: number; count: number }> = new Map();

        const maxCount = 8; // Maximum results to group together
        const maxDistance = 20; // Maximum distance to look back for grouping

        for (const res of results) {
            // Determine category key for grouping
            // Group by: category + template + whether it has images
            const hasImage = !!(res.thumbnail || res.img_src);
            const categoryKey = `${res.category || 'general'}:${res.template || 'default'}:${hasImage ? 'img' : 'noimg'}`;

            const group = categoryPositions.get(categoryKey);

            // Try to group with previous results of the same category
            if (group && group.count > 0 && (groupedResults.length - group.index) < maxDistance) {
                // Insert at the group position
                const insertIndex = group.index;
                groupedResults.splice(insertIndex, 0, res);

                // Update all positions after this index
                for (const [key, value] of categoryPositions.entries()) {
                    if (value.index >= insertIndex) {
                        value.index += 1;
                    }
                }

                // Decrease count for this group
                group.count -= 1;
            } else {
                // Start a new group or append
                groupedResults.push(res);
                categoryPositions.set(categoryKey, {
                    index: groupedResults.length,
                    count: maxCount
                });
            }
        }

        this.mainResultsSorted = groupedResults;
        return this.mainResultsSorted;
    }

    /**
     * Get raw results without ordering (for debugging)
     */
    getRawResults(): MergedResult[] {
        return Array.from(this.mainResultsMap.values());
    }

    /**
     * Get statistics about the results
     */
    getStats() {
        const results = Array.from(this.mainResultsMap.values());

        return {
            totalResults: results.length,
            averageScore: results.reduce((sum, r) => sum + r.score, 0) / results.length || 0,
            engineCoverage: results.reduce((sum, r) => sum + r.engines.length, 0) / results.length || 0,
            duplicatesMerged: results.filter(r => r.engines.length > 1).length,
            categories: [...new Set(results.map(r => r.category).filter(Boolean))],
        };
    }
}
