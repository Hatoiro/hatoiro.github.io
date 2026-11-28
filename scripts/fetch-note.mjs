// note（https://note.com/hatoiro）の記事を RSS から取り込み、src/data/notes.json に書く。
// GitHub Actions でビルドのたびに（毎日の定時ビルドでも）実行。失敗したら前のファイルを残す。
import { readFile, writeFile } from 'node:fs/promises';

const USER = 'hatoiro';
const OUT = new URL('../src/data/notes.json', import.meta.url);
const UA = { 'user-agent': 'Mozilla/5.0 (site build; +https://hatoiro.github.io)' };
const decode = (s) => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();

const jst = (v) => { const d = new Date(v); return isNaN(d) ? '' : new Date(d.getTime() + 9 * 3600e3).toISOString().slice(0, 10); }; // 日本時間の日付

// ① RSS
async function fromRss() {
  const xml = await (await fetch(`https://note.com/${USER}/rss`, { headers: UA })).text();
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, e]) => {
    const pick = (re) => decode((e.match(re) || [])[1] || '');
    return {
      title: pick(/<title>([\s\S]*?)<\/title>/),
      url: pick(/<link>([^<]+)<\/link>/),
      published: jst(pick(/<pubDate>([^<]+)<\/pubDate>/)),
      thumbnail: pick(/<media:thumbnail>([^<]+)<\/media:thumbnail>/) || pick(/<media:thumbnail[^>]*url="([^"]+)"/),
    };
  }).filter((i) => i.title && i.url);
}

// ② note の公開 API（RSS は新着の反映が遅れることがあるので、こちらも見る）
async function fromApi() {
  const json = await (await fetch(`https://note.com/api/v2/creators/${USER}/contents?kind=note&page=1`, { headers: UA })).json();
  return (json?.data?.contents ?? []).map((c) => ({
    title: c.name ?? '',
    url: c.noteUrl ?? '',
    published: jst(c.publishAt),
    thumbnail: c.eyecatch ? `${c.eyecatch.split('?')[0]}?width=800` : '',
  })).filter((i) => i.title && i.url);
}

async function main() {
  const lists = await Promise.allSettled([fromApi(), fromRss()]);
  const byUrl = new Map();
  for (const r of lists) if (r.status === 'fulfilled') for (const i of r.value) if (!byUrl.has(i.url)) byUrl.set(i.url, i);
  const items = [...byUrl.values()].sort((a, b) => b.published.localeCompare(a.published));
  if (!items.length) throw new Error(lists.map((r) => r.reason?.message).filter(Boolean).join(' / ') || 'no items');
  await writeFile(OUT, JSON.stringify(items, null, 2) + '\n');
  console.log(`notes: ${items.length} (api ${lists[0].status === 'fulfilled' ? lists[0].value.length : 'x'}, rss ${lists[1].status === 'fulfilled' ? lists[1].value.length : 'x'})`);
}

main().catch(async (err) => {
  const old = await readFile(OUT, 'utf8').catch(() => '[]');
  console.warn(`notes: kept existing file (${JSON.parse(old).length} items) — ${err.message}`);
});
