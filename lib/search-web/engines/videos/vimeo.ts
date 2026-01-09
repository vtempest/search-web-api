import grab from "grab-url";
import { EngineFunction } from "../../engine";

export const vimeo: EngineFunction = async (
  query: string,
  page: number | undefined
) =>
  (
    await grab(`https://vimeo.com/search`, {
      q: query,
      page: page || 1,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      responseType: "text",
      onResponse(path: string, response: any) {
        const results = [];
        const html = response;

        // If extractResponseData returned empty (due to error), return empty results
        if (!html || typeof html !== "string") {
          response.data = results;
          return [path, response];
        }

        try {
          // Extract JSON data from the page
          const dataMatch = html.match(/var data = ({.*?});/s);
          if (!dataMatch) {
            response.data = results;
            return [path, response];
          }

          const data = JSON.parse(dataMatch[1]);
          const filteredData = data?.filtered?.data || [];

          for (const resultItem of filteredData) {
            const type = resultItem.type;
            const result = resultItem[type];

            if (!result) continue;

            const videoId = result.uri?.split("/").pop();
            if (!videoId) continue;

            const url = `https://vimeo.com/${videoId}`;
            const title = result.name || "";
            const thumbnail =
              result.pictures?.sizes?.slice(-1)[0]?.link || "";
            const publishedDate = result.created_time || "";

            results.push({
              url,
              title,
              content: publishedDate
                ? `Published: ${publishedDate.split("T")[0]}`
                : "",
              thumbnail,
              engine: "vimeo",
            });
          }
        } catch (e) {
          console.error("Error parsing Vimeo response:", e);
        }

        response.data = results;
        return [path, response];
      },
    })
  )?.data;
