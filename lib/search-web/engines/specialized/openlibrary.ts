import { Engine, EngineResult } from "../../engine.js";
import grab from "grab-url";

export const openlibrary: Engine = {
  name: "openlibrary",
  categories: ["specialized", "books"],
  request: async (query: string, params: any = {}) => {
    const pageno = params.pageno || 1;
    const limit = 10;

    return await grab("https://openlibrary.org/search.json", {
      q: query,
      page: pageno,
      limit: limit,
      fields: "*",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      },
      timeout: 10,
    });
  },
  response: async (json: any) => {
    const results: EngineResult[] = [];

    if (!json || !json.docs) {
      return results;
    }

    for (const item of json.docs) {
      const thumbnail = item.lending_identifier_s
        ? `https://archive.org/services/img/${item.lending_identifier_s}`
        : "";

      const authors = item.author_name ? item.author_name.join(", ") : "";
      const publishYear = item.first_publish_year || "";
      const isbn = item.isbn ? item.isbn.slice(0, 3).join(", ") : "";

      const content = [
        item.first_sentence ? item.first_sentence.join(" / ") : "",
        authors ? `Authors: ${authors}` : "",
        publishYear ? `First published: ${publishYear}` : "",
        isbn ? `ISBN: ${isbn}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      results.push({
        url: `https://openlibrary.org${item.key}`,
        title: item.title,
        content,
        engine: "openlibrary",
        thumbnail,
      });
    }

    return results;
  },
};
