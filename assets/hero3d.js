// 3D-фигуры в первом экране: объём, мягкий свет, камера следует за курсором и прокруткой
import * as THREE from './vendor/three.module.min.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';
import { RoundedBoxGeometry } from './vendor/RoundedBoxGeometry.js';

const hero = document.querySelector('.hero');
const canvas = document.getElementById('hero3d');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

const R = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
R.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.05;
R.outputColorSpace = THREE.SRGBColorSpace; R.setClearColor(0, 0);

const S = new THREE.Scene();
const pm = new THREE.PMREMGenerator(R);
S.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose();
S.fog = new THREE.Fog(0x05070c, 16, 34);
const key = new THREE.DirectionalLight(0xffffff, 1.2); key.position.set(6, 10, 8); S.add(key);
const rim = new THREE.DirectionalLight(0x22d3ee, 2.6); rim.position.set(-8, -3, -6); S.add(rim);
const rim2 = new THREE.DirectionalLight(0x3b82f6, 1.8); rim2.position.set(9, -4, -4); S.add(rim2);
S.add(new THREE.HemisphereLight(0x9bdcff, 0x05070c, .3));

const cam = new THREE.PerspectiveCamera(35, 1, .1, 80);
const CZ = 18;

// [геометрия, цвет, x и y в долях экрана (-1…1), глубина z, размер]
const G = {
  box: () => new RoundedBoxGeometry(1.8, 1.8, 1.8, 6, .38),
  torus: () => new THREE.TorusGeometry(1, .4, 40, 90),
  sphere: () => new THREE.SphereGeometry(1, 56, 28),
  capsule: () => new THREE.CapsuleGeometry(.55, 1.3, 14, 28),
  ico: () => new THREE.IcosahedronGeometry(1.1, 0),
  knot: () => new THREE.TorusKnotGeometry(.8, .28, 160, 24),
  cone: () => new THREE.ConeGeometry(.95, 1.7, 56),
  bar: () => new RoundedBoxGeometry(2.6, .7, 1.4, 6, .3),
};
const LAYOUT = [
  ['torus',   '#22d3ee',  .80,  .60,  -2, 1.05],
  ['knot',    '#1e293b',  .52,  .05,  -6, 1.25],
  ['sphere',  '#3b82f6',  .30, -.70,   0,  .62],
  ['box',     '#e2e8f0',  .84, -.56,  -3,  .78],
  ['ico',     '#67e8f9',  .50,  .78,  -5,  .70],
  ['capsule', '#2563eb',  .08,  .70,  -8,  .62],
  ['cone',    '#0e7490', -.90, -.78,  -5,  .66],
  ['bar',     '#1e293b', -.93,  .88,  -9,  .62],
];
const shapes = LAYOUT.map(([g, c, nx, ny, z, s], i) => {
  const dark = c === '#1e293b';
  const m = new THREE.MeshPhysicalMaterial({ color: c, roughness: dark ? .22 : .32, metalness: dark ? .4 : .05, clearcoat: 1, clearcoatRoughness: .18, flatShading: g === 'ico' });
  const mesh = new THREE.Mesh(G[g](), m);
  mesh.scale.setScalar(0.0001);
  S.add(mesh);
  const ax = new THREE.Vector3(Math.sin(i * 2.1), Math.cos(i * 1.3), Math.sin(i * .7 + 1)).normalize();
  return { mesh, nx, ny, z, s, ax, sp: .18 + (i % 4) * .07, ph: i * 1.7, bob: .18 + (i % 3) * .1, home: new THREE.Vector3() };
});

function layout() {
  const w = hero.clientWidth, h = hero.clientHeight;
  R.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
  const t = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
  for (const o of shapes) { const d = CZ - o.z, hh = d * t, hw = hh * cam.aspect; o.home.set(o.nx * hw, o.ny * hh, o.z); }
}

const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
addEventListener('pointermove', e => { ptr.tx = e.clientX / innerWidth * 2 - 1; ptr.ty = e.clientY / innerHeight * 2 - 1; }, { passive: true });

const eback = x => { const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const eio = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const q = new THREE.Quaternion();
let t0 = null, visible = true, raf = 0, shown = false;

function frame(now) {
  raf = 0;
  if (t0 === null) t0 = now;
  const t = reduce ? 20 : (now - t0) / 1000;
  // прокрутка: камера наезжает и опускается, фигуры уходят вверх и в стороны
  const p = Math.min(1, Math.max(0, scrollY / Math.max(1, hero.offsetHeight)));
  const ep = eio(p);
  ptr.x += (ptr.tx - ptr.x) * .05; ptr.y += (ptr.ty - ptr.y) * .05;
  const intro = reduce ? 0 : 1 - eio(Math.min(1, t / 2.2)); // въезд камеры при загрузке
  cam.position.set(ptr.x * 1.1, -ptr.y * .7 - ep * 2.2, CZ + intro * 9 - ep * 5);
  cam.lookAt(0, -ep * 1.4, 0);
  shapes.forEach((o, i) => {
    const k = reduce ? 1 : eback(Math.min(1, Math.max(0, (t - .25 - i * .09) / 1.1)));
    const m = o.mesh;
    m.scale.setScalar(Math.max(.0001, o.s * k));
    const spread = 1 + ep * .35;
    m.position.set(o.home.x * spread, o.home.y * spread + Math.sin(t * .8 + o.ph) * o.bob + ep * (o.z + 10) * .25, o.home.z);
    q.setFromAxisAngle(o.ax, t * o.sp + o.ph + ep * 1.2);
    m.quaternion.copy(q);
  });
  R.render(S, cam);
  if (!shown) { shown = true; canvas.classList.add('on'); }
  if (!reduce && visible && !document.hidden) raf = requestAnimationFrame(frame);
}
const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };

layout();
new ResizeObserver(() => { layout(); kick(); }).observe(hero);
new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); }).observe(hero);
document.addEventListener('visibilitychange', () => { if (!document.hidden) kick(); });
if (reduce) addEventListener('scroll', kick, { passive: true });
kick();
