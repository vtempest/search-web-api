import { parseHTML } from "linkedom";
import grab from "grab-url";
import { EngineFunction } from "../../engine";

export const duckduckgo: EngineFunction = async (
  query: string,
  page: number | undefined
) =>
  (
    await grab("https://html.duckduckgo.com/html", {
      post: true,
      q: query,
      b: "",
      kl: "us-en",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept-Language": "en-US,en;q=0.9",
      },
      responseType: "text",
      onResponse(path: string, response: any) {
        const { document } = parseHTML(response);

        response.data = Array.from(document.querySelectorAll(".result"))
          .map((element) => {
            const link = element.querySelector(".result__title a");
            const url = link?.getAttribute("href") || "";
            const title = link?.textContent?.trim() || "";
            const content =
              element.querySelector(".result__snippet")?.textContent?.trim() ||
              "";

            return {
              url,
              title,
              content,
              engine: "duckduckgo",
            };
          })
          .filter((r) => r.url && r.title);

        return [path, response];
      },
    })
  )?.data;
