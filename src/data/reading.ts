// Reading room — note の「レポート深掘りシリーズ」。記事一覧は scripts/fetch-note.mjs が notes.json に自動で取り込む
import notes from './notes.json';

export const reading = {
  series: 'レポート深掘りシリーズ',
  lede: '海外の金融機関が出すレポートを読んで、ひとつの問いを深掘る。note で書いているシリーズ。',
  note: 'https://note.com/hatoiro',
};

type Raw = { title: string; url: string; published: string; thumbnail: string };
export type Article = Raw & { no?: string; source?: string; topic?: string };

// 「【レポート深掘りシリーズ #3】Morgan Stanleyのレポートから深掘る「関税戦争の行方」」→ 番号・出典・テーマに分ける
//  出典は「〜から深掘る」の前（末尾の「のレポート」は省く）、テーマは「」の中
const RE = /【レポート深掘りシリーズ\s*#(\d+)】\s*(.+?)から深掘る\s*「(.+)」/;
export const articles: Article[] = (notes as Raw[]).map((n) => {
  const m = n.title.match(RE);
  return m ? { ...n, no: m[1], source: m[2].replace(/のレポート$/, '').trim(), topic: m[3].trim() } : n;
}).sort((a, b) => (b.published || '').localeCompare(a.published || ''));
export const fmtDate = (d: string) => d.replaceAll('-', '.');
