// ------------------------------------------------------------
// サイトの文言はほぼすべてここで管理する（部屋の中の説明だけは room.ts）。
// 空欄（'' や null）の項目はページに出ない仕組みなので、
// 決まったものから埋めていけばいい。
// ------------------------------------------------------------

// 公開準備中は true。検索エンジンに載らないようにする（完成したら false に）
export const draft = false;

// LINE などでリンクを共有したときに出る説明文（トップページ）。各ページの説明は、それぞれのページで指定
export const shareDescription = '石黒晴翔のポートフォリオサイトです。';

export const profile = {
  nameJa: '石黒晴翔',
  nameEn: 'Haruto Ishiguro',
  headline: 'VC | Analyst | UTokyo student',
  location: 'Tokyo, Japan',
  intro: '東京大学で経済を学びながら、スタートアップ投資の現場に立ち、ポッドキャストで話し、写真を撮り、アプリをつくっている。このサイトは、その記録のアーカイブ。',
};

// SNS — URL が空のものは表示されない
export const socials = [
  { name: 'YouTube', handle: '@noisystudyroom', url: 'https://www.youtube.com/@noisystudyroom' },
  { name: 'Spotify', handle: 'noisystudyroom', url: 'https://open.spotify.com/show/033XrQOUG2qLNHDLtBC7ce' },
  { name: 'Apple Podcast', handle: 'noisystudyroom', url: 'https://podcasts.apple.com/jp/podcast/%E9%A8%92%E3%81%8C%E3%81%97%E3%81%84%E8%87%AA%E7%BF%92%E5%AE%A4/id6795637556' },
  { name: 'Instagram', handle: 'hato_iro', url: 'https://www.instagram.com/hato_iro/' },
  { name: 'Facebook', handle: '石黒晴翔', url: 'https://www.facebook.com/profile.php?id=100076340807338&locale=ja_JP' },
  { name: 'LinkedIn', handle: 'Haruto Ishiguro', url: 'https://www.linkedin.com/in/haruto-ishiguro-96268a271/' },
  { name: 'GitHub', handle: 'Hatoiro', url: 'https://github.com/Hatoiro' },
  { name: 'Mail', handle: '', url: '' },
].filter((s) => s.url);

export const podcast = {
  name: 'noisystudyroom',
  tagline: '',
  about: '身の回りの面白い友人を連れてきてインタビューする、30分ほどの質素なpodcast。YouTube・Spotify・Apple Podcasts で配信している。',
  youtube: 'https://www.youtube.com/@noisystudyroom',
  spotify: 'https://open.spotify.com/show/033XrQOUG2qLNHDLtBC7ce',
  apple: 'https://podcasts.apple.com/jp/podcast/%E9%A8%92%E3%81%8C%E3%81%97%E3%81%84%E8%87%AA%E7%BF%92%E5%AE%A4/id6795637556',
};

export const instagram = { handle: 'hato_iro', url: 'https://www.instagram.com/hato_iro/' };

// ---------- 年譜：各年は雑誌の「号」 ----------
export type Entry = { m: string; tag: 'Education' | 'Work' | 'Journey' | 'Podcast' | 'Photo' | 'Lab'; title: string; body?: string; roll?: string };   // roll = 旅のページ（photos/ のフォルダ名）へリンク
export type Issue = { id: string; tab: string; big: string; kicker: string; theme: string; tone: string; lines: { k: string; v: string }[]; entries: Entry[] };

export const issues: Issue[] = [
  {
    id: 'pre', tab: '〜2024', big: '’24', kicker: 'Back issues · 〜2024', theme: 'ここまでのこと。', tone: '#3E3A34',
    lines: [
      { k: 'Kaisei', v: 'Entaring Kaisei High' },
      { k: 'Summer school', v: 'studied Economics at Choate Rosemary Hall' },
    ],
    entries: [
      { m: '2022.04', tag: 'Education', title: '開成高校 入学' },
      { m: '2022 夏', tag: 'Education', title: 'Choate Rosemary Hall', body: 'アメリカのサマースクールで経済を学ぶ。' },
    ],
  },
  {
    id: '2025', tab: '2025', big: '2025', kicker: 'Issue 2025', theme: '東京大学へ。投資の現場へ。', tone: '#2E3136',
    lines: [
      { k: 'Graduation', v: 'Graduated Kaisei High' },
      { k: 'University', v: 'Entaring UTokyo' },
      { k: 'Venture capital', v: 'started working as an intern at HIRAC FUND' },
    ],
    entries: [
      { m: '03', tag: 'Education', title: '開成高校 卒業' },
      { m: '04', tag: 'Education', title: '東京大学 入学', body: '経済を学びはじめる。' },
      { m: '04', tag: 'Work', title: 'HIRAC FUND でインターン開始', body: 'Money Forward Venture Partners のアシスタントとして、スタートアップ投資の現場へ。' },
    ],
  },
  {
    id: '2026', tab: '2026 NOW', big: '2026', kicker: 'Issue 2026 · Now', theme: '外に出て、つくりはじめた年。', tone: '#26221E',
    lines: [
      { k: 'Podcast', v: 'noisystudyroom — unhurried talks with friends on work, life, and the space between' },
      { k: 'Photographs', v: 'Tokyo, Paris, Kenya — seen through old glass' },
      { k: 'Journeys', v: 'From EU policy at Sciences Po to mobile money in Kenya' },
      { k: 'Works', v: 'QUIET FLIGHT & Lecture Tracker — tools I wished existed, so I built them' },
    ],
    entries: [
      { m: '02–03', tag: 'Journey', title: 'Sciences Po, Paris', roll: '2026_paris', body: 'Spring school で EU affairs を。EU経済と物流を学ぶ。' },
      { m: '04', tag: 'Education', title: '東京大学 2年に' },
      { m: '09', tag: 'Journey', title: 'Kenya Study Tour', roll: '2026_kenya', body: '現地の経済と、電子決済を見に行く。' },
      { m: '11', tag: 'Work', title: 'QUIET FLIGHT 公開', body: '世界の空港を巡る、集中のためのフライトアプリ。' },
      { m: '11', tag: 'Lab', title: '三田春日神社 3D', body: '境内を歩いて参拝できるサイト。制作中。' },
    ],
  },
];
export const currentIssue = '2026';

// ---------- 作品 ----------
// kind = 種類（Web app / Video / Print など）、year = 制作年
// youtube = YouTube の動画URL（入れるとサムネイル付きで表示。空なら非表示）
// images = works/ の中のフォルダ名（パンフレットのページなど。タップで全画面）
// url = 作品のサイト（画像をタップするとそこへ飛ぶ）。url がなく images があれば、タップで全画面
export type Work = { title: string; kind: string; year: string; body: string; url?: string; cta?: string; youtube?: string; images?: string; color?: string };
export const featuredWork: Work = {
  title: 'QUIET FLIGHT', kind: 'Web app', year: '2026',
  body: '時間をセットして、世界の空港へ飛ぶ集中タイマー。出発案内板で行き先を選び、搭乗券を受け取って離陸する。',
  url: 'https://hatoiro.github.io/quiet-flight/',
  cta: '搭乗する',
  images: 'quiet-flight',
};
export const works: Work[] = [
  { title: '三田春日神社 例大祭2026', kind: 'Video', year: '2026', body: '3年に1度の、三田春日神社の例大祭の映像。大雨の中、記録と映像美の追求を試みた。', youtube: 'https://youtu.be/F0lGEvlRDMo' },
  { title: 'HIRAC FUND ウェブサイト リニューアル', kind: 'Website', year: '2026.04 — 06', body: 'コーポレートサイトのリニューアルPJを主導。デザイン、バックオフィス、社内の要望をつなぎながら、複数の部署を横断して指揮をとった。', url: 'https://www.hirac.co.jp/', cta: 'サイトを見る', images: 'hirac-hp', color: '#14213D' },
  { title: 'HIRAC FUND メンバーインタビュー', kind: 'Writing', year: '2026.08 —', body: 'HIRAC FUND のメンバーにインタビューし、紹介記事を執筆している。', images: 'hirac-blog', color: '#2B2B29' },
  { title: '三田春日神社 例大祭2023', kind: 'Video', year: '2023', body: '3年に1度の、三田春日神社の例大祭の映像。灼熱の中初めて長時間動画を撮り編集する経験。', youtube: 'https://www.youtube.com/watch?v=mlkUUPkw58c' },
  { title: '運動会 青組パンフレット', kind: 'Print', year: '2024', body: '開成の運動会で、自分の組・青組のパンフレットをつくった。', images: 'aogumi-pamphlet', color: '#1F3E8C' },
];
// images = works/<名前>/ の画像を小さなサムネイルとして表示（タップで全画面）
export const lab: { title: string; note: string; status: string; images?: string }[] = [
  { title: '三田春日神社 3D', note: '境内を歩いて参拝できるサイト', status: 'In progress', images: 'kasuga-3d' },
  { title: 'Lecture Tracker', note: '講義を聴き、スライドに注釈するAI', status: 'Prototype', images: 'lecture-tracker' },
  { title: 'Movie Dictation', note: '洋画のセリフで穴埋めリスニング', status: 'Concept' },
  { title: 'Robi × AI', note: '組み立てたロボットに知能を', status: 'Concept' },
];

// ---------- 写真（暗室） ----------
// 写真は photos/ フォルダに入れるだけ（photos/README.md 参照）。ここに書く必要はない。

// ---------- 旅のページ（/darkroom/<フォルダ名>/） ----------
// photos/ のフォルダごとに自動でページができる。ここに書いた旅には、説明と「学び」が付く。
// 学びは Notion の「キャリアの材料庫」（経験データベース）から抜き出したもの。
export type Journey = { title?: string; place?: string; period?: string; context?: string; learnings?: string[] };
export const journeys: Record<string, Journey> = {
  '2026_kenya': {
    title: 'Kenya',
    place: 'Nairobi · Kisumu · Nandi · Amboseli · Mombasa',
    period: '2026.09.11 — 09.19',
    context: '経済と電子決済をテーマにしたスタディツアー。都市と地方、いくつもの地域をまわった。',
    learnings: [
      '日本で当たり前の経済・金融インフラは、ほかの国では当たり前ではない。',
      '電子決済の広がりは、技術だけでなく、暮らし・金融へのアクセス・商習慣・経済の仕組みと一緒に見ないと分からない。',
      '経済を知るには、統計や文献だけでなく、現地の人の行動や制度、暮らしを自分の目で見ることが大事。',
      '教育や文化の根っこからの違いに触れて、異なる文化を外から簡単に評価することはできないと実感した。',
      'ケニアで受けた衝撃は、きっと外から見た日本にもある——そう相対化できるようになった。',
      'そして何より、人々の歓迎の温かさに心を動かされた。',
    ],
  },
  '2026_paris': {
    title: 'Paris',
    place: 'Sciences Po, Paris',
    period: '2026.02 — 03',
    context: 'Sciences Po の Spring school で、EU経済と物流を中心に学んだ。',
    learnings: [
      '国ごとではなく、複数の国が制度や市場を共有する「経済圏」として経済を見る視点を得た。',
      '経済活動は、各国の制度・地理・物流インフラ・政策に大きく左右される。',
      '日本の経済や産業を考えるときも、国内で完結させず、欧州など他の地域と比べて捉えることが大事。',
      '国際的な学びの場に身を置いて、自分の知識や考え方を相対化できた。',
    ],
  },
};

// ---------- ハブの文言 ----------
export const hub = {
  podcastKicker: '● Now playing — Podcast',
  darkroomKicker: '▸ Darkroom — Photographs',
  darkroomLede: 'Canon EOS R と Nikon F3、オールドレンズで撮ったもの。良いコマには赤丸を。',
  darkroomEmpty: '現像中。写真は、東京・パリ・ナイロビのロールから順にここへ並びます。',
  instaTitle: '毎日のコマは、\nInstagram で。',
  instaSoon: 'アカウントは近日公開。',
  mapKicker: 'Journeys — 旅',
  mapLede: '行った場所ごとに、写真と、そこで考えたことを。',
  chronicleKicker: 'Chronicle — 年譜',
  worksKicker: 'Works — つくったもの',
  labHead: 'On the bench — 制作中・実験中のもの',
  roomKicker: 'My room — 晴翔の部屋',
  roomTitle: 'My ',
  roomTitleItalic: 'room',
  roomSub: '晴翔の部屋に入って、物をタップすると、その物にまつわる話が開く。',
  roomCta: '部屋へ →',
};

// ---------- プロフィール（LinkedIn と同じ範囲） ----------
export const experience = [
  { role: 'Assistant（Internship）', org: 'HIRAC FUND | Money Forward Venture Partners, Inc.', period: '2025.04 — 現在', place: 'Tokyo, Japan · On-site' },
];
export const education = [
  { school: '東京大学 The University of Tokyo', detail: 'Economics · 2年', period: '2025.04 — 2029.03（予定）' },
  { school: 'Sciences Po', detail: 'Spring school, EU affairs', period: '2026.02 — 2026.03' },
  { school: '開成高校 Kaisei High School', detail: '', period: '2022.04 — 2025.03' },
  { school: 'Choate Rosemary Hall', detail: 'Summer school, Economics', period: '2022.06 — 2022.08' },
];
export const interests = [
  { t: 'Podcast', s: 'noisystudyroom を友人と' },
  { t: 'Photography', s: 'Canon EOS R、Nikon F3、オールドレンズ' },
  { t: 'Tennis', s: 'テニスサークル ALLDC' },
  { t: 'Making', s: 'Webアプリ、3D、AIのツール' },
  { t: 'Music', s: 'ギター、レコード（Harry Styles、SZA）' },
];
