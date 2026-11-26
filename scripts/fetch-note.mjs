// note（https://note.com/hatoiro）の記事を RSS から取り込み、src/data/notes.json に書く。
// GitHub Actions でビルドのたびに（毎日の定時ビルドでも）実行。失敗したら前のファイルを残す。
import { readFile, writeFile } from 'node:fs/promises';

const USER = 'hatoiro';
const OUT = new URL('../src/data/notes.json', import.meta.url);
const UA = { 'user-agent': 'Mozilla/5.0 (site build; +https://hatoiro.github.io)' };
const decode = (s) => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();

async function main() {
  const xml = await (await fetch(`https://note.com/${USER}/rss`, { headers: UA })).text();
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, e]) => {
    const pick = (re) => decode((e.match(re) || [])[1] || '');
    const d = new Date(pick(/<pubDate>([^<]+)<\/pubDate>/));
    return {
      title: pick(/<title>([\s\S]*?)<\/title>/),
      url: pick(/<link>([^<]+)<\/link>/),
      published: isNaN(d) ? '' : new Date(d.getTime() + 9 * 3600e3).toISOString().slice(0, 10), // 日本時間の日付
      thumbnail: pick(/<media:thumbnail>([^<]+)<\/media:thumbnail>/) || pick(/<media:thumbnail[^>]*url="([^"]+)"/),
    };
  }).filter((i) => i.title && i.url);
  if (!items.length) throw new Error('feed had no items');
  await writeFile(OUT, JSON.stringify(items, null, 2) + '\n');
  console.log(`notes: ${items.length}`);
}

main().catch(async (err) => {
  const old = await readFile(OUT, 'utf8').catch(() => '[]');
  console.warn(`notes: kept existing file (${JSON.parse(old).length} items) — ${err.message}`);
});
