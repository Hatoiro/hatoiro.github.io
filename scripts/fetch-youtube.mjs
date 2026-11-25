// Pulls the latest noisystudyroom episodes from YouTube's public RSS feed
// and writes src/data/episodes.json. Runs in GitHub Actions before every build
// (and once a day on a schedule). If anything fails, the old file is kept.
import { readFile, writeFile } from 'node:fs/promises';

const HANDLE = 'noisystudyroom';
const OUT = new URL('../src/data/episodes.json', import.meta.url);
const UA = { 'user-agent': 'Mozilla/5.0 (site build; +https://hatoiro.github.io)' , 'accept-language': 'ja,en;q=0.8' };

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

async function channelId() {
  if (process.env.YT_CHANNEL_ID) return process.env.YT_CHANNEL_ID;
  const html = await (await fetch(`https://www.youtube.com/@${HANDLE}`, { headers: UA })).text();
  const m = html.match(/"externalId":"(UC[\w-]{22})"/) || html.match(/"channelId":"(UC[\w-]{22})"/) || html.match(/channel\/(UC[\w-]{22})/);
  if (!m) throw new Error('channel id not found');
  return m[1];
}

async function main() {
  const id = await channelId();
  const xml = await (await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${id}`, { headers: UA })).text();
  const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(([, e]) => {
    const pick = (re) => (e.match(re) || [])[1] || '';
    const vid = pick(/<yt:videoId>([^<]+)<\/yt:videoId>/);
    return {
      id: vid,
      title: decode(pick(/<title>([^<]*)<\/title>/)),
      published: pick(/<published>([^<]+)<\/published>/),
      thumbnail: `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`,
      url: pick(/<link rel="alternate" href="([^"]+)"/) || `https://www.youtube.com/watch?v=${vid}`,
    };
  }).filter((e) => e.id && !/\/shorts\//.test(e.url));
  if (!entries.length) throw new Error('feed had no entries');
  await writeFile(OUT, JSON.stringify(entries, null, 2) + '\n');
  console.log(`episodes: ${entries.length} (channel ${id})`);
}

main().catch(async (err) => {
  const old = await readFile(OUT, 'utf8').catch(() => '[]');
  console.warn(`episodes: kept existing file (${JSON.parse(old).length} entries) — ${err.message}`);
});
