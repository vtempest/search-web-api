import { parseHTML } from "linkedom";
import grab from "grab-url";
import { EngineFunction } from "../../engine";

export const bing: EngineFunction = async (
  query: string,
  page: number | undefined
) =>
  (
    await grab("https://www.bing.com/search", {
      q: encodeURIComponent(query),
      first: ((page || 1) - 1) * 10 + 1,
      responseType: "text",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        Cookie: "CONSENT=YES+",
      },
      onResponse(path: string, response: any) {
        const { document } = parseHTML(response);

        response.data = Array.from(document.querySelectorAll("li.b_algo"))
          .map((element) => {
            const link = element.querySelector("h2 a");
            const url = link?.getAttribute("href") || "";
            const title = link?.textContent?.trim() || "";
            const content =
              element.querySelector(".b_caption p")?.textContent?.trim() || "";

            return {
              url,
              title,
              content,
              engine: "bing",
            };
          })
          .filter((r) => r.url && r.title);

        return [path, response];
      },
    })
  )?.data;
