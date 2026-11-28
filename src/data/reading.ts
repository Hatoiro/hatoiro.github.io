// Reading room — note の「レポート深掘りシリーズ」。記事一覧は scripts/fetch-note.mjs が notes.json に自動で取り込む
import notes from './notes.json';

export const reading = {
  series: 'レポート深掘りシリーズ',
  lede: '海外の金融機関が出すレポートを読んで、ひとつの問いを深掘る。note で書いているシリーズ。',
  note: 'https://note.com/hatoiro',
};

type Raw = { title: string; url: string; published: string; thumbnail: string };
export type Article = Raw & { no?: string; source?: string; topic?: string; extra?: boolean };

// タイトルから番号・出典・テーマを読む
//  本編：【レポート深掘りシリーズ #3】Morgan Stanleyのレポートから深掘る「関税戦争の行方」
//        → 出典は「〜から深掘る」の前（末尾の「のレポート」は省く）、テーマは「」の中
//  番外編：【#6・番外編】ケニアで揺さぶられた「文化」と「権利」の物差し → 「番外編」、テーマは】の後ろ全部
//  どちらでもない記事は、タイトルをそのまま出す
const MAIN = /【\s*レポート深掘りシリーズ\s*#(\d+)\s*】\s*(.+?)から深掘る\s*「(.+)」/;
const EXTRA = /【[^】]*?#(\d+)[^】]*?番外編[^】]*】\s*(.+)$/;
const ANY_NO = /【[^】]*?#(\d+)[^】]*】\s*(.+)$/;
export const articles: Article[] = (notes as Raw[]).map((n): Article => {
  let m = n.title.match(MAIN);
  if (m) return { ...n, no: m[1], source: m[2].replace(/のレポート$/, '').trim(), topic: m[3].trim() };
  if ((m = n.title.match(EXTRA))) return { ...n, no: m[1], source: '番外編', topic: m[2].trim(), extra: true };
  if ((m = n.title.match(ANY_NO))) return { ...n, no: m[1], topic: m[2].trim() };
  return n;
}).sort((a, b) => (b.published || '').localeCompare(a.published || '') || Number(b.no ?? 0) - Number(a.no ?? 0));
export const articlesByUrl = (urls: string[] = []) => urls.map((u) => articles.find((a) => a.url === u)).filter((a): a is Article => !!a);
export const fmtDate = (d: string) => d.replaceAll('-', '.');
