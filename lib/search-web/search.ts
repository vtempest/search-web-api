import { Engine } from './engine.js';
import { engineStatusTracker } from './engine-status.js';
import { ResultContainer, MergedResult, CategoryWeight } from './result-container.js';
import { categoryRegistry, CATEGORIES } from './category-registry.js';

// General search engines
import { google } from './engines/general/google.js';
import { bing } from './engines/general/bing.js';
import { duckduckgo } from './engines/general/duckduckgo.js';
import { yahoo } from './engines/general/yahoo.js';
import { qwant } from './engines/general/qwant.js';
import { startpage } from './engines/general/startpage.js';
import { brave } from './engines/general/brave.js';
import { yandex } from './engines/general/yandex.js';
import { baidu } from './engines/general/baidu.js';
import { mojeek } from './engines/general/mojeek.js';

// IT/Developer engines
import { github } from './engines/it/github.js';
import { stackoverflow } from './engines/it/stackoverflow.js';
import { npm } from './engines/it/npm.js';
import { crates } from './engines/it/crates.js';
import { dockerhub } from './engines/it/dockerhub.js';
import { pypi } from './engines/it/pypi.js';
import { packagist } from './engines/it/packagist.js';
import { rubygems } from './engines/it/rubygems.js';
import { gitlab } from './engines/it/gitlab.js';

// Images engines
import { unsplash } from './engines/images/unsplash.js';
import { bing_images } from './engines/images/bing_images.js';
import { google_images } from './engines/images/google_images.js';
import { flickr } from './engines/images/flickr.js';
import { imgur } from './engines/images/imgur.js';
import { pixabay } from './engines/images/pixabay.js';
import { wallhaven } from './engines/images/wallhaven.js';
import { deviantart } from './engines/images/deviantart.js';
import { openclipart } from './engines/images/openclipart.js';

// Videos engines
import { youtube } from './engines/videos/youtube.js';
import { vimeo } from './engines/videos/vimeo.js';
import { dailymotion } from './engines/videos/dailymotion.js';
import { invidious } from './engines/videos/invidious.js';
import { peertube } from './engines/videos/peertube.js';
import { bing_videos } from './engines/videos/bing_videos.js';

// News engines
import { hackernews } from './engines/news/hackernews.js';
import { yahoo_news } from './engines/news/yahoo_news.js';
import { bing_news } from './engines/news/bing_news.js';
import { google_news } from './engines/news/google_news.js';

// Academic engines
import { google_scholar } from './engines/academic/google_scholar.js';
import { arxiv } from './engines/academic/arxiv.js';
import { wikidata } from './engines/academic/wikidata.js';
import { semantic_scholar } from './engines/academic/semantic_scholar.js';
import { crossref } from './engines/academic/crossref.js';
import { pubmed } from './engines/academic/pubmed.js';

// Torrent engines
import { torrent_1337x } from './engines/torrents/1337x.js';
import { thepiratebay } from './engines/torrents/thepiratebay.js';
import { nyaa } from './engines/torrents/nyaa.js';
import { yts } from './engines/torrents/yts.js';
import { eztv } from './engines/torrents/eztv.js';
import { solidtorrents } from './engines/torrents/solidtorrents.js';
import { kickass } from './engines/torrents/kickass.js';

// Social media engines
import { twitter } from './engines/social/twitter.js';
import { reddit } from './engines/social/reddit.js';
import { medium } from './engines/social/medium.js';
import { soundcloud } from './engines/social/soundcloud.js';
import { mastodon } from './engines/social/mastodon.js';

// Maps engines
import { openstreetmap } from './engines/maps/openstreetmap.js';
import { photon } from './engines/maps/photon.js';
import { apple_maps } from './engines/maps/apple_maps.js';

// Shopping engines
import { ebay } from './engines/shopping/ebay.js';

// Specialized engines
import { wikipedia } from './engines/specialized/wikipedia.js';
import { imdb } from './engines/specialized/imdb.js';
import { genius } from './engines/specialized/genius.js';
import { archive } from './engines/specialized/archive.js';
import { openlibrary } from './engines/specialized/openlibrary.js';
import { wttr } from './engines/specialized/wttr.js';
import { annas_archive } from './engines/specialized/annas_archive.js';
import { goodreads } from './engines/specialized/goodreads.js';

export class Search {
    private engines: Engine[] = [
        // General search (10)
        google, bing, duckduckgo, yahoo, qwant, startpage, brave, yandex, baidu, mojeek,
        // IT/Developer (9)
        github, gitlab, stackoverflow, npm, crates, dockerhub, pypi, packagist, rubygems,
        // Images (9)
        unsplash, bing_images, google_images, flickr, imgur, pixabay, wallhaven, deviantart, openclipart,
        // Videos (6)
        youtube, vimeo, dailymotion, bing_videos, invidious, peertube,
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
        // Initialize all engines in the status tracker and category registry
        this.engines.forEach(engine => {
            engineStatusTracker.initEngine(engine.name, engine.categories || []);
            categoryRegistry.registerEngine(engine);
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

        // Configure category weights from the CATEGORIES configuration
        const categoryWeights: CategoryWeight = {};
        for (const [key, config] of Object.entries(CATEGORIES)) {
            categoryWeights[key] = config.defaultWeight;
        }
        resultContainer.setCategoryWeights(categoryWeights);

        // Determine which engines to use based on filters
        let enginesToUse: Engine[];

        if (engineNames && engineNames.length > 0) {
            // Use specific engines by name
            enginesToUse = categoryRegistry.getEnginesByNames(engineNames);
        } else if (categories && categories.length > 0) {
            // Use engines from specific categories
            enginesToUse = categoryRegistry.getEnginesByCategories(categories);
        } else {
            // Use all engines
            enginesToUse = this.engines;
        }

        const promises = enginesToUse
            .filter(engine => {
                // Filter by health status
                if (!engineStatusTracker.isEngineHealthy(engine.name)) {
                    console.log(`Skipping unhealthy engine: ${engine.name}`);
                    return false;
                }
                return true;
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
     * Search by specific categories and combine results
     * This method demonstrates multi-category search with proper result combination
     *
     * @param query - Search query
     * @param categories - Array of categories to search (e.g., ['general', 'news', 'academic'])
     * @param pageno - Page number (default: 1)
     * @returns Combined and weighted results from all categories
     */
    async searchByCategories(query: string, categories: string[], pageno: number = 1): Promise<MergedResult[]> {
        return this.search(query, pageno, undefined, categories);
    }

    /**
     * Get all available engines
     */
    getEngines(): Engine[] {
        return this.engines;
    }

    /**
     * Get engines by category
     */
    getEnginesByCategory(category: string): Engine[] {
        return categoryRegistry.getCategoryEngines(category);
    }

    /**
     * Get all available categories
     */
    getCategories(): string[] {
        return categoryRegistry.getCategories();
    }

    /**
     * Get category statistics
     */
    getCategoryStats() {
        return categoryRegistry.getStats();
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
