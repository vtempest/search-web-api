import { parseHTML } from "linkedom";
import grab from "grab-url";
import { EngineFunction } from "../../engine";

export const mojeek: EngineFunction = async (
  query: string,
  page: number | undefined
) =>
  (
    await grab(
      `https://www.mojeek.com/search?q=${encodeURIComponent(query)}&s=${
        10 * ((page || 1) - 1)
      }&safe=0`,
      {
        responseType: "text",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        onResponse(path: string, response: any) {
          if (!response || typeof response !== "string") {
            response.data = [];
            return [path, response];
          }

          const { document } = parseHTML(response);

          response.data = Array.from(
            document.querySelectorAll("ul.results-standard li a.ob")
          )
            .map((element) => {
              const url = element.getAttribute("href") || "";
              const parent = element.parentElement;
              const title =
                parent?.querySelector("h2 a")?.textContent?.trim() || "";
              const content =
                parent?.querySelector("p.s")?.textContent?.trim() || "";

              return {
                url,
                title,
                content,
                engine: "mojeek",
              };
            })
            .filter((r) => r.url && r.title);

          return [path, response];
        },
      }
    )
  )?.data;
