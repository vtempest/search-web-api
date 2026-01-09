import { EngineFunction, EngineResult } from "./engine.js";
import { engineStatusTracker } from "./engine-status.js";
import {
  ResultContainer,
  MergedResult,
  CategoryWeight,
} from "./result-container.js";
import { categoryRegistry, CATEGORIES } from "./category-registry.js";

// General search engines
import { google } from "./engines/general/google.js";
import { bing } from "./engines/general/bing.js";
import { duckduckgo } from "./engines/general/duckduckgo.js";
import { yahoo } from "./engines/general/yahoo.js";
import { qwant } from "./engines/general/qwant.js";
import { startpage } from "./engines/general/startpage.js";
import { brave } from "./engines/general/brave.js";
import { yandex } from "./engines/general/yandex.js";
import { baidu } from "./engines/general/baidu.js";
import { mojeek } from "./engines/general/mojeek.js";

// IT/Developer engines
import { github } from "./engines/it/github.js";
import { stackoverflow } from "./engines/it/stackoverflow.js";
import { npm } from "./engines/it/npm.js";
import { crates } from "./engines/it/crates.js";
import { dockerhub } from "./engines/it/dockerhub.js";
import { pypi } from "./engines/it/pypi.js";
import { packagist } from "./engines/it/packagist.js";
import { rubygems } from "./engines/it/rubygems.js";
import { gitlab } from "./engines/it/gitlab.js";

// Images engines
import { unsplash } from "./engines/images/unsplash.js";
import { bing_images } from "./engines/images/bing_images.js";
import { google_images } from "./engines/images/google_images.js";
import { flickr } from "./engines/images/flickr.js";
import { imgur } from "./engines/images/imgur.js";
import { pixabay } from "./engines/images/pixabay.js";
import { wallhaven } from "./engines/images/wallhaven.js";
import { deviantart } from "./engines/images/deviantart.js";
import { openclipart } from "./engines/images/openclipart.js";

// Videos engines
import { youtube } from "./engines/videos/youtube.js";
import { vimeo } from "./engines/videos/vimeo.js";
import { dailymotion } from "./engines/videos/dailymotion.js";
import { invidious } from "./engines/videos/invidious.js";
import { peertube } from "./engines/videos/peertube.js";
import { bing_videos } from "./engines/videos/bing_videos.js";

// News engines
import { hackernews } from "./engines/news/hackernews.js";
import { yahoo_news } from "./engines/news/yahoo_news.js";
import { bing_news } from "./engines/news/bing_news.js";
import { google_news } from "./engines/news/google_news.js";

// Academic engines
import { google_scholar } from "./engines/academic/google_scholar.js";
import { arxiv } from "./engines/academic/arxiv.js";
import { wikidata } from "./engines/academic/wikidata.js";
import { semantic_scholar } from "./engines/academic/semantic_scholar.js";
import { crossref } from "./engines/academic/crossref.js";
import { pubmed } from "./engines/academic/pubmed.js";

// Torrent engines
import { torrent_1337x } from "./engines/torrents/1337x.js";
import { thepiratebay } from "./engines/torrents/thepiratebay.js";
import { nyaa } from "./engines/torrents/nyaa.js";
import { yts } from "./engines/torrents/yts.js";
import { eztv } from "./engines/torrents/eztv.js";
import { solidtorrents } from "./engines/torrents/solidtorrents.js";
import { kickass } from "./engines/torrents/kickass.js";

// Social media engines
import { twitter } from "./engines/social/twitter.js";
import { reddit } from "./engines/social/reddit.js";
import { medium } from "./engines/social/medium.js";
import { soundcloud } from "./engines/social/soundcloud.js";
import { mastodon } from "./engines/social/mastodon.js";

// Maps engines
import { openstreetmap } from "./engines/maps/openstreetmap.js";
import { photon } from "./engines/maps/photon.js";
import { apple_maps } from "./engines/maps/apple_maps.js";

// Shopping engines
import { ebay } from "./engines/shopping/ebay.js";

// Specialized engines
import { wikipedia } from "./engines/specialized/wikipedia.js";
import { imdb } from "./engines/specialized/imdb.js";
import { genius } from "./engines/specialized/genius.js";
import { archive } from "./engines/specialized/archive.js";
import { openlibrary } from "./engines/specialized/openlibrary.js";
import { wttr } from "./engines/specialized/wttr.js";
import { annas_archive } from "./engines/specialized/annas_archive.js";
import { goodreads } from "./engines/specialized/goodreads.js";

interface EngineMetadata {
  name: string;
  fn: EngineFunction;
  categories: string[];
}

export class Search {
  private engines: EngineMetadata[] = [
    // General search (10)
    { name: "google", fn: google, categories: ["general"] },
    { name: "bing", fn: bing, categories: ["general"] },
    { name: "duckduckgo", fn: duckduckgo, categories: ["general"] },
    { name: "yahoo", fn: yahoo, categories: ["general"] },
    { name: "qwant", fn: qwant, categories: ["general"] },
    { name: "startpage", fn: startpage, categories: ["general"] },
    { name: "brave", fn: brave, categories: ["general"] },
    { name: "yandex", fn: yandex, categories: ["general"] },
    { name: "baidu", fn: baidu, categories: ["general"] },
    { name: "mojeek", fn: mojeek, categories: ["general"] },
    // IT/Developer (9)
    { name: "github", fn: github, categories: ["it"] },
    { name: "gitlab", fn: gitlab, categories: ["it"] },
    { name: "stackoverflow", fn: stackoverflow, categories: ["it"] },
    { name: "npm", fn: npm, categories: ["it"] },
    { name: "crates", fn: crates, categories: ["it"] },
    { name: "dockerhub", fn: dockerhub, categories: ["it"] },
    { name: "pypi", fn: pypi, categories: ["it"] },
    { name: "packagist", fn: packagist, categories: ["it"] },
    { name: "rubygems", fn: rubygems, categories: ["it"] },
    // Images (9)
    { name: "unsplash", fn: unsplash, categories: ["images"] },
    { name: "bing_images", fn: bing_images, categories: ["images"] },
    { name: "google_images", fn: google_images, categories: ["images"] },
    { name: "flickr", fn: flickr, categories: ["images"] },
    { name: "imgur", fn: imgur, categories: ["images"] },
    { name: "pixabay", fn: pixabay, categories: ["images"] },
    { name: "wallhaven", fn: wallhaven, categories: ["images"] },
    { name: "deviantart", fn: deviantart, categories: ["images"] },
    { name: "openclipart", fn: openclipart, categories: ["images"] },
    // Videos (6)
    { name: "youtube", fn: youtube, categories: ["videos"] },
    { name: "vimeo", fn: vimeo, categories: ["videos"] },
    { name: "dailymotion", fn: dailymotion, categories: ["videos"] },
    { name: "bing_videos", fn: bing_videos, categories: ["videos"] },
    { name: "invidious", fn: invidious, categories: ["videos"] },
    { name: "peertube", fn: peertube, categories: ["videos"] },
    // News (4)
    { name: "hackernews", fn: hackernews, categories: ["news"] },
    { name: "yahoo_news", fn: yahoo_news, categories: ["news"] },
    { name: "bing_news", fn: bing_news, categories: ["news"] },
    { name: "google_news", fn: google_news, categories: ["news"] },
    // Academic (6)
    { name: "google_scholar", fn: google_scholar, categories: ["academic"] },
    { name: "arxiv", fn: arxiv, categories: ["academic"] },
    { name: "wikidata", fn: wikidata, categories: ["academic"] },
    { name: "semantic_scholar", fn: semantic_scholar, categories: ["academic"] },
    { name: "crossref", fn: crossref, categories: ["academic"] },
    { name: "pubmed", fn: pubmed, categories: ["academic"] },
    // Torrents (7)
    { name: "1337x", fn: torrent_1337x, categories: ["torrents"] },
    { name: "thepiratebay", fn: thepiratebay, categories: ["torrents"] },
    { name: "nyaa", fn: nyaa, categories: ["torrents"] },
    { name: "yts", fn: yts, categories: ["torrents"] },
    { name: "eztv", fn: eztv, categories: ["torrents"] },
    { name: "solidtorrents", fn: solidtorrents, categories: ["torrents"] },
    { name: "kickass", fn: kickass, categories: ["torrents"] },
    // Social (5)
    { name: "twitter", fn: twitter, categories: ["social"] },
    { name: "reddit", fn: reddit, categories: ["social"] },
    { name: "medium", fn: medium, categories: ["social"] },
    { name: "soundcloud", fn: soundcloud, categories: ["social"] },
    { name: "mastodon", fn: mastodon, categories: ["social"] },
    // Maps (3)
    { name: "openstreetmap", fn: openstreetmap, categories: ["maps"] },
    { name: "photon", fn: photon, categories: ["maps"] },
    { name: "apple_maps", fn: apple_maps, categories: ["maps"] },
    // Shopping (1)
    { name: "ebay", fn: ebay, categories: ["shopping"] },
    // Specialized (8)
    { name: "wikipedia", fn: wikipedia, categories: ["specialized"] },
    { name: "imdb", fn: imdb, categories: ["specialized"] },
    { name: "genius", fn: genius, categories: ["specialized"] },
    { name: "archive", fn: archive, categories: ["specialized"] },
    { name: "openlibrary", fn: openlibrary, categories: ["specialized"] },
    { name: "wttr", fn: wttr, categories: ["specialized"] },
    { name: "annas_archive", fn: annas_archive, categories: ["specialized"] },
    { name: "goodreads", fn: goodreads, categories: ["specialized"] },
  ];

  constructor() {
    // Initialize all engines in the status tracker and category registry
    this.engines.forEach((engine) => {
      engineStatusTracker.initEngine(engine.name, engine.categories);
      categoryRegistry.registerEngine({
        name: engine.name,
        categories: engine.categories,
        request: async () => {},
        response: async () => [],
      });
    });
  }

  async search(
    query: string,
    pageno: number = 1,
    engineNames?: string[],
    categories?: string[]
  ): Promise<MergedResult[]> {
    // Create a new result container for this search
    const resultContainer = new ResultContainer();

    const encodedQuery = encodeURIComponent(query).trim();

    // Configure engine weights (you can customize these based on engine quality/reliability)
    const engineWeights: { [key: string]: number } = {
      google: 1.5,
      bing: 1.3,
      duckduckgo: 1.2,
      brave: 1.1,
      startpage: 1.1,
      // Academic engines get higher weight for quality
      google_scholar: 1.4,
      semantic_scholar: 1.3,
      arxiv: 1.3,
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
    let enginesToUse: EngineMetadata[];

    if (engineNames && engineNames.length > 0) {
      // Use specific engines by name
      enginesToUse = this.engines.filter((engine) =>
        engineNames.includes(engine.name)
      );
    } else if (categories && categories.length > 0) {
      // Use engines from specific categories
      enginesToUse = this.engines.filter((engine) =>
        engine.categories.some((cat) => categories.includes(cat))
      );
    } else {
      // Use all engines
      enginesToUse = this.engines;
    }

    const promises = enginesToUse
      .filter((engine) => {
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
          const engineResults = await engine.fn(encodedQuery, pageno);

          const responseTime = Date.now() - startTime;
          engineStatusTracker.recordSuccess(engine.name, responseTime, query);

          // Add category to each result from engine's categories
          if (engineResults && Array.isArray(engineResults)) {
            engineResults.forEach((result) => {
              if (!result.category && engine.categories.length > 0) {
                result.category = engine.categories[0];
              }
            });

            // Add results to container (handles deduplication and merging)
            resultContainer.extend(engine.name, engineResults);
          }
        } catch (error) {
          const responseTime = Date.now() - startTime;
          const errorMessage =
            error instanceof Error ? error.message : String(error);

          engineStatusTracker.recordFailure(
            engine.name,
            errorMessage,
            responseTime,
            query
          );
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
    console.log(
      `Search "${query}": ${stats.totalResults} results, ${
        stats.duplicatesMerged
      } merged, avg ${stats.engineCoverage.toFixed(1)} engines/result`
    );

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
  async searchByCategories(
    query: string,
    categories: string[],
    pageno: number = 1
  ): Promise<MergedResult[]> {
    return this.search(query, pageno, undefined, categories);
  }

  /**
   * Get all available engines
   */
  getEngines(): string[] {
    return this.engines.map((e) => e.name);
  }

  /**
   * Get engines by category
   */
  getEnginesByCategory(category: string): string[] {
    return this.engines
      .filter((e) => e.categories.includes(category))
      .map((e) => e.name);
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
