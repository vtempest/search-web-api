import grab from "grab-url";
import { EngineFunction } from "../../engine";

export const pypi: EngineFunction = async (
  query: string,
  page: number | undefined
) =>
  (
    await grab(`https://pypi.org/search/`, {
      q: query,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      },
      onResponse(path: string, response: any) {
        const html = response.data || response;
        const results = [];

        // PyPI search uses a simple structure
        const packageRegex =
          /<a class="package-snippet"[^>]*href="([^"]+)"[^>]*>[\s\S]*?<span class="package-snippet__name">([^<]+)<\/span>[\s\S]*?<span class="package-snippet__version">([^<]+)<\/span>[\s\S]*?<p class="package-snippet__description">([^<]*)<\/p>/g;

        let match;
        while ((match = packageRegex.exec(html)) !== null) {
          const [, url, name, version, description] = match;

          results.push({
            url: `https://pypi.org${url}`,
            title: `${name.trim()} ${version.trim()}`,
            content: description.trim() || "No description available",
            engine: "pypi",
          });
        }

        response.data = results;
        return [path, response];
      },
    })
  )?.data;
