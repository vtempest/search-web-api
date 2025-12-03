import { Engine, EngineResult } from './engine.js';
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

export class Search {
    private engines: Engine[] = [
        google, bing, duckduckgo, wikipedia, reddit, yahoo, qwant, startpage,
        github, youtube, stackoverflow, npm, brave, genius, openstreetmap,
        unsplash, imdb, google_scholar,
        torrent_1337x, thepiratebay, nyaa, yts, eztv,
        twitter, medium, archive, wikidata, soundcloud
    ];

    constructor() {
    }

    async search(query: string, pageno: number = 1, engineNames?: string[], categories?: string[]): Promise<EngineResult[]> {
        const results: EngineResult[] = [];
        const promises = this.engines
            .filter(engine => {
                if (engineNames && engineNames.length > 0) {
                    return engineNames.includes(engine.name);
                }
                if (categories && categories.length > 0) {
                    return engine.categories && engine.categories.some(cat => categories.includes(cat));
                }
                return true; // Default to all engines if no filter is provided
            })
            .map(async (engine) => {
                try {
                    const requestResult = await engine.request(query, { pageno });
                    const engineResults = await engine.response(requestResult);
                    results.push(...engineResults);
                } catch (error) {
                    console.error(`Error in engine ${engine.name}:`, error);
                }
            });

        await Promise.all(promises);
        return results;
    }
}
