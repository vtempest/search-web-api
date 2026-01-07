import { parseHTML } from "linkedom";
import grab from "grab-url";
import { EngineFunction } from "../../engine";

export const brave: EngineFunction = async (
  query: string,
  page: number | undefined
) =>
  (
    await grab(
      `https://search.brave.com/search?q=${encodeURIComponent(query)}&page=${
        page || 1
      }`,
      {
        responseType: "text",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
        onResponse(path: string, response: any) {
          const { document } = parseHTML(response);

          response.data = Array.from(document.querySelectorAll(".snippet"))
            .map((element) => {
              const link = element.querySelector("a");
              const url = link?.getAttribute("href") || "";
              const title =
                element.querySelector(".title")?.textContent?.trim() || "";
              const content =
                element
                  .querySelector(".snippet-description, .snippet-content")
                  ?.textContent?.trim() || "";

              return {
                url,
                title,
                content,
                engine: "brave",
              };
            })
            .filter((r) => r.url && r.title);

          return [path, response];
        },
      }
    )
  )?.data;
