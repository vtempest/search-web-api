import { Engine } from './engine.js';
import { engineStatusTracker } from './engine-status.js';
import { ResultContainer, MergedResult } from './result-container.js';

// General search engines
import { google } from '../engines/general/google';
import { bing } from '../engines/general/bing';
import { duckduckgo } from '../engines/general/duckduckgo';
import { yahoo } from '../engines/general/yahoo';
import { qwant } from '../engines/general/qwant';
import { startpage } from '../engines/general/startpage';
import { brave } from '../engines/general/brave';
import { yandex } from '../engines/general/yandex';
import { baidu } from '../engines/general/baidu';
import { mojeek } from '../engines/general/mojeek';

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
import { flickr } from '../engines/images/flickr';
import { imgur } from '../engines/images/imgur';
import { pixabay } from '../engines/images/pixabay';
import { wallhaven } from '../engines/images/wallhaven';
import { deviantart } from '../engines/images/deviantart';
import { openclipart } from '../engines/images/openclipart';

// Videos engines
import { youtube } from '../engines/videos/youtube';
import { vimeo } from '../engines/videos/vimeo';
import { dailymotion } from '../engines/videos/dailymotion';
import { invidious } from '../engines/videos/invidious';
import { peertube } from '../engines/videos/peertube';

// News engines
import { hackernews } from '../engines/news/hackernews';
import { yahoo_news } from '../engines/news/yahoo_news';
import { bing_news } from '../engines/news/bing_news';
import { google_news } from '../engines/news/google_news';

// Academic engines
import { google_scholar } from '../engines/academic/google_scholar';
import { arxiv } from '../engines/academic/arxiv';
import { wikidata } from '../engines/academic/wikidata';
import { semantic_scholar } from '../engines/academic/semantic_scholar';
import { crossref } from '../engines/academic/crossref';
import { pubmed } from '../engines/academic/pubmed';

// Torrent engines
import { torrent_1337x } from '../engines/torrents/1337x';
import { thepiratebay } from '../engines/torrents/thepiratebay';
import { nyaa } from '../engines/torrents/nyaa';
import { yts } from '../engines/torrents/yts';
import { eztv } from '../engines/torrents/eztv';
import { solidtorrents } from '../engines/torrents/solidtorrents';
import { kickass } from '../engines/torrents/kickass';

// Social media engines
import { twitter } from '../engines/social/twitter';
import { reddit } from '../engines/social/reddit';
import { medium } from '../engines/social/medium';
import { soundcloud } from '../engines/social/soundcloud';
import { mastodon } from '../engines/social/mastodon';

// Maps engines
import { openstreetmap } from '../engines/maps/openstreetmap';
import { photon } from '../engines/maps/photon';
import { apple_maps } from '../engines/maps/apple_maps';

// Shopping engines
import { ebay } from '../engines/shopping/ebay';

// Specialized engines
import { wikipedia } from '../engines/specialized/wikipedia';
import { imdb } from '../engines/specialized/imdb';
import { genius } from '../engines/specialized/genius';
import { archive } from '../engines/specialized/archive';
import { openlibrary } from '../engines/specialized/openlibrary';
import { wttr } from '../engines/specialized/wttr';
import { annas_archive } from '../engines/specialized/annas_archive';
import { goodreads } from '../engines/specialized/goodreads';

export class Search {
    private engines: Engine[] = [
        // General search (10)
        google, bing, duckduckgo, yahoo, qwant, startpage, brave, yandex, baidu, mojeek,
        // IT/Developer (8)
        github, stackoverflow, npm, crates, dockerhub, pypi, packagist, rubygems,
        // Images (9)
        unsplash, bing_images, google_images, flickr, imgur, pixabay, wallhaven, deviantart, openclipart,
        // Videos (5)
        youtube, vimeo, dailymotion, invidious, peertube,
        // News (4)
        hackernews, yahoo_news, bing_news, google_news,
        // Academic (6)
        google_scholar, arxiv, wikidata, semantic_scholar, crossref, pubmed,
        // Torrents (7)
        torrent_1337x, thepiratebay, nyaa, yts, eztv, solidtorrents, kickass,
        // Social (5)
        twitter, reddit, medium, soundcloud, mastodon,
        // Maps (3)
        openstreetmap, photon, apple_maps,
        // Shopping (1)
        ebay,
        // Specialized (8)
        wikipedia, imdb, genius, archive, openlibrary, wttr, annas_archive, goodreads
    ];

    constructor() {
        // Initialize all engines in the status tracker
        this.engines.forEach(engine => {
            engineStatusTracker.initEngine(engine.name, engine.categories || []);
        });
    }

    async search(query: string, pageno: number = 1, engineNames?: string[], categories?: string[]): Promise<MergedResult[]> {
        // Create a new result container for this search
        const resultContainer = new ResultContainer();

        // Configure engine weights (you can customize these based on engine quality/reliability)
        const engineWeights: { [key: string]: number } = {
            'google': 1.5,
            'bing': 1.3,
            'duckduckgo': 1.2,
            'brave': 1.1,
            'startpage': 1.1,
            // Academic engines get higher weight for quality
            'google_scholar': 1.4,
            'semantic_scholar': 1.3,
            'arxiv': 1.3,
            // Default weight for others: 1.0
        };
        resultContainer.setEngineWeights(engineWeights);

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

                    // Add category to each result from engine's categories
                    engineResults.forEach(result => {
                        if (!result.category && engine.categories && engine.categories.length > 0) {
                            result.category = engine.categories[0];
                        }
                    });

                    // Add results to container (handles deduplication and merging)
                    resultContainer.extend(engine.name, engineResults);

                } catch (error) {
                    const responseTime = Date.now() - startTime;
                    const errorMessage = error instanceof Error ? error.message : String(error);

                    engineStatusTracker.recordFailure(engine.name, errorMessage, responseTime, query);
                    console.error(`Error in engine ${engine.name}:`, errorMessage);
                }
            });

        await Promise.all(promises);

        // Close container to calculate scores
        resultContainer.close();

        // Get ordered and grouped results
        const orderedResults = resultContainer.getOrderedResults();

        // Log statistics
        const stats = resultContainer.getStats();
        console.log(`Search "${query}": ${stats.totalResults} results, ${stats.duplicatesMerged} merged, avg ${stats.engineCoverage.toFixed(1)} engines/result`);

        return orderedResults;
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
