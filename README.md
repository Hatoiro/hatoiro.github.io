# hatoiro.github.io

石黒晴翔 / Haruto Ishiguro の個人サイト。Astro でつくり、GitHub Pages で公開している。

## ページ

| URL | 中身 |
|---|---|
| `/` | ハブ。各年を雑誌の「号」に見立てた表紙、ポッドキャスト、暗室、年譜、作品 |
| `/room/` | 晴翔の部屋（3D。使えない端末では 2D） |
| `/photos/` | 暗室。写真のコンタクトシートとルーペ |
| `/podcast/` | noisystudyroom の全エピソード（YouTube から自動） |
| `/about/` | プロフィール（LinkedIn と同じ範囲） |

## 更新のしかた

- **文章・年譜・SNS・作品**: `src/data/site.ts` を書き換える。空欄の項目はページに出ない。
- **写真**: `photos/<年-月-名前>/` に入れるだけ（`photos/README.md`）。位置情報入りは公開が止まる。
- **作品の画像**（パンフレットのページなど）: `works/<名前>/` に入れて、`site.ts` の `works` で `images` に名前を書く（`works/README.md`）。
- **作品の動画**: `site.ts` の `works` で `youtube` に URL を貼る。
- **ポッドキャスト**: 何もしなくていい。毎朝と push のたびに YouTube の新着を取り込む。
- **公開準備中の表示**: `site.ts` の `draft` を `false` にすると検索エンジンに載るようになる。

push すると GitHub Actions が自動でビルドして公開する。

## 手元で動かす

```sh
npm install
npm run dev        # http://localhost:4321
npm run episodes   # ポッドキャストの新着を取り込む
npm run build
```

## 書体と色

- 書体: Murecho（Google Fonts）のみ。太さ 200 / 400 / 700 / 900
- 色: 生成り `#F3EFE6`、墨 `#111010`、暗室の赤 `#B5341C`（暗い背景では `#FF6A4D`）
