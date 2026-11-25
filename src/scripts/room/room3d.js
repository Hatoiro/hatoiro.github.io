// 晴翔の部屋 — 3D scene. Same room coordinates as the 2D illustration:
// room x → three x, room y → three z, room z (height) → three y.
import {
  WebGLRenderer, Scene, OrthographicCamera, BoxGeometry, CylinderGeometry, SphereGeometry, TorusGeometry,
  PlaneGeometry, MeshLambertMaterial, MeshBasicMaterial, Mesh, Group, HemisphereLight, DirectionalLight,
  PointLight, CanvasTexture, SRGBColorSpace, RepeatWrapping, PCFSoftShadowMap, Vector3, Vector2, Raycaster,
  EdgesGeometry, LineSegments, LineDashedMaterial, AdditiveBlending, Color
} from 'three';

const W = 9.35, H = 10.55, HW = 7.0, T = 0.3;
const R = (x, y, z) => new Vector3(x, z, y);

export function createRoom3D(stage, opts) {
  const { spotEls, onSelect, onReady, reducedMotion } = opts;

  // ---------- renderer: capped pixel ratio, static shadows ----------
  const small = Math.min(innerWidth, innerHeight) < 700;
  const dpr = Math.min(devicePixelRatio || 1, small ? 1.5 : 2);
  const renderer = new WebGLRenderer({ antialias: dpr < 2, alpha: true, powerPreference: 'default' });
  renderer.setPixelRatio(dpr);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;   // shadows are computed once …
  renderer.shadowMap.needsUpdate = true;   // … on the first frame, then reused
  renderer.domElement.className = 'gl';
  renderer.domElement.tabIndex = 0;
  renderer.domElement.setAttribute('aria-label', '晴翔の部屋（3D）。ドラッグで回転、ホイールかピンチで拡大、矢印キーでも回せます。');
  stage.appendChild(renderer.domElement);

  const scene = new Scene();
  const root = new Group();
  scene.add(root);

  // ---------- helpers ----------
  const mats = new Map();
  const mat = (color, extra) => {
    const k = color + (extra ? JSON.stringify(extra) : '');
    if (!mats.has(k)) mats.set(k, new MeshLambertMaterial({ color, ...(extra || {}) }));
    return mats.get(k);
  };
  const unitBox = new BoxGeometry(1, 1, 1);
  const unitCyl = new CylinderGeometry(1, 1, 1, 32);
  let tag = null;
  const add = (m, { cast = true, recv = true, still = true } = {}) => {
    m.castShadow = cast; m.receiveShadow = recv; m.userData.spot = tag;
    root.add(m);
    if (still) { m.updateMatrix(); m.matrixAutoUpdate = false; }
    return m;
  };
  const B = (x0, y0, z0, x1, y1, z1, color, o = {}) => {
    const m = new Mesh(unitBox, o.m || mat(color));
    m.scale.set(x1 - x0, z1 - z0, y1 - y0);
    m.position.set((x0 + x1) / 2, (z0 + z1) / 2, (y0 + y1) / 2);
    return add(m, o);
  };
  // flat disc facing +z (three) — guitar bodies, clock face
  const discZ = (x, y, z, rx, rz, th, color, o = {}) => {
    const m = new Mesh(unitCyl, o.m || mat(color));
    m.rotation.x = Math.PI / 2; m.scale.set(rx, th, rz); m.position.copy(R(x, y, z));
    return add(m, o);
  };
  // flat disc lying on a surface (vertical axis)
  const discY = (x, y, z, r, th, color, o = {}) => {
    const m = new Mesh(unitCyl, o.m || mat(color));
    m.scale.set(r, th, r); m.position.copy(R(x, y, z));
    return add(m, o);
  };
  const canvasTex = (w, h, draw) => {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; t.anisotropy = 4;
    return t;
  };

  // ---------- floor & walls ----------
  B(0, 0, -0.35, W, H, 0, '#7E5E3C', { cast: false });
  const plank = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#B98D5E'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(110,78,44,0.55)'; g.lineWidth = 2;
    for (let i = 0; i < 8; i++) { g.beginPath(); g.moveTo(0, i * 32 + 1); g.lineTo(w, i * 32 + 1); g.stroke();
      g.beginPath(); const x = ((i * 97) % 256); g.moveTo(x, i * 32); g.lineTo(x, i * 32 + 32); g.stroke(); }
  });
  plank.wrapS = plank.wrapT = RepeatWrapping; plank.repeat.set(1.4, H / (0.6 * 8));
  const floor = new Mesh(new PlaneGeometry(W, H), new MeshLambertMaterial({ map: plank }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(W / 2, 0.002, H / 2);
  add(floor, { cast: false });

  B(-T, 0, -0.35, 0, H, HW, '#E9E2D4', { cast: false });          // left wall
  B(-T, -T, -0.35, W, 0, HW, '#DAD1BF', { cast: false });         // back wall (top of the plan)
  B(-T - 0.02, -T - 0.02, HW, W, 0, HW + 0.08, '#2A2622', { cast: false });
  B(-T - 0.02, 0, HW, 0, H, HW + 0.08, '#2A2622', { cast: false });
  B(0, 0, 0, 0.05, H, 0.25, '#CFC6B4', { cast: false });
  B(0, 0, 0, W, 0.05, 0.25, '#C3B9A6', { cast: false });

  // ---------- wall clock (live) ----------
  tag = 'clock';
  discZ(4.15, 0.02, 5.35, 0.58, 0.58, 0.05, '#2A2622');
  discZ(4.15, 0.05, 5.35, 0.52, 0.52, 0.03, '#F4F1EA');
  for (let k = 0; k < 12; k++) {
    const a = k / 12 * Math.PI * 2, s = k % 3 ? 0.035 : 0.06;
    B(4.15 + 0.42 * Math.sin(a) - s / 2, 0.06, 5.35 + 0.42 * Math.cos(a) - s / 2, 4.15 + 0.42 * Math.sin(a) + s / 2, 0.08, 5.35 + 0.42 * Math.cos(a) + s / 2, '#2A2622', { cast: false });
  }
  const hand = (L, wdt, color) => {
    const g = new BoxGeometry(wdt, L, 0.02); g.translate(0, L / 2 - 0.04, 0);
    const m = new Mesh(g, mat(color)); m.position.copy(R(4.15, 0.09, 5.35));
    return add(m, { cast: false, still: false });
  };
  const hourHand = hand(0.27, 0.05, '#2A2622');
  const minHand = hand(0.4, 0.03, '#2A2622');
  discZ(4.15, 0.1, 5.35, 0.04, 0.04, 0.02, '#B5341C', { cast: false });
  const setClock = () => {
    const d = new Date(), h = d.getHours() % 12 + d.getMinutes() / 60, m = d.getMinutes() + d.getSeconds() / 60;
    hourHand.rotation.z = -h / 12 * Math.PI * 2;
    minHand.rotation.z = -m / 60 * Math.PI * 2;
  };
  setClock();

  // ---------- world map (left wall, above the piano) ----------
  tag = 'map';
  B(0, 3.1, 3.75, 0.04, 6.6, 5.85, '#2A2622', { cast: false });
  const mapTex = canvasTex(660, 380, (g, w, h) => {
    g.fillStyle = '#EFE8D8'; g.fillRect(0, 0, w, h);
    const X = (u) => (1 - u) * w, Y = (v) => (1 - v) * h;   // mirrored: plane faces into the room
    const conts = [[[0.08, 0.75], [0.2, 0.82], [0.3, 0.7], [0.25, 0.55], [0.2, 0.5], [0.12, 0.6]],
      [[0.24, 0.45], [0.3, 0.42], [0.33, 0.25], [0.28, 0.1], [0.24, 0.25]],
      [[0.44, 0.8], [0.55, 0.82], [0.52, 0.66], [0.45, 0.68]],
      [[0.45, 0.62], [0.57, 0.62], [0.6, 0.45], [0.55, 0.22], [0.5, 0.25], [0.46, 0.45]],
      [[0.55, 0.84], [0.86, 0.86], [0.9, 0.7], [0.8, 0.55], [0.68, 0.5], [0.6, 0.62]],
      [[0.8, 0.3], [0.9, 0.32], [0.9, 0.2], [0.82, 0.2]]];
    g.fillStyle = '#B9AE96';
    for (const c of conts) { g.beginPath(); c.forEach(([u, v], i) => i ? g.lineTo(X(u), Y(v)) : g.moveTo(X(u), Y(v))); g.closePath(); g.fill(); }
    for (const [u, v] of [[0.48, 0.72], [0.585, 0.42], [0.855, 0.66]]) {
      g.fillStyle = '#B5341C'; g.beginPath(); g.arc(X(u), Y(v), 9, 0, 7); g.fill();
      g.strokeStyle = '#F3EFE6'; g.lineWidth = 3; g.stroke();
    }
  });
  const mapPlane = new Mesh(new PlaneGeometry(3.3, 1.9), new MeshLambertMaterial({ map: mapTex }));
  mapPlane.rotation.y = Math.PI / 2; mapPlane.position.copy(R(0.045, 4.85, 4.8));
  add(mapPlane, { cast: false });

  // ---------- tennis racket hung beside the map ----------
  tag = 'racket';
  B(0.04, 7.32, 3.75, 0.1, 7.42, 4.62, '#2A2622');
  const ring = new Mesh(new TorusGeometry(0.38, 0.035, 8, 40), mat('#B5341C'));
  ring.rotation.y = Math.PI / 2; ring.scale.set(0.34 / 0.38, 0.5 / 0.38, 1); ring.position.copy(R(0.08, 7.37, 5.12));
  add(ring);
  const strings = canvasTex(64, 96, (g, w, h) => {
    g.clearRect(0, 0, w, h); g.strokeStyle = 'rgba(140,133,122,0.9)'; g.lineWidth = 1;
    for (let x = 4; x < w; x += 8) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    for (let y = 4; y < h; y += 8) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  });
  const strPlane = new Mesh(new PlaneGeometry(0.62, 0.94), new MeshBasicMaterial({ map: strings, transparent: true }));
  strPlane.rotation.y = Math.PI / 2; strPlane.position.copy(R(0.075, 7.37, 5.12));
  add(strPlane, { cast: false, recv: false });

  // ---------- guitars in the far corner ----------
  tag = 'guitar';
  const guitar = (x, y, body, elec) => {
    const zf = y + 0.12;
    if (elec) {
      discZ(x, zf, 0.95, 0.42, 0.5, 0.14, body); discZ(x - 0.05, zf, 1.55, 0.32, 0.36, 0.14, body);
      B(x - 0.18, zf + 0.07, 0.75, x + 0.18, zf + 0.1, 0.82, '#D9D9D9'); B(x - 0.18, zf + 0.07, 1.18, x + 0.18, zf + 0.1, 1.25, '#D9D9D9');
      B(x - 0.07, y + 0.08, 1.6, x + 0.07, y + 0.16, 3.2, '#5A4230'); B(x - 0.13, y + 0.06, 3.2, x + 0.13, y + 0.16, 3.6, '#2A2622');
    } else {
      discZ(x, zf, 0.95, 0.55, 0.58, 0.3, body); discZ(x, zf, 1.75, 0.42, 0.42, 0.3, body);
      discZ(x, zf + 0.16, 1.55, 0.17, 0.17, 0.01, '#2A1A10', { cast: false });
      B(x - 0.25, zf + 0.15, 0.72, x + 0.25, zf + 0.17, 0.8, '#2A1A10', { cast: false });
      B(x - 0.07, y + 0.08, 2.0, x + 0.07, y + 0.16, 3.35, '#5A4230'); B(x - 0.12, y + 0.06, 3.35, x + 0.12, y + 0.16, 3.75, '#2A2622');
    }
    B(x - 0.35, y + 0.4, 0, x + 0.35, y + 0.6, 0.12, '#2A2622');
  };
  guitar(0.85, 0.2, '#2F5FA8', true);
  guitar(1.95, 0.3, '#9A6436', false);

  // ---------- square cabinet: turntable + cameras ----------
  tag = 'turntable';
  B(6.9, 0.15, 0, 9.25, 2.45, 2.3, '#E7DFCE');
  B(8.05, 2.45, 0.12, 8.09, 2.47, 2.18, '#2A2622', { cast: false });
  B(7.85, 2.45, 1.15, 7.95, 2.5, 1.25, '#2A2622', { cast: false }); B(8.19, 2.45, 1.15, 8.29, 2.5, 1.25, '#2A2622', { cast: false });
  B(7.0, 0.3, 2.3, 8.35, 1.55, 2.5, '#C9A77C');
  const record = new Group(); record.position.copy(R(7.62, 0.92, 2.52)); record.userData.spot = 'turntable';
  const rec = new Mesh(unitCyl, mat('#1A1A1A')); rec.scale.set(0.5, 0.02, 0.5); rec.castShadow = true; rec.userData.spot = 'turntable';
  const lab = new Mesh(unitCyl, mat('#E9C7B4')); lab.scale.set(0.15, 0.03, 0.15); lab.userData.spot = 'turntable';
  const nick = new Mesh(unitBox, mat('#F3EFE6')); nick.scale.set(0.04, 0.035, 0.1); nick.position.set(0, 0, 0.08); nick.userData.spot = 'turntable';
  const groove = new Mesh(new TorusGeometry(0.34, 0.006, 4, 48), mat('#3A3A3A')); groove.rotation.x = Math.PI / 2; groove.position.y = 0.012; groove.userData.spot = 'turntable';
  record.add(rec, lab, nick, groove); root.add(record);
  B(8.17, 0.4, 2.5, 8.25, 0.48, 2.62, '#C9CCCF');
  const arm = new Mesh(unitBox, mat('#C9CCCF')); arm.scale.set(0.03, 0.03, 0.62); arm.position.copy(R(8.1, 0.74, 2.6)); arm.rotation.y = 0.32; add(arm);

  tag = 'camera';
  B(8.45, 0.3, 2.3, 9.15, 0.82, 2.85, '#2B2B2B'); B(8.62, 0.4, 2.85, 8.98, 0.75, 3.06, '#2B2B2B');
  const lens1 = new Mesh(unitCyl, mat('#3A3A3A')); lens1.rotation.x = Math.PI / 2; lens1.scale.set(0.19, 0.42, 0.19); lens1.position.copy(R(8.79, 1.02, 2.58)); add(lens1);
  discZ(8.79, 1.235, 2.58, 0.15, 0.15, 0.01, '#202A3A', { cast: false });
  B(8.45, 1.45, 2.3, 9.15, 1.9, 2.66, '#1E1E1E'); B(8.45, 1.45, 2.66, 9.15, 1.9, 2.8, '#C9CCCF'); B(8.66, 1.55, 2.8, 8.94, 1.8, 2.98, '#C9CCCF');
  const lens2 = new Mesh(unitCyl, mat('#B9BDC2')); lens2.rotation.x = Math.PI / 2; lens2.scale.set(0.16, 0.36, 0.16); lens2.position.copy(R(8.8, 2.08, 2.5)); add(lens2);

  // ---------- desk, mic, laptop ----------
  tag = 'pc';
  B(2.6, 0, 0, 2.75, 1.6, 1.85, '#D8CDB8'); B(5.5, 0, 0, 5.65, 1.6, 1.85, '#D8CDB8'); B(2.6, 0, 1.85, 5.65, 1.6, 2.0, '#E9DFC9');
  B(3.6, 0.45, 2.0, 4.75, 1.2, 2.06, '#B9BDC2'); B(3.6, 0.36, 2.06, 4.75, 0.45, 2.85, '#B9BDC2');
  const scr = canvasTex(256, 170, (g, w, h) => {
    g.fillStyle = '#0B1424'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(245,184,65,0.8)'; g.setLineDash([6, 6]); g.lineWidth = 3;
    g.beginPath(); g.moveTo(40, 120); g.quadraticCurveTo(130, 20, 220, 70); g.stroke();
    g.fillStyle = '#F5B841'; g.beginPath(); g.arc(70, 92, 7, 0, 7); g.fill();
  });
  const screen = new Mesh(new PlaneGeometry(1.01, 0.67), new MeshBasicMaterial({ map: scr }));
  screen.position.copy(R(4.175, 0.456, 2.455)); add(screen, { cast: false, recv: false });
  tag = 'mic';
  B(2.95, 0.7, 2.0, 3.05, 0.8, 2.6, '#2A2622');
  const micBody = new Mesh(unitCyl, mat('#3A3530')); micBody.scale.set(0.15, 0.55, 0.15); micBody.position.copy(R(3.0, 0.76, 2.88)); add(micBody);
  const micBand = new Mesh(unitCyl, mat('#B5341C')); micBand.scale.set(0.155, 0.06, 0.155); micBand.position.copy(R(3.0, 0.76, 2.83)); add(micBand, { cast: false });

  // ---------- chair ----------
  tag = null;
  B(3.9, 2.2, 0, 4.8, 3.0, 0.12, '#2A2622'); B(4.3, 2.55, 0.12, 4.4, 2.65, 1.4, '#3A3530');
  B(3.8, 2.1, 1.4, 4.9, 3.0, 1.62, '#3E3A36'); B(3.85, 3.0, 1.55, 4.85, 3.15, 3.1, '#3E3A36');

  // ---------- upright piano with records and globe ----------
  tag = 'piano';
  B(0, 2.9, 0, 1.25, 7.3, 3.1, '#1E1C1A');
  B(1.25, 3.0, 0, 1.8, 3.2, 0.85, '#1E1C1A'); B(1.25, 7.0, 0, 1.8, 7.2, 0.85, '#1E1C1A');
  for (const yy of [4.9, 5.05, 5.2]) B(1.25, yy, 0, 1.45, yy + 0.08, 0.08, '#C8A64E', { cast: false });
  B(1.25, 3.05, 1.85, 1.95, 7.15, 2.02, '#1E1C1A');
  B(1.42, 3.12, 2.02, 1.93, 7.08, 2.05, '#F4F1EA', { cast: false });
  for (let yy = 3.12, i = 0; yy < 6.95; yy += 0.135, i++) {
    if ([0, 1, 3, 4, 5].includes(i % 7)) B(1.42, yy + 0.09, 2.05, 1.7, yy + 0.18, 2.1, '#141414', { cast: false });
  }
  B(0.12, 3.25, 3.1, 0.2, 4.15, 4.0, '#E6B8A2'); B(0.22, 4.3, 3.1, 0.3, 5.2, 4.0, '#5B7A8C');
  const vinyl = new Mesh(unitCyl, mat('#141414')); vinyl.rotation.z = Math.PI / 2; vinyl.scale.set(0.3, 0.02, 0.3); vinyl.position.copy(R(0.21, 4.2, 3.85)); add(vinyl);
  B(0.5, 3.35, 3.1, 1.0, 4.6, 3.18, '#2A2622');
  tag = 'racket';
  const ball = new Mesh(new SphereGeometry(0.12, 16, 12), mat('#CFE03C')); ball.position.copy(R(0.85, 5.6, 3.22)); add(ball);
  tag = 'globe';
  B(0.55, 6.35, 3.1, 0.95, 6.75, 3.22, '#2A2622'); B(0.72, 6.52, 3.22, 0.78, 6.58, 3.72, '#8C7A5B');
  const globeTex = canvasTex(256, 128, (g, w, h) => {
    g.fillStyle = '#3C6E8F'; g.fillRect(0, 0, w, h); g.fillStyle = '#C9B98F';
    for (const [x, y, rx, ry] of [[40, 45, 22, 18], [52, 85, 12, 22], [120, 40, 20, 14], [128, 75, 14, 24], [180, 45, 40, 18], [214, 92, 14, 9]]) { g.beginPath(); g.ellipse(x, y, rx, ry, 0.3, 0, 7); g.fill(); }
  });
  const globe = new Mesh(new SphereGeometry(0.55, 32, 20), new MeshLambertMaterial({ map: globeTex }));
  globe.position.copy(R(0.75, 6.55, 4.25)); globe.rotation.set(0.41, 2.2, 0); add(globe);
  const merid = new Mesh(new TorusGeometry(0.62, 0.025, 6, 40, Math.PI * 1.2), mat('#8C7A5B'));
  merid.position.copy(R(0.75, 6.55, 4.25)); merid.rotation.set(0, Math.PI / 2, 0.41 - 0.6); add(merid);

  // ---------- loft bed (kept low for visibility) ----------
  tag = null;
  B(6.65, 3.45, 1.4, 6.8, 3.6, 2.6, '#C9B391'); B(9.2, 3.45, 1.4, 9.35, 3.6, 2.6, '#C9B391'); B(6.65, 3.45, 2.42, 9.35, 3.6, 2.58, '#C9B391');
  B(6.65, 3.6, 0, 9.35, 8.0, 1.4, '#D3BE9C');
  for (const z of [0.47, 0.94]) B(6.75, 8.0, z - 0.01, 9.25, 8.02, z + 0.01, '#7E6A4C', { cast: false });
  for (const xx of [7.9, 8.6]) B(xx - 0.01, 8.0, 0.05, xx + 0.01, 8.02, 1.35, '#7E6A4C', { cast: false });
  B(6.75, 3.65, 1.4, 9.25, 7.95, 1.9, '#F4F1EA'); B(7.0, 3.8, 1.9, 9.0, 4.6, 2.2, '#FBF9F4');
  B(6.75, 4.9, 1.9, 9.25, 7.95, 2.05, '#3E4A5A'); B(9.22, 3.6, 2.05, 9.35, 6.2, 2.58, '#C9B391');
  B(7.1, 8.0, 0, 7.18, 8.12, 2.7, '#B49A74'); B(7.62, 8.0, 0, 7.7, 8.12, 2.7, '#B49A74');
  for (const z of [0.5, 1.0, 1.5, 2.0, 2.45]) B(7.18, 8.02, z, 7.62, 8.1, z + 0.07, '#B49A74');
  const patchMat = new MeshBasicMaterial({ color: '#FFF4DC', transparent: true, opacity: 0.3, blending: AdditiveBlending, depthWrite: false });
  const patch = new Mesh(new PlaneGeometry(1.6, 3.4), patchMat);
  patch.rotation.x = -Math.PI / 2; patch.position.copy(R(8.45, 6.0, 2.06)); add(patch, { cast: false, recv: false });

  // ---------- bookshelf (cut low) + dashed ghost up to the ceiling ----------
  tag = 'books';
  B(3.0, 8.9, 0, W, 10.45, 2.4, '#B39D7A');
  const cols = ['#7B2A1E', '#2F4A3A', '#E2D7C0', '#3B3833', '#B5341C', '#6B6357', '#D9C9A3', '#2F5FA8', '#8A5A33', '#E9E2D4', '#4E4A44', '#C9B98F'];
  let bx = 3.12, bi = 0, seed = 7;
  while (bx < 9.2) { seed = (seed * 9301 + 49297) % 233280; const wd = 0.1 + (seed / 233280) * 0.12;
    B(bx, 9.0, 2.4, bx + wd, 9.7, 2.44 + (seed % 3) * 0.015, cols[bi++ % cols.length], { cast: false }); bx += wd + 0.02; }
  const ghost = new LineSegments(new EdgesGeometry(new BoxGeometry(W - 3.0, HW - 2.4, 1.55)),
    new LineDashedMaterial({ color: '#2A2622', dashSize: 0.16, gapSize: 0.12, transparent: true, opacity: 0.35 }));
  ghost.position.copy(R((3.0 + W) / 2, (8.9 + 10.45) / 2, (2.4 + HW) / 2)); ghost.computeLineDistances(); root.add(ghost);

  // ---------- front walls cut low, window, door ----------
  tag = 'window';
  B(W, 0, 0, W + T, 3.3, 1.0, '#E9E2D4', { cast: false }); B(W, 7.5, 0, W + T, H + T, 1.0, '#E9E2D4', { cast: false });
  B(W, 3.3, 0, W + T, 7.5, 0.35, '#E9E2D4', { cast: false });
  const glassMat = new MeshLambertMaterial({ color: '#BFD3E0', transparent: true, opacity: 0.55 });
  B(W + 0.1, 3.3, 0.35, W + 0.2, 7.5, 1.0, '', { m: glassMat, cast: false });
  B(W - 0.05, 3.2, 1.0, W + T + 0.12, 7.6, 1.06, '#F4F1EA', { cast: false });
  tag = 'books';
  B(2.6, H, 0, W, H + T, 1.0, '#E9E2D4', { cast: false });
  tag = 'door';
  B(0, H, 0, 0.05, H + T, 1.0, '#E9E2D4', { cast: false });
  B(0.3, H - 0.9, 0, 2.3, H, 0.02, '#5E5A52', { cast: false });

  // ---------- lights ----------
  const hemi = new HemisphereLight('#FFF6E8', '#8A7458', 1.9);
  const sun = new DirectionalLight('#FFFFFF', 2.4);
  sun.position.copy(R(W + 7, H + 1, 10)); sun.target.position.copy(R(W / 2, H / 2, 0));
  sun.castShadow = true;
  sun.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10, near: 1, far: 40 });
  sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03;
  const lamp = new PointLight('#FFC98A', 0, 7, 2); lamp.position.copy(R(4.2, 1.6, 3.4));
  scene.add(hemi, sun, sun.target, lamp);

  const TOD = {
    morning: { hemi: ['#FFE7CF', '#8A6E52', 1.6], sun: ['#FFD6A8', 2.6], lamp: 0, patch: ['#FFD39A', 0.35] },
    day: { hemi: ['#FFF6E8', '#8A7458', 1.9], sun: ['#FFFFFF', 2.4], lamp: 0, patch: ['#FFF4DC', 0.18] },
    night: { hemi: ['#5A6690', '#2A2630', 0.75], sun: ['#9DB8FF', 0.55], lamp: 5, patch: ['#9DB8FF', 0.2] }
  };
  const setTod = (k) => {
    const t = TOD[k] || TOD.day;
    hemi.color.set(t.hemi[0]); hemi.groundColor.set(t.hemi[1]); hemi.intensity = t.hemi[2];
    sun.color.set(t.sun[0]); sun.intensity = t.sun[1]; lamp.intensity = t.lamp;
    patchMat.color.set(t.patch[0]); patchMat.opacity = t.patch[1];
    request();   // colour change only: the shadow map is still valid
  };

  // ---------- camera ----------
  const cam = new OrthographicCamera(-1, 1, 1, -1, 0.1, 120);
  const home = { target: new Vector3(W / 2 - 0.3, 2.6, H / 2), az: Math.PI / 4, el: 0.56, zoom: 1 };
  const view = { target: home.target.clone(), az: home.az, el: home.el, zoom: home.zoom };
  const AZ = [0.33, 1.24], EL = [0.32, 0.9], ZM = [0.85, 3.2];
  const clamp = (v, [a, b]) => Math.min(b, Math.max(a, v));
  let vw = 1, vh = 1;
  const placeCamera = () => {
    const d = 40, c = Math.cos(view.el);
    cam.position.set(view.target.x + d * c * Math.cos(view.az), view.target.y + d * Math.sin(view.el), view.target.z + d * c * Math.sin(view.az));
    cam.lookAt(view.target);
    const aspect = vw / vh, half = Math.max(6.4, 7.8 / aspect) / view.zoom;
    cam.left = -half * aspect; cam.right = half * aspect; cam.top = half; cam.bottom = -half;
    cam.updateProjectionMatrix();
  };

  // ---------- hotspot anchors ----------
  const anchors = {
    clock: R(4.15, 0.05, 6.1), map: R(0.05, 4.85, 6.1), racket: R(0.08, 7.37, 5.95), guitar: R(1.4, 0.5, 3.9),
    turntable: R(7.3, 1.25, 2.95), camera: R(8.95, 1.0, 3.5), mic: R(3.0, 0.76, 3.4), pc: R(4.2, 0.5, 3.2),
    piano: R(0.3, 4.25, 4.4), globe: R(0.75, 6.55, 5.1), books: R(6.2, 9.6, 3.0), window: R(W + 0.1, 5.4, 1.6), door: R(1.3, H - 0.45, 0.6)
  };
  const v3 = new Vector3();
  const placeSpots = () => {
    for (const [k, el] of Object.entries(spotEls)) {
      const a = anchors[k]; if (!a) continue;
      v3.copy(a).project(cam);
      el.style.transform = `translate(${((v3.x + 1) / 2 * vw).toFixed(1)}px, ${((1 - v3.y) / 2 * vh).toFixed(1)}px) translate(-50%, -50%)`;
    }
  };

  // ---------- render on demand ----------
  let queued = false, spinning = false, visible = true, lastSpin = 0, tween = null;
  function request() { if (!queued) { queued = true; requestAnimationFrame(frame); } }
  function frame(t) {
    queued = false;
    let again = false;
    if (tween) {
      const p = Math.min(1, (t - tween.t0) / tween.dur), e = 1 - Math.pow(1 - p, 3);
      view.target.lerpVectors(tween.from.target, tween.to.target, e);
      view.az = tween.from.az + (tween.to.az - tween.from.az) * e;
      view.el = tween.from.el + (tween.to.el - tween.from.el) * e;
      view.zoom = tween.from.zoom + (tween.to.zoom - tween.from.zoom) * e;
      if (p >= 1) tween = null; else again = true;
    }
    if (spinning && visible) {
      // ~30 fps is plenty for a record: skip every other display frame unless the camera is moving
      if (lastSpin && !tween && t - lastSpin < 30) { queued = true; requestAnimationFrame(frame); return; }
      if (lastSpin) record.rotation.y -= ((t - lastSpin) / 1800) * Math.PI * 2;   // 33⅓ rpm
      lastSpin = t; again = true;
    } else lastSpin = 0;
    placeCamera();
    renderer.render(scene, cam);
    placeSpots();
    if (again) request();
  }
  const animateTo = (to) => {
    const from = { target: view.target.clone(), az: view.az, el: view.el, zoom: view.zoom };
    const dest = { target: to.target || from.target, az: to.az ?? from.az, el: to.el ?? from.el, zoom: to.zoom ?? from.zoom };
    if (reducedMotion) { Object.assign(view, { ...dest, target: dest.target.clone() }); request(); return; }
    tween = { from, to: dest, t0: performance.now(), dur: 650 }; request();
  };

  // ---------- resize / visibility ----------
  const resize = () => {
    const r = stage.getBoundingClientRect(); vw = Math.max(1, r.width); vh = Math.max(1, r.height);
    renderer.setSize(vw, vh, false); renderer.domElement.style.width = vw + 'px'; renderer.domElement.style.height = vh + 'px';
    request();
  };
  const ro = new ResizeObserver(resize); ro.observe(stage);
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) request(); });
  io.observe(stage);
  const clockTimer = setInterval(() => { setClock(); request(); }, 30000);

  // ---------- input: drag to orbit, wheel/pinch to zoom, tap to pick ----------
  const el = renderer.domElement, ray = new Raycaster(), ndc = new Vector2();
  const pts = new Map(); let down = null, pinch0 = 0, zoom0 = 1;
  const pick = (cx, cy) => {
    const r = el.getBoundingClientRect(); ndc.set((cx - r.left) / r.width * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, cam);
    for (const hit of ray.intersectObjects(root.children, true)) { let o = hit.object; while (o && o.userData.spot === undefined) o = o.parent; if (o && o.userData.spot) return o.userData.spot; if (o && o.userData.spot === null) return null; }
    return null;
  };
  el.addEventListener('pointerdown', (e) => {
    el.setPointerCapture(e.pointerId); pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 1) down = { x: e.clientX, y: e.clientY, t: performance.now(), moved: 0 };
    if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch0 = Math.hypot(a.x - b.x, a.y - b.y); zoom0 = view.zoom; }
    tween = null;
  });
  el.addEventListener('pointermove', (e) => {
    if (!pts.has(e.pointerId)) {
      if (e.pointerType === 'mouse') el.style.cursor = pick(e.clientX, e.clientY) ? 'pointer' : 'grab';
      return;
    }
    const p = pts.get(e.pointerId), dx = e.clientX - p.x, dy = e.clientY - p.y;
    p.x = e.clientX; p.y = e.clientY;
    if (pts.size === 2) { const [a, b] = [...pts.values()]; view.zoom = clamp(zoom0 * Math.hypot(a.x - b.x, a.y - b.y) / pinch0, ZM); if (down) down.moved = 99; }
    else { view.az = clamp(view.az - dx * 0.006, AZ); view.el = clamp(view.el + dy * 0.004, EL); if (down) down.moved += Math.abs(dx) + Math.abs(dy); }
    request();
  });
  const up = (e) => {
    pts.delete(e.pointerId);
    if (down && pts.size === 0) {
      if (down.moved < 8 && performance.now() - down.t < 500) { const s = pick(e.clientX, e.clientY); if (s) onSelect(s); }
      down = null;
    }
  };
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  el.addEventListener('wheel', (e) => { e.preventDefault(); view.zoom = clamp(view.zoom * Math.exp(-e.deltaY * 0.0015), ZM); request(); }, { passive: false });
  el.addEventListener('keydown', (e) => {
    const k = e.key; let used = true;
    if (k === 'ArrowLeft') view.az = clamp(view.az + 0.08, AZ); else if (k === 'ArrowRight') view.az = clamp(view.az - 0.08, AZ);
    else if (k === 'ArrowUp') view.el = clamp(view.el + 0.05, EL); else if (k === 'ArrowDown') view.el = clamp(view.el - 0.05, EL);
    else if (k === '+' || k === '=') view.zoom = clamp(view.zoom * 1.15, ZM); else if (k === '-') view.zoom = clamp(view.zoom / 1.15, ZM);
    else used = false;
    if (used) { e.preventDefault(); request(); }
  });

  resize();
  requestAnimationFrame(() => { request(); onReady && onReady(); });

  return {
    setTod,
    focus(spot) { const a = anchors[spot]; if (!a) return; animateTo({ target: a.clone().add(new Vector3(0, -0.5, 0)), zoom: 2.1 }); },
    reset() { animateTo({ target: home.target.clone(), az: home.az, el: home.el, zoom: 1 }); },
    setSpinning(on) { spinning = !!on && !reducedMotion; request(); },
    dispose() {
      ro.disconnect(); io.disconnect(); clearInterval(clockTimer);
      renderer.dispose(); el.remove();
    }
  };
}
