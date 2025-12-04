import { Engine, EngineResult } from '../../lib/engine.js';
import grab from 'grab-url';

// Weather condition mapping
const WWO_TO_CONDITION: Record<string, string> = {
    "113": "clear sky",
    "116": "partly cloudy",
    "119": "cloudy",
    "122": "fair",
    "143": "fair",
    "176": "light rain showers",
    "179": "light snow showers",
    "248": "fog",
    "260": "fog",
    "263": "light rain showers",
    "296": "light rain",
    "302": "rain",
    "308": "heavy rain",
    "323": "light snow showers",
    "332": "heavy snow",
    "386": "rain showers and thunder"
};

export const wttr: Engine = {
    name: 'wttr',
    categories: ['specialized', 'weather'],
    request: async (query: string, params: any = {}) => {
        const lang = params.lang || 'en';
        const url = `https://wttr.in/${encodeURIComponent(query)}?format=j1&lang=${lang}`;

        return await grab(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
            }
        });
    },
    response: async (json: any) => {
        const results: EngineResult[] = [];

        if (!json || !json.current_condition) {
            return results;
        }

        const current = json.current_condition[0];
        const weatherCode = current.weatherCode || "";
        const condition = WWO_TO_CONDITION[weatherCode] || "unknown";

        const content = [
            `Temperature: ${current.temp_C || current.tempC}°C (Feels like: ${current.FeelsLikeC}°C)`,
            `Condition: ${condition}`,
            `Humidity: ${current.humidity}%`,
            `Wind: ${current.windspeedKmph} km/h from ${current.winddirDegree}°`,
            `Pressure: ${current.pressure} hPa`,
            `Cloud cover: ${current.cloudcover}%`
        ].filter(Boolean).join('\n');

        // Add current weather
        results.push({
            url: `https://wttr.in/${json.nearest_area?.[0]?.areaName?.[0]?.value || 'weather'}`,
            title: `Weather in ${json.nearest_area?.[0]?.areaName?.[0]?.value || 'Unknown Location'}`,
            content,
            engine: 'wttr'
        });

        // Add forecast
        if (json.weather && Array.isArray(json.weather)) {
            for (const day of json.weather.slice(0, 3)) { // Only next 3 days
                const date = day.date;
                const hourly = day.hourly || [];

                if (hourly.length > 0) {
                    const forecast = hourly[Math.floor(hourly.length / 2)]; // Middle of day
                    const forecastCondition = WWO_TO_CONDITION[forecast.weatherCode] || "unknown";

                    const forecastContent = [
                        `Temperature: ${forecast.tempC}°C`,
                        `Condition: ${forecastCondition}`,
                        `Humidity: ${forecast.humidity}%`,
                        `Wind: ${forecast.windspeedKmph} km/h`
                    ].join(' | ');

                    results.push({
                        url: `https://wttr.in/${json.nearest_area?.[0]?.areaName?.[0]?.value || 'weather'}`,
                        title: `Forecast for ${date}`,
                        content: forecastContent,
                        engine: 'wttr'
                    });
                }
            }
        }

        return results;
    }
};
