import { Engine, EngineResult } from '../../lib/engine.js';

export const photon: Engine = {
    name: 'photon',
    categories: ['maps'],
    request: async (query: string, params: any = {}) => {
        const limit = 10;

        const queryParams = new URLSearchParams({
            q: query,
            limit: String(limit),
            lang: 'en',
        });

        const url = `https://photon.komoot.io/api/?${queryParams.toString()}`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json',
            }
        });

        return await response.json();
    },
    response: async (data: any) => {
        const results: EngineResult[] = [];

        const features = data.features || [];

        for (const feature of features) {
            const properties = feature.properties;

            if (!properties) {
                continue;
            }

            const name = properties.name || '';
            const osmType = properties.osm_type;

            // Map OSM type to string
            let osmTypeStr = '';
            if (osmType === 'N') osmTypeStr = 'node';
            else if (osmType === 'W') osmTypeStr = 'way';
            else if (osmType === 'R') osmTypeStr = 'relation';
            else continue;

            const osmId = properties.osm_id;
            const url = `https://openstreetmap.org/${osmTypeStr}/${osmId}`;

            // Build address
            const addressParts: string[] = [];
            if (properties.street) addressParts.push(properties.street);
            if (properties.housenumber) addressParts.push(properties.housenumber);
            if (properties.city) addressParts.push(properties.city);
            if (properties.postcode) addressParts.push(properties.postcode);
            if (properties.country) addressParts.push(properties.country);

            // Get coordinates
            const geometry = feature.geometry;
            const coordinates = geometry?.coordinates || [];
            const lon = coordinates[0];
            const lat = coordinates[1];

            const content = [
                addressParts.join(', '),
                properties.type ? `Type: ${properties.type}` : '',
                coordinates.length === 2 ? `Coordinates: ${lat}, ${lon}` : ''
            ].filter(Boolean).join('\n');

            results.push({
                url,
                title: name,
                content,
                engine: 'photon'
            });
        }

        return results;
    }
};
