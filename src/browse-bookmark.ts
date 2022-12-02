import chalk from "chalk";
import readline from "readline";
import { Status } from "masto";
import { stripHtml } from "string-strip-html";

import { getMastoRuntimeAsync } from "./helper.js";

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

  renderBookmark(bookmarksArray[selectedIndex]);

  process.stdin.on("keypress", (str, key) => {
    console.log("keypress", key.name);
    if (key.name === "right" && selectedIndex + 1 < bookmarksArray.length) {
      selectedIndex += 1;
    } else if (key.name === "left" && selectedIndex > 0) {
      selectedIndex -= 1;
    } else {
      read.close();
    }

    renderBookmark(bookmarksArray[selectedIndex]);
  });
};
