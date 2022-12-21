import { env, loadEnv } from "./env.js";
//@ts-ignore -- NO Definition File
import extractUrls from "extract-urls";

import { notifyWebhook } from "./zapier.js";
import { getMastoRuntimeAsync } from "./helper.js";
loadEnv();

const MAX_RUNS = env.MAX_RUNS || 2;

export async function getBookmarks() {
  const masto = await getMastoRuntimeAsync();

  let done;
  const paginator = masto.bookmarks.iterate();
  let urls: string[] = [];
  let count = 0;
  do {
    const bookmarkIteratorResult = await paginator.next();
    const bookmarks = bookmarkIteratorResult.value;
    if (!!bookmarks?.length) {
      for (const bookmark of bookmarks) {
        const matchedUrls: string[] | undefined = extractUrls(bookmark.content);
        console.log(matchedUrls);
        if (!!matchedUrls) {
          urls = urls.concat(matchedUrls);
        }
      }
    }
    console.log("next");
    count += 1;
    done = bookmarkIteratorResult.done;
  } while (!done && count < MAX_RUNS);

  // Filter out Mastodon tags
  urls = urls.filter((url) => url?.match(/.*\/tags\/.*/g) === null);
  urls = urls.filter((url) => url?.match(/.*\/tag\/.*/g) === null);
  urls = urls.filter((url) => url?.match(/.*@.*/g) === null);
  urls = urls.filter((url) => url?.match(/.*social.*/g) === null);
  urls = urls.filter((url) => url?.match(/.*fediverse.*/g) === null);
  urls = urls.filter((url) => url?.match(/.*mastodon.*/g) === null);

  const uniqueUrls = new Set(urls);

  const finalURLS = Array.from(uniqueUrls)
    .filter((url) => url.trim().length > 0)
    .map((url) => ({ url: url.trim() }));
  console.log("all urls", finalURLS);
  notifyWebhook(env.URL_WEBHOOK, { urls: finalURLS });
}
