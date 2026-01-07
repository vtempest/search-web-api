import grab from "grab-url";
import { EngineFunction } from "../../engine";
import { parseHTML } from "linkedom";

export const kickass: EngineFunction = async (
  query: string,
  page: number | undefined
) =>
  (
    await grab(
      `https://kickasstorrents.to/usearch/${encodeURIComponent(query)}/${page || 1}/`,
      {
        responseType: "text",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        },
        onResponse(path: string, response: any) {
          const results: any[] = [];
          const data = response.data || response;

          if (!data || typeof data !== "string") {
            response.data = results;
            return [path, response];
          }

          const { document } = parseHTML(data);

          document.querySelectorAll("table.data tr").forEach((element, i) => {
            // Skip header row
            if (i === 0) return;

            const rowElem = element;
            const $link = rowElem.querySelectorAll("a.cellMainLink");

            if (!$link.length) return;

            const href = $link[0]?.getAttribute("href");
            const title = $link[0]?.textContent?.trim() || "";
            const description = rowElem.querySelector("span.font11px.lightgrey.block")?.textContent?.trim() || "";
            const seed = parseInt(rowElem.querySelector("td.green")?.textContent?.trim() || "") || 0;
            const leech = parseInt(rowElem.querySelector("td.red")?.textContent?.trim() || "") || 0;
            const filesize = rowElem.querySelector("td.nobr")?.textContent?.trim() || "";

            const content = [
              description,
              filesize ? `Size: ${filesize}` : "",
              `Seeds: ${seed}`,
              `Leeches: ${leech}`,
            ]
              .filter(Boolean)
              .join(" | ");

            results.push({
              url: `https://kickasstorrents.to${href}`,
              title,
              content,
              engine: "kickass",
            });
          });

          response.data = results;
          return [path, response];
        },
      }
    )
  )?.data;
