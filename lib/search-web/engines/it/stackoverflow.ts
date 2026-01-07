import grab from "grab-url";
import { EngineFunction } from "../../engine";

export const stackoverflow: EngineFunction = async (
  query: string,
  page: number | undefined
) =>
  (
    await grab(
      `https://api.stackexchange.com/2.3/search?order=desc&sort=relevance&q=${encodeURIComponent(query)}&site=stackoverflow&page=${page || 1}&pagesize=10`,
      {
        headers: {
          "User-Agent": "HonoxSearX/1.0",
        },
        onResponse(path: string, response: any) {
          const results = [];

          if (response.data && response.data.items) {
            response.data.items.forEach((item: any) => {
              results.push({
                url: item.link,
                title: item.title,
                content: item.tags ? `Tags: ${item.tags.join(", ")}` : "",
                engine: "stackoverflow",
              });
            });
          }

          response.data = results;
          return [path, response];
        },
      }
    )
  )?.data;
