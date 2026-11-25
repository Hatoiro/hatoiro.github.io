// photos/ フォルダの写真を、サイト用に自動で加工する。
//   photos/2026-03-paris/*.jpg → 暗室のロール。「年-月-名前」で、新しい順に並ぶ（月は省略可）
//   photos/tokyo/*.jpg         → 年のないフォルダは「いつもの」ロールとして先頭に
//   photos/<ロール>/roll.json  → 任意: {"label": "瀬戸内", "note": "高校2年の旅", "camera": "Canon EOS R"}
//   photos/covers/2026.jpg  → その年の号の表紙
// やること: 向きを直す → 2サイズの WebP に縮小 → 位置情報などのメタデータを全部消す → 一覧(JSON)を作る
// 撮影日・レンズ・F値は、写真に記録されていれば自動で拾う。
// 位置情報（GPS）が入った写真が見つかったら、公開を止めてエラーにする（このリポジトリは公開されているため）。
import { readdir, readFile, mkdir, writeFile, stat } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';
import sharp from 'sharp';
import exifr from 'exifr';

const SRC = 'photos';
const OUT = 'public/photos-built';
const MANIFEST = 'src/data/photos.json';
const IMG = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff']);

const exists = (p) => stat(p).then(() => true, () => false);
const titleFrom = (file) => {
  const base = basename(file, extname(file))
    .replace(/\s+(large|medium|small|actual size)$/i, '')   // Finder の「イメージを変換」が付ける語
    .replace(/^\d+[-_ ]*/, '').replace(/[-_]+/g, ' ').trim();
  // カメラの自動ファイル名（IMG_7255, DSC05590, 61A0001 など）はタイトルにしない
  if (/^(img|dsc|dscf|_mg|_dsc|pxl|photo)\s?[\d ]*$/i.test(base) || /^[a-z_]*\d[\w]*$/i.test(base) && /\d{3,}/.test(base)) return '';
  return base;
};
const labelFrom = (dir) => dir.replace(/^\d+[-_ ]*/, '').replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
const ym = (d) => (d instanceof Date && !isNaN(d) ? `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}` : '');

const gpsHits = [];
async function readMeta(path) {
  const m = await exifr.parse(path, { gps: true, exif: true, tiff: true }).catch(() => null);
  if (m && (m.latitude != null || m.GPSLatitude != null)) gpsHits.push(path);
  return {
    date: ym(m?.DateTimeOriginal || m?.CreateDate),
    lens: m?.LensModel || '',
    aperture: m?.FNumber ? `f/${Math.round(m.FNumber * 10) / 10}` : '',
    camera: /SP-?\d{3,4}|frontier|noritsu|scan|LS-\d/i.test(m?.Model || '') ? '' : (m?.Model || ''),   // フィルムスキャナーの機種名はカメラとして出さない
  };
}
async function render(path, outBase, sizes) {
  const out = {};
  for (const [key, width] of Object.entries(sizes)) {
    const file = `${outBase}-${width}.webp`;
    await sharp(path).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 80 }).toFile(join(OUT, file));   // メタデータは書き出さない
    out[key] = `/photos-built/${file}`;
  }
  return out;
}

async function main() {
  const manifest = { rolls: [], covers: {} };
  if (!(await exists(SRC))) { await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n'); return; }
  await mkdir(OUT, { recursive: true });
  const dirs = (await readdir(SRC, { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name).sort();

  for (const dir of dirs) {
    const files = (await readdir(join(SRC, dir))).filter((f) => IMG.has(extname(f).toLowerCase())).sort();
    if (!files.length) continue;
    await mkdir(join(OUT, dir), { recursive: true });
    if (dir === 'covers') {
      for (const f of files) {
        const path = join(SRC, dir, f); await readMeta(path);
        const { src } = await render(path, `${dir}/${basename(f, extname(f))}`, { src: 2400 });
        manifest.covers[basename(f, extname(f))] = src;
      }
      continue;
    }
    const conf = JSON.parse(await readFile(join(SRC, dir, 'roll.json'), 'utf8').catch(() => '{}'));
    const m = dir.match(/^(\d{4})(?:-(\d{1,2}))?[-_ ](.+)$/);
    const year = m ? m[1] : '', month = m && m[2] ? m[2].padStart(2, '0') : '';
    const slug = m ? m[3] : dir.replace(/^\d+[-_ ]*/, '');
    const roll = { id: dir.replace(/[^\w-]/g, '-'), label: conf.label || labelFrom(slug), note: conf.note || '', year, period: year ? (month ? `${year}.${month}` : year) : '',
      sort: year ? `${year}-${month || '00'}` : '9999', camera: conf.camera || '', frames: [] };
    for (const f of files) {
      const path = join(SRC, dir, f);
      const meta = await readMeta(path);
      const { src, thumb } = await render(path, `${dir}/${basename(f, extname(f))}`, { src: 1600, thumb: 480 });
      roll.frames.push({ src, thumb, title: titleFrom(f), date: meta.date, lens: meta.lens, aperture: meta.aperture });
      if (!roll.camera && meta.camera) roll.camera = meta.camera;
    }
    manifest.rolls.push(roll);
  }

  manifest.rolls.sort((a, b) => b.sort.localeCompare(a.sort));   // 年のないロール → 新しい年 → 古い年
  manifest.rolls.forEach((r) => delete r.sort);
  if (gpsHits.length) {
    console.error('\n位置情報（GPS）が入った写真があります。公開を止めました:\n' + gpsHits.map((p) => '  - ' + p).join('\n'));
    console.error('位置情報を消した写真で置き換えてください（このリポジトリは誰でも見られます）。\n');
    process.exit(1);
  }
  await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`photos: ${manifest.rolls.reduce((n, r) => n + r.frames.length, 0)} frames in ${manifest.rolls.length} rolls, ${Object.keys(manifest.covers).length} covers`);
}
main();
