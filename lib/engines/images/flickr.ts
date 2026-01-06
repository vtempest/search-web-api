import { Engine, EngineResult, extractResponseData } from '../../engine.js';


export const flickr: Engine = {
    name: 'flickr',
    categories: ['images'],
    request: async (query: string, params: any = {}) => {
        const pageno = params.pageno || 1;

        const queryParams = new URLSearchParams({
            text: query
        });

        const url = `https://www.flickr.com/search?${queryParams.toString()}&page=${pageno}`;

        return await grab(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
            },
        responseType: 'text'
        });

    },
    response: async (response: any) => {
        const html = extractResponseData(response);
        const results: EngineResult[] = [];

        try {
            // Extract modelExport JSON data from the page
            const modelExportMatch = html.match(/^\s*modelExport:\s*({.*}),$m/m);
            if (!modelExportMatch) {
                return results;
            }

            const modelExport = JSON.parse(modelExportMatch[1]);

            if (!modelExport.legend || !modelExport.legend[0]) {
                return results;
            }

            const legend = modelExport.legend;

            for (const index of legend) {
                if (index.length !== 8) {
                    continue;
                }

                try {
                    const photo = modelExport.main[index[0]][parseInt(index[1])][index[2]][index[3]][index[4]][index[5]][parseInt(index[6])][index[7]];

                    const title = photo.title || '';
                    const description = photo.description || '';
                    const author = photo.realname || photo.username || '';

                    // Get the largest available image size
                    const imageSizes = ['o', 'k', 'h', 'b', 'c', 'z', 'm', 'n', 't', 'q', 's'];
                    let sizeData = null;

                    for (const size of imageSizes) {
                        if (photo.sizes?.data?.[size]?.data) {
                            sizeData = photo.sizes.data[size].data;
                            break;
                        }
                    }

                    if (!sizeData) {
                        continue;
                    }

                    const imgSrc = sizeData.url;
                    const resolution = `${sizeData.width} x ${sizeData.height}`;

                    // Get thumbnail
                    let thumbnail = imgSrc;
                    if (photo.sizes?.data?.n?.data?.url) {
                        thumbnail = photo.sizes.data.n.data.url;
                    } else if (photo.sizes?.data?.z?.data?.url) {
                        thumbnail = photo.sizes.data.z.data.url;
                    }

                    // Build URL
                    const url = photo.ownerNsid
                        ? `https://www.flickr.com/photos/${photo.ownerNsid}/${photo.id}`
                        : imgSrc;

                    const content = [
                        description,
                        author ? `Author: ${author}` : '',
                        `Resolution: ${resolution}`
                    ].filter(Boolean).join('\n');

                    results.push({
                        url,
                        title,
                        content,
                        thumbnail,
                        engine: 'flickr'
                    });
                } catch (e) {
                    // Skip invalid photo entries
                    continue;
                }
            }
        } catch (e) {
            console.error('Error parsing Flickr response:', e);
        }

        return results;
    }
};
