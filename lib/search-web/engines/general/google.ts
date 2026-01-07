import { parseHTML } from "linkedom";
import grab from "grab-url";
import { EngineFunction } from "../../engine";

export const google: EngineFunction = async (
  query: string,
  page: number | undefined
) =>
  (
    await grab("https://www.google.com/search", {
      q: encodeURIComponent(query),
      start: ((page || 1) - 1) * 10,
      gbv: 1,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        Cookie: "CONSENT=YES+; SOCS=CAESBQgYEgAgAA==",
      },
      responseType: "text",
      onResponse(path: string, response: any) {
        const { document } = parseHTML(response);

        response.data = Array.from(
          document.querySelectorAll(".Gx5Zad.fP1Qef.xpd.EtOod.pkphOe")
        )
          .map((element) => {
            const link = element.querySelector("a");
            const url = link?.getAttribute("href");

            let realUrl = url;
            if (url && url.startsWith("/url?q=")) {
              realUrl = url.split("/url?q=")[1].split("&")[0];
              realUrl = decodeURIComponent(realUrl);
            }

            const title =
              element.querySelector(".BNeawe.vvjwJb.AP7Wnd")?.textContent?.trim() ||
              "";
            const content =
              element.querySelector(".BNeawe.s3v9rd.AP7Wnd")?.textContent?.trim() ||
              "";

            return {
              url: realUrl,
              title,
              content,
              engine: "google",
            };
          })
          .filter((r) => r.url && r.title);

        return [path, response];
      },
    })
  )?.data;
