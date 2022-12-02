import chalk from "chalk";
import readline from "readline";
import logSymbols from "log-symbols";

import { getBookmarks } from "./get-bookmark.js";
import { browseBookmarks } from "./browse-bookmark.js";

const read = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const commands = [
  {
    id: "save_bookmark_urls",
    name: "save bookmark urls",
    description:
      "triggers a webhook with URLs found in your mastodon bookmarks.",
  },

  {
    id: "browse_all_bookmarks",
    name: "browse all bookmarks",
    description: "browse all bookmarks.",
  },
];

// Executed synchronously before the rest of your app loads
async function main() {
  let selectedIndex = 0;

  const renderCommands = () => {
    console.clear();
    console.log(chalk.green(`Please choose a command:`));
    commands.forEach((command, index) => {
      if (index === selectedIndex) {
        console.log(
          chalk.yellow(
            `${logSymbols.success} ${command.name}: ${command.description}`
          )
        );
      } else {
        console.log(chalk.blue(`- ${command.name}: ${command.description}`));
      }
    });
  };

  renderCommands();

  process.stdin.on("keypress", (str, key) => {
    if (key.name === "up" && selectedIndex > 0) {
      selectedIndex -= 1;
      renderCommands();
    } else if (key.name === "down" && selectedIndex < commands.length - 1) {
      selectedIndex += 1;
      renderCommands();
    } else if (key.name === "return") {
      const selected = commands[selectedIndex];
      // console.log(chalk.yellow(`You selected the "${selected.name}" command.`));
      read.close();

      switch (selected.id) {
        case "save_bookmark_urls":
          getBookmarks();
          break;

        case "browse_all_bookmarks":
          console.log(chalk.yellow(`browse all bookmarks`));
          browseBookmarks();
          break;

        default:
          break;
      }
    }
  });
}

main().catch((error) => {
  console.error(error);
});
