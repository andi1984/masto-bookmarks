import { loadEnv } from './env';
loadEnv(); // Executed synchronously before the rest of your app loads
import {getBookmarks} from './get-bookmark'

async function main() {
  getBookmarks();
}

main().catch((error) => {
  console.error(error);
});