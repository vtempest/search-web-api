import { Engine, EngineResult } from './engine.js';
import { engineStatusTracker } from './engine-status.js';
import { google } from '../engines/google';
import { bing } from '../engines/bing';
import { duckduckgo } from '../engines/duckduckgo';
import { wikipedia } from '../engines/wikipedia';
import { reddit } from '../engines/reddit';
import { yahoo } from '../engines/yahoo';
import { qwant } from '../engines/qwant';
import { startpage } from '../engines/startpage';
import { github } from '../engines/github';
import { youtube } from '../engines/youtube';
import { stackoverflow } from '../engines/stackoverflow';
import { npm } from '../engines/npm';
import { brave } from '../engines/brave';
import { genius } from '../engines/genius';
import { openstreetmap } from '../engines/openstreetmap';
import { unsplash } from '../engines/unsplash';
import { imdb } from '../engines/imdb';
import { google_scholar } from '../engines/google_scholar';
import { torrent_1337x } from '../engines/1337x';
import { thepiratebay } from '../engines/thepiratebay';
import { nyaa } from '../engines/nyaa';
import { yts } from '../engines/yts';
import { eztv } from '../engines/eztv';
import { twitter } from '../engines/twitter';
import { medium } from '../engines/medium';
import { archive } from '../engines/archive';
import { wikidata } from '../engines/wikidata';
import { soundcloud } from '../engines/soundcloud';
import { hackernews } from '../engines/hackernews';
import { yahoo_news } from '../engines/yahoo_news';
import { bing_news } from '../engines/bing_news';
import { arxiv } from '../engines/arxiv';
import { bing_images } from '../engines/bing_images';

export class Search {
    private engines: Engine[] = [
        google, bing, duckduckgo, wikipedia, reddit, yahoo, qwant, startpage,
        github, youtube, stackoverflow, npm, brave, genius, openstreetmap,
        unsplash, imdb, google_scholar,
        torrent_1337x, thepiratebay, nyaa, yts, eztv,
        twitter, medium, archive, wikidata, soundcloud,
        hackernews, yahoo_news, bing_news, arxiv, bing_images
    ];

    constructor() {
        // Initialize all engines in the status tracker
        this.engines.forEach(engine => {
            engineStatusTracker.initEngine(engine.name, engine.categories || []);
        });
    }

    async search(query: string, pageno: number = 1, engineNames?: string[], categories?: string[]): Promise<EngineResult[]> {
        const results: EngineResult[] = [];
        const urlMap = new Map<string, EngineResult>(); // For deduplication

        const promises = this.engines
            .filter(engine => {
                // Filter by health status
                if (!engineStatusTracker.isEngineHealthy(engine.name)) {
                    console.log(`Skipping unhealthy engine: ${engine.name}`);
                    return false;
                }

                if (engineNames && engineNames.length > 0) {
                    return engineNames.includes(engine.name);
                }
                if (categories && categories.length > 0) {
                    return engine.categories && engine.categories.some(cat => categories.includes(cat));
                }
                return true; // Default to all engines if no filter is provided
            })
            .map(async (engine) => {
                const startTime = Date.now();
                try {
                    const requestResult = await engine.request(query, { pageno });
                    const engineResults = await engine.response(requestResult);

                    const responseTime = Date.now() - startTime;
                    engineStatusTracker.recordSuccess(engine.name, responseTime, query);

                    // Add engine name to each result
                    engineResults.forEach(result => {
                        result.engine = engine.name;

                        // Deduplicate by URL within same category
                        const url = result.url || result.link;
                        if (url) {
                            const normalizedUrl = this.normalizeUrl(url);
                            const existing = urlMap.get(normalizedUrl);

                            if (!existing) {
                                // First occurrence of this URL
                                urlMap.set(normalizedUrl, result);
                                results.push(result);
                            } else {
                                // URL already exists from another engine
                                // Merge engine names if in same category
                                if (engine.categories?.some(cat =>
                                    this.getEngineByName(existing.engine || '')?.categories?.includes(cat)
                                )) {
                                    // Update existing result to show multiple engines
                                    existing.engine = `${existing.engine},${engine.name}`;
                                    console.log(`Deduplicated URL ${normalizedUrl} from engines: ${existing.engine}`);
                                } else {
                                    // Different category, allow duplicate
                                    results.push(result);
                                }
                            }
                        } else {
                            // No URL, can't deduplicate
                            results.push(result);
                        }
                    });
                } catch (error) {
                    const responseTime = Date.now() - startTime;
                    const errorMessage = error instanceof Error ? error.message : String(error);

                    engineStatusTracker.recordFailure(engine.name, errorMessage, responseTime, query);
                    console.error(`Error in engine ${engine.name}:`, errorMessage);
                }
            });

        await Promise.all(promises);
        return results;
    }

    /**
     * Normalize URL for deduplication (remove protocol, trailing slash, www, query params)
     */
    private normalizeUrl(url: string): string {
        try {
            const urlObj = new URL(url);
            let normalized = urlObj.hostname.replace(/^www\./, '') + urlObj.pathname;
            normalized = normalized.replace(/\/$/, ''); // Remove trailing slash
            return normalized.toLowerCase();
        } catch {
            // If URL parsing fails, return as-is
            return url.toLowerCase();
        }
    }

    /**
     * Get engine by name
     */
    private getEngineByName(name: string): Engine | undefined {
        return this.engines.find(e => e.name === name);
    }

    /**
     * Get all available engines
     */
    getEngines(): Engine[] {
        return this.engines;
    }

    /**
     * Get engine status
     */
    getEngineStatus(engineName: string) {
        return engineStatusTracker.getStatus(engineName);
    }

    /**
     * Get all engine statuses
     */
    getAllEngineStatuses() {
        return engineStatusTracker.getAllStatuses();
    }
}
