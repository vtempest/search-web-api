import { Engine, EngineResult } from '../lib/engine';
import grab from 'grab-url';

export const yts: Engine = {
    name: 'yts',
    categories: ['files', 'torrent', 'movies'],
    request: async (query: string, params: any = {}) => {
        const pageno = params.pageno || 1;
        const url = `https://yts.mx/api/v2/list_movies.json?query_term=${encodeURIComponent(query)}&page=${pageno}&limit=20`;

        return await grab(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
            }
        });

    },
    response: async (json: any) => {
        const results: EngineResult[] = [];

        if (json && json.data && json.data.movies) {
            json.data.movies.forEach((movie: any) => {
                const title = movie.title_long || movie.title;
                const rating = movie.rating || 'N/A';
                const year = movie.year || '';
                const genres = movie.genres ? movie.genres.join(', ') : '';

                // Create a result for each torrent quality
                if (movie.torrents && movie.torrents.length > 0) {
                    movie.torrents.forEach((torrent: any) => {
                        const quality = torrent.quality || '';
                        const size = torrent.size || '';
                        const seeds = torrent.seeds || 0;
                        const peers = torrent.peers || 0;
                        const magnetLink = `magnet:?xt=urn:btih:${torrent.hash}&dn=${encodeURIComponent(title)}&tr=udp://open.demonii.com:1337/announce&tr=udp://tracker.openbittorrent.com:80&tr=udp://tracker.coppersurfer.tk:6969&tr=udp://glotorrents.pw:6969/announce&tr=udp://tracker.opentrackr.org:1337/announce&tr=udp://torrent.gresille.org:80/announce&tr=udp://p4p.arenabg.com:1337&tr=udp://tracker.leechers-paradise.org:6969`;

                        results.push({
                            url: magnetLink,
                            title: `${title} [${quality}]`,
                            content: `Rating: ${rating}/10, Year: ${year}, Size: ${size}, Seeds: ${seeds}, Peers: ${peers}, Genres: ${genres}`,
                            thumbnail: movie.medium_cover_image,
                            engine: 'yts'
                        });
                    });
                }
            });
        }

        return results;
    }
};
