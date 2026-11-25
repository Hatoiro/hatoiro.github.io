// 晴翔の部屋 — page logic. Decides 3D or 2D, renders the side panel.
// Panel text comes from src/pages/room/index.astro (#room-data), built from src/data/site.ts.
{
const D = JSON.parse(document.getElementById('room-data').textContent);
const ORDER = D.order, NAMES = D.names, POS2D = D.pos2d, P = D.panels;

const $ = (s) => document.querySelector(s);
const stage = $('#stage'), panel = $('#panel'), loading = $('#loading');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const lowMem = (navigator.deviceMemory || 8) <= 2;
const glOK = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; } })();
const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };

let api = null, mode = null, current = 'welcome', spotEls = {};

// ---------- panel ----------
const clockTitle = () => { const d = new Date(); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
function renderPanel() {
  const p = P[current];
  $('#p-kicker').textContent = p.kicker;
  $('#p-title').textContent = current === 'clock' ? clockTitle() : p.title;
  $('#p-body').textContent = p.body;
  const ul = $('#p-items'); ul.replaceChildren();
  for (const it of p.items) { const li = document.createElement('li'); const b = document.createElement('strong'); b.textContent = it.t; li.append(b); if (it.s) { const s = document.createElement('span'); s.textContent = it.s; li.append(s); } ul.append(li); }
  ul.hidden = !p.items.length;
  const links = $('#p-links'); links.replaceChildren();
  for (const l of p.links) { const a = document.createElement('a'); a.href = l.href; a.textContent = l.label; a.className = l.primary ? 'btn primary' : 'btn'; links.append(a); }
  links.hidden = !links.children.length;
  for (const b of document.querySelectorAll('[data-spot]')) b.setAttribute('aria-pressed', String(b.dataset.spot === current));
}
function select(k) {
  current = k; renderPanel();
  document.body.classList.toggle('sheet-open', k !== 'welcome');
  if (api) { if (k === 'welcome') api.reset(); else api.focus(k); api.setSpinning(k === 'turntable'); }
}
const chips = $('#chips');
for (const k of ORDER) { const b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.dataset.spot = k; b.textContent = NAMES[k]; b.addEventListener('click', () => select(k)); chips.append(b); }
$('#reset').addEventListener('click', () => select('welcome'));
$('#sheet-close').addEventListener('click', () => select('welcome'));

// ---------- hotspots ----------
function buildSpots(layer, positioned2d) {
  layer.replaceChildren(); spotEls = {};
  for (const k of ORDER) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'spot'; b.dataset.spot = k; b.setAttribute('aria-label', NAMES[k]);
    const dot = document.createElement('span'); dot.className = 'dot'; dot.setAttribute('aria-hidden', 'true');
    const lab = document.createElement('span'); lab.className = 'lbl'; lab.textContent = NAMES[k];
    b.append(dot, lab); b.addEventListener('click', () => select(k));
    if (positioned2d) { b.style.left = POS2D[k].left; b.style.top = POS2D[k].top; b.style.transform = 'translate(-50%, -50%)'; }
    layer.append(b); spotEls[k] = b;
  }
}

// ---------- time of day ----------
const h = new Date().getHours();
let tod = h >= 5 && h < 10 ? 'morning' : (h >= 10 && h < 17 ? 'day' : 'night');
function setTod(t) {
  tod = t; document.documentElement.dataset.tod = t;
  for (const b of document.querySelectorAll('[data-tod]')) b.setAttribute('aria-pressed', String(b.dataset.tod === t));
  if (api) api.setTod(t);
}
for (const b of document.querySelectorAll('button[data-tod]')) b.addEventListener('click', () => setTod(b.dataset.tod));

// ---------- 3D / 2D ----------
const view = $('#view'), modeBtn = $('#mode');
function teardown() { if (api) { api.dispose(); api = null; } view.replaceChildren(); }
function start2d(note) {
  teardown(); mode = '2d'; loading.hidden = true;
  const fig = document.createElement('div'); fig.className = 'fig2d';
  const img = document.createElement('img'); img.src = '/room/room-2d.svg'; img.alt = '晴翔の部屋のイラスト。奥の角にギター、奥の壁に時計と机、右奥にターンテーブルとカメラ、左の壁にピアノと世界地図、右にベッドと窓、手前に本棚と入口。';
  const wrap = document.createElement('div'); wrap.className = 'room2d';
  const layer = document.createElement('div'); layer.className = 'spots2d';
  wrap.append(img, layer); fig.append(wrap); view.append(fig); buildSpots(layer, true);
  modeBtn.textContent = '3Dで見る'; modeBtn.hidden = !glOK;
  $('#hint').textContent = note || '光っている物をタップ';
  renderPanel();
}
function start3d() {
  teardown(); mode = '3d'; loading.hidden = false;
  const layer = document.createElement('div'); layer.className = 'spots3d';
  view.append(layer); buildSpots(layer, false);
  modeBtn.textContent = '2Dで見る'; modeBtn.hidden = false;
  $('#hint').textContent = 'ドラッグで回す · ホイール / ピンチで寄る · 物をタップ';
  import('./room3d.js').then(({ createRoom3D }) => {
    if (mode !== '3d') return;
    api = createRoom3D(view, { spotEls, onSelect: select, reducedMotion: reduce, onReady: () => { loading.hidden = true; } });
    view.prepend(view.querySelector('canvas'));
    api.setTod(tod);
    if (current !== 'welcome') { api.focus(current); api.setSpinning(current === 'turntable'); }
    renderPanel();
  }).catch(() => start2d('3Dを読み込めなかったので、2Dで表示しています'));
}
modeBtn.addEventListener('click', () => { const next = mode === '3d' ? '2d' : '3d'; store.set('room-mode', next); next === '3d' ? start3d() : start2d(); });

setTod(tod);
renderPanel();
const saved = store.get('room-mode');
if (!glOK) start2d('この端末では3Dが使えないため、2Dで表示しています');
else if (saved === '2d' || (!saved && (reduce || lowMem))) start2d(reduce ? '動きを減らす設定のため、2Dで表示しています' : null);
else start3d();
setInterval(() => { if (current === 'clock') renderPanel(); }, 30000);
}
