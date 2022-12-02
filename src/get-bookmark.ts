import { login, Status } from 'masto';
import { env } from './env';
import { notifyWebhook } from './zapier';
const extractUrls = require("extract-urls");
const MAX_RUNS = env.MAX_RUNS || 2;

export async function getBookmarks() {
    const masto = await login({
        url: env.INSTANCE as string,
        accessToken: env.ACCESS_TOKEN,
    });

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
                console.log(matchedUrls)
                if (!!matchedUrls) {
                    urls = urls.concat(matchedUrls);
                }
            }
        }
        console.log('next')
        count+=1;
        done = bookmarkIteratorResult.done;
    } while (!done && count < MAX_RUNS) 

    // Filter out Mastodon tags
    urls = urls.filter(url => url?.match(/.*\/tags\/.*/g) === null)

    const uniqueUrls = new Set(urls);

    const finalURLS = Array.from(uniqueUrls).filter(url => url.trim().length > 0).map(url => ({url: url.trim()}))
    console.log('all urls', finalURLS)
    notifyWebhook(env.URL_WEBHOOK, { urls: finalURLS})
}