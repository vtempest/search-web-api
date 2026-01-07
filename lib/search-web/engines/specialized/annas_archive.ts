import grab from "grab-url";
import { EngineFunction, EngineResult } from "../../engine";
import { parseHTML } from "linkedom";

export const annas_archive: EngineFunction = async (
  query: string,
  page: number | undefined
) =>
  (
    await grab("https://annas-archive.org/search", {
      responseType: "text",
      q: query,
      page: page || 1,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      },
      timeout: 10,
      onResponse(path: string, response: any) {
        const results: EngineResult[] = [];

        if (!response || typeof response !== "string") {
          response.data = results;
          return [path, response];
        }

        const { document } = parseHTML(response);

        document
          .querySelectorAll("main div.js-aarecord-list-outer > div")
          .forEach((element) => {
            const elElem = element;

            const href = elElem.querySelector("a")?.getAttribute("href");
            if (!href) return;

            const url = `https://annas-archive.org${href}`;
            const title =
              elElem.querySelector('a[href^="/md5"]')?.textContent?.trim() || "";
            const author =
              elElem.querySelector('a[href^="/search"]')?.textContent?.trim() || "";
            const publisher =
              elElem
                .querySelectorAll('a[href^="/search"]')[1]
                ?.textContent?.trim() || "";
            const description =
              elElem.querySelector("div.relative")?.textContent?.trim() || "";
            const thumbnail =
              elElem.querySelector("img")?.getAttribute("src") || undefined;

            const content = [
              description,
              author ? `Author: ${author}` : "",
              publisher ? `Publisher: ${publisher}` : "",
            ]
              .filter(Boolean)
              .join("\n");

            results.push({
              url,
              title,
              content,
              engine: "annas_archive",
              thumbnail,
            });
          });

        response.data = results;
        return [path, response];
      },
    })
  )?.data;
