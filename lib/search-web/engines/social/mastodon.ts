import grab from "grab-url";
import { EngineFunction, EngineResult } from "../../engine";

export const mastodon: EngineFunction = async (
  query: string,
  page: number | undefined
) =>
  (
    await grab(
      `https://mastodon.social/api/v2/search?${new URLSearchParams({
        q: query,
        resolve: "false",
        type: "accounts",
        limit: "40",
      }).toString()}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        onResponse(path: string, response: any) {
          const data = response.data || response;
          const results: EngineResult[] = [];
          const accounts = data.accounts || [];

          for (const account of accounts) {
            const url = account.uri || account.url;
            const username = account.username || "";
            const displayName = account.display_name || username;
            const followersCount = account.followers_count || 0;
            const note = account.note || "";

            // Strip HTML tags from note
            const cleanNote = note.replace(/<[^>]*>/g, "").trim();

            const title = `${displayName} (@${username})`;
            const content = `Followers: ${followersCount}\n${cleanNote}`;

            const thumbnail = account.avatar || account.avatar_static;

            results.push({
              url,
              title,
              content,
              thumbnail,
              engine: "mastodon",
            });
          }

          response.data = results;
          return [path, response];
        },
      }
    )
  )?.data;
