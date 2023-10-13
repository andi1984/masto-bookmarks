import chalk from "chalk";
import readline from "readline";
import { Status } from "masto";
import { stripHtml } from "string-strip-html";

import { getMastoRuntimeAsync } from "./helper.js";
import { notifyWebhook } from "./zapier.js";
import { env } from "./env.js";

//@ts-ignore -- NO Definition File
import extractUrls from "extract-urls";

const renderBookmark = (status: Status) => {
  console.clear();
  console.log(chalk.green(stripHtml(status.content).result));
  console.log(chalk.blue(status.url));
};

export const browseBookmarks = async () => {
  const read = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const masto = await getMastoRuntimeAsync();
  const bookmarkIterator = await masto.bookmarks.iterate();
  let bookmarksArray: Status[] = [];
  let selectedIndex = 0;

  const getNextBookmarks = async () => {
    const bookmarkResult = await bookmarkIterator.next();
    console.log(bookmarkResult);
    return bookmarkResult.value as Status[];
  };

  const bookmarks = await getNextBookmarks();
  bookmarksArray = bookmarksArray.concat(bookmarks);

  const renderBookmarkAtIndex = (index: number) => {
    renderBookmark(bookmarksArray[index]);
  };

  // Initial render
  renderBookmarkAtIndex(selectedIndex);

  process.stdin.on("keypress", async (str, key) => {
    // console.log(key);
    if (key.name === "right") {
      if (selectedIndex + 1 < bookmarksArray.length) {
        selectedIndex += 1;
      } else {
        // Load next page
        bookmarksArray = bookmarksArray.concat(await getNextBookmarks());
        selectedIndex += 1;
      }
    } else if (key.name === "left" && selectedIndex > 0) {
      selectedIndex -= 1;
    } else if (key.name === "s") {
      // Hitting "s" for save...

      // 1. Extract URLs from bookmark
      const matchedUrls: { url: string }[] = extractUrls(
        bookmarksArray[selectedIndex].content
      ).map((url: string) => ({
        url,
      }));

      // Save to raindrop
      if (matchedUrls?.length > 0) {
        await notifyWebhook(env.URL_WEBHOOK, {
          urls: matchedUrls,
        });
      }
    } else {
      read.close();
    }

    // New render on keypress
    renderBookmarkAtIndex(selectedIndex);
  });
};
