import { Engine, EngineResult } from './engine.js';
import { engineStatusTracker } from './engine-status.js';

// General search engines
import { google } from '../engines/general/google';
import { bing } from '../engines/general/bing';
import { duckduckgo } from '../engines/general/duckduckgo';
import { yahoo } from '../engines/general/yahoo';
import { qwant } from '../engines/general/qwant';
import { startpage } from '../engines/general/startpage';
import { brave } from '../engines/general/brave';
import { yandex } from '../engines/general/yandex';

// IT/Developer engines
import { github } from '../engines/it/github';
import { stackoverflow } from '../engines/it/stackoverflow';
import { npm } from '../engines/it/npm';
import { crates } from '../engines/it/crates';
import { dockerhub } from '../engines/it/dockerhub';
import { pypi } from '../engines/it/pypi';
import { packagist } from '../engines/it/packagist';
import { rubygems } from '../engines/it/rubygems';

// Images engines
import { unsplash } from '../engines/images/unsplash';
import { bing_images } from '../engines/images/bing_images';
import { google_images } from '../engines/images/google_images';

// Videos engines
import { youtube } from '../engines/videos/youtube';
import { vimeo } from '../engines/videos/vimeo';
import { dailymotion } from '../engines/videos/dailymotion';

// News engines
import { hackernews } from '../engines/news/hackernews';
import { yahoo_news } from '../engines/news/yahoo_news';
import { bing_news } from '../engines/news/bing_news';

// Academic engines
import { google_scholar } from '../engines/academic/google_scholar';
import { arxiv } from '../engines/academic/arxiv';
import { wikidata } from '../engines/academic/wikidata';
import { semantic_scholar } from '../engines/academic/semantic_scholar';

// Torrent engines
import { torrent_1337x } from '../engines/torrents/1337x';
import { thepiratebay } from '../engines/torrents/thepiratebay';
import { nyaa } from '../engines/torrents/nyaa';
import { yts } from '../engines/torrents/yts';
import { eztv } from '../engines/torrents/eztv';

// Social media engines
import { twitter } from '../engines/social/twitter';
import { reddit } from '../engines/social/reddit';
import { medium } from '../engines/social/medium';
import { soundcloud } from '../engines/social/soundcloud';

// Maps engines
import { openstreetmap } from '../engines/maps/openstreetmap';

// Specialized engines
import { wikipedia } from '../engines/specialized/wikipedia';
import { imdb } from '../engines/specialized/imdb';
import { genius } from '../engines/specialized/genius';
import { archive } from '../engines/specialized/archive';

export class Search {
    private engines: Engine[] = [
        // General search
        google, bing, duckduckgo, yahoo, qwant, startpage, brave, yandex,
        // IT/Developer
        github, stackoverflow, npm, crates, dockerhub, pypi, packagist, rubygems,
        // Images
        unsplash, bing_images, google_images,
        // Videos
        youtube, vimeo, dailymotion,
        // News
        hackernews, yahoo_news, bing_news,
        // Academic
        google_scholar, arxiv, wikidata, semantic_scholar,
        // Torrents
        torrent_1337x, thepiratebay, nyaa, yts, eztv,
        // Social
        twitter, reddit, medium, soundcloud,
        // Maps
        openstreetmap,
        // Specialized
        wikipedia, imdb, genius, archive
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
