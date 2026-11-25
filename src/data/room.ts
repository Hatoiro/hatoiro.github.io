// ------------------------------------------------------------
// 晴翔の部屋（/room/）で、物をタップしたときに出る文言。
// kicker = 小さなラベル / title = 見出し / body = 本文 / items = 一覧 / links = ボタン
// ------------------------------------------------------------
import { podcast, instagram, featuredWork, works, lab } from './site';

type Ep = { title: string; published: string; url: string };
type Link = { label: string; href: string; primary?: boolean };
export type Panel = { kicker: string; title: string; body: string; items: { t: string; s?: string }[]; links: Link[] };
const L = (label: string, href: string, primary = false): Link => ({ label, href, primary });

export function roomPanels(latest?: Ep): Record<string, Panel> {
  const latestItem = latest ? [{ t: latest.title, s: `最新回 · ${latest.published.slice(0, 10).replaceAll('-', '.')}` }] : [];
  return {

  welcome: { kicker: 'Welcome', title: 'ようこそ、\n晴翔の部屋へ。', body: '光っている物をタップすると、その物にまつわる話が開きます。ドラッグで部屋を回して、ホイールかピンチで寄れます。', items: [], links: [L('ハブで一覧を見る', '/')] },
  mic: { kicker: 'Desk — microphone', title: podcast.name, body: podcast.about, items: latestItem,
    links: [L('YouTube で見る', latest?.url ?? podcast.youtube, true), ...(podcast.spotify ? [L('Spotify で聴く', podcast.spotify)] : []), L('全エピソード', '/studyroom/')] },
  camera: { kicker: 'Cabinet — Nikon F3 / Canon EOS R', title: 'Darkroom', body: 'フィルムの Nikon F3 と、デジタルの Canon EOS R。オールドレンズをつけて、東京・パリ・ナイロビを撮る。', items: [{ t: 'Nikon F3', s: 'フィルム' }, { t: 'Canon EOS R', s: 'デジタル · オールドレンズで' }],
    links: [L('Darkroom で写真を見る', '/darkroom/', true), ...(instagram.url ? [L(`Instagram @${instagram.handle}`, instagram.url)] : [])] },
  turntable: { kicker: 'Cabinet — turntable', title: 'Now spinning', body: 'キャビネットの上のターンテーブル。いま回っているのは――', items: [{ t: 'Kiss All the Time, Disco Occasionally', s: 'Harry Styles' }], links: [] },
  pc: { kicker: 'Desk — MacBook', title: 'Lab room', body: '机のパソコンで、つくっているもの。', items: [{ t: featuredWork.title, s: '公開中' }, ...works.filter((w) => w.kind !== 'Video' || w.youtube).map((w) => ({ t: w.title, s: [w.kind, w.year].filter(Boolean).join(' · ') })), ...lab.map((w) => ({ t: w.title, s: w.note }))],
    links: [L(`${featuredWork.title} に${featuredWork.cta.replace('する', '')}`, featuredWork.url, true), L('Lab room へ', '/#lab')] },
  guitar: { kicker: 'Corner — guitars', title: 'Music', body: 'レスポールタイプのエレキ（青）と、ヤマハのアコギ（茶）。', items: [], links: [] },
  piano: { kicker: 'Left wall — Yamaha upright', title: 'Piano & Records', body: 'コンパクトなヤマハのアップライトピアノ。最近はあまり弾いていなくて、上はレコードと地球儀の置き場になっている。', items: [{ t: 'Harry Styles' }, { t: 'SZA' }], links: [] },
  map: { kicker: 'Wall — world map', title: 'Journeys', body: '学びに行った場所に、ピンを刺している。', items: [{ t: 'Paris — 2026 Spring', s: 'Sciences Po の Spring school で EU affairs' }, { t: 'Nairobi — 2026 Autumn', s: '現地の経済と電子決済を見に' }, { t: 'Tokyo', s: 'ホーム' }], links: [L('Kenya の旅', '/darkroom/2026_kenya/', true), L('Paris の旅', '/darkroom/2026_paris/'), L('年譜で見る', '/#archive')] },
  racket: { kicker: 'Wall — racket', title: 'Tennis', body: 'ピアノの上、地図の横に掛けてある。テニスサークル ALLDC で。', items: [], links: [] },
  globe: { kicker: 'Piano top — globe', title: 'Next', body: '次は、どこへ行こう。', items: [], links: [] },
  clock: { kicker: 'Wall — clock', title: '', body: '壁の時計は、東京の今の時刻を指している。', items: [], links: [] },
  books: { kicker: 'Shelf — books', title: 'Archive room', body: '本棚は年譜。本当は天井まである本棚を、部屋が見えるように低く切っている。', items: [{ t: '2022', s: '開成高校 入学 · Choate Rosemary Hall のサマースクール' }, { t: '2025', s: '東京大学 入学 · HIRAC FUND でインターン開始' }, { t: '2026', s: 'パリ、ナイロビ、QUIET FLIGHT' }], links: [L('年譜をひらく', '/#archive', true), L('Front room', '/front-room/')] },
  window: { kicker: 'Window — Tokyo', title: 'Now', body: '窓の外は、東京の今の時間。いま取り組んでいること。', items: [{ t: '学んでいること', s: '東京大学 · 経済（2年）' }, { t: 'つくっているもの', s: '三田春日神社 3D' }, ...(latest ? [{ t: '最新回', s: latest.title }] : [])], links: [] },
  door: { kicker: 'Door', title: '部屋を出る', body: 'ハブに戻って、ぜんぶを一覧で見る。', items: [], links: [L('ハブへ戻る', '/', true), L('Front room', '/front-room/')] },
  };
}

export const order = ['mic', 'camera', 'turntable', 'pc', 'guitar', 'piano', 'map', 'racket', 'globe', 'clock', 'books', 'window', 'door'];
export const names = { mic: 'マイク', camera: 'カメラ', turntable: 'ターンテーブル', pc: 'パソコン', guitar: 'ギター', piano: 'ピアノとレコード', map: '世界地図', racket: 'ラケット', globe: '地球儀', clock: '時計', books: '本棚', window: '窓', door: 'ドア' };
