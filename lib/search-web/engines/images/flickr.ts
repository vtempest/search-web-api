import grab from "grab-url";
import { EngineFunction } from "../../engine";

export const flickr: EngineFunction = async (
  query: string,
  page: number | undefined
) =>
  (
    await grab("https://www.flickr.com/search", {
      text: query,
      page: page || 1,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
        },
        responseType: "text",
        onResponse(path: string, response: any) {
          const html = response?.data || response;

          if (!html || typeof html !== "string") {
            response.data = [];
            return [path, response];
          }

          try {
            const modelExportMatch = html.match(/^\s*modelExport:\s*({.*}),$m/m);
            if (!modelExportMatch) {
              response.data = [];
              return [path, response];
            }

            const modelExport = JSON.parse(modelExportMatch[1]);

            if (!modelExport.legend || !modelExport.legend[0]) {
              response.data = [];
              return [path, response];
            }

            const legend = modelExport.legend;

            response.data = legend
              .map((index: any) => {
                if (index.length !== 8) {
                  return null;
                }

                try {
                  const photo =
                    modelExport.main[index[0]][parseInt(index[1])][index[2]][
                      index[3]
                    ][index[4]][index[5]][parseInt(index[6])][index[7]];

                  const title = photo.title || "";
                  const description = photo.description || "";
                  const author = photo.realname || photo.username || "";

                  const imageSizes = [
                    "o",
                    "k",
                    "h",
                    "b",
                    "c",
                    "z",
                    "m",
                    "n",
                    "t",
                    "q",
                    "s",
                  ];
                  let sizeData = null;

                  for (const size of imageSizes) {
                    if (photo.sizes?.data?.[size]?.data) {
                      sizeData = photo.sizes.data[size].data;
                      break;
                    }
                  }

                  if (!sizeData) {
                    return null;
                  }

                  const imgSrc = sizeData.url;
                  const resolution = `${sizeData.width} x ${sizeData.height}`;

                  let thumbnail = imgSrc;
                  if (photo.sizes?.data?.n?.data?.url) {
                    thumbnail = photo.sizes.data.n.data.url;
                  } else if (photo.sizes?.data?.z?.data?.url) {
                    thumbnail = photo.sizes.data.z.data.url;
                  }

                  const url = photo.ownerNsid
                    ? `https://www.flickr.com/photos/${photo.ownerNsid}/${photo.id}`
                    : imgSrc;

                  const content = [
                    description,
                    author ? `Author: ${author}` : "",
                    `Resolution: ${resolution}`,
                  ]
                    .filter(Boolean)
                    .join("\n");

                  return {
                    url,
                    title,
                    content,
                    thumbnail,
                    engine: "flickr",
                  };
                } catch (e) {
                  return null;
                }
              })
              .filter((r: any) => r !== null);
          } catch (e) {
            console.error("Error parsing Flickr response:", e);
            response.data = [];
          }

          return [path, response];
        },
      }
    )
  )?.data;
