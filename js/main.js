import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const CONSOLES = [
  {
    id: 'famicom',
    name: 'ファミリーコンピュータ',
    nameEn: 'Family Computer (Famicom)',
    manufacturer: '任天堂 (Nintendo)',
    year: 1983,
    description: '1983年7月15日に任天堂から発売された家庭用ゲーム機。略称はファミコン。日本の家庭用ゲーム市場の礎を築き、スーパーマリオブラザーズなど数々の名作を世に送り出した伝説の名機。',
    trivia: [
      '発売当初の定価は14,800円。当時の大卒初任給の約13%に相当した。',
      '初期ロット品はコントローラーのICチップに問題があり、一度全数回収・修正対応が行われた。',
      '世界累計出荷台数は約6,191万台。世代を超えて愛される不朽のハードウェア。',
    ],
    model: 'models/01_Famicom.glb',
  },
  {
    id: 'gameboy',
    name: 'ゲームボーイ',
    nameEn: 'Game Boy',
    manufacturer: '任天堂 (Nintendo)',
    year: 1989,
    description: '1989年4月21日に任天堂から発売された携帯型ゲーム機。単4電池4本で長時間プレイ可能なタフな設計と、テトリスなどのキラーソフトにより世界中で大ヒット。携帯ゲーム機の標準を作り上げた一台。',
    trivia: [
      '湾岸戦争で爆撃を受けたゲームボーイが、内部が焦げながらも起動したという逸話が残る。',
      '北米ではテトリスとのセット販売が爆発的人気を博し、発売初日に即完売した。',
      '単3電池4本で約15時間プレイ可能。長時間駆動が普及を支えた大きな要因だった。',
    ],
    model: 'models/02_GameBoy.glb',
  },
  {
    id: 'superfamicom',
    name: 'スーパーファミコン',
    nameEn: 'Super Famicom',
    manufacturer: '任天堂 (Nintendo)',
    year: 1990,
    description: '1990年11月21日に任天堂から発売された16ビット家庭用ゲーム機。スーパーマリオワールド、ゼルダの伝説 神々のトライフォース、クロノ・トリガーなど今なお語り継がれる名作が多数登場した。',
    trivia: [
      '「モード7」という疑似3D回転・拡大縮小機能をハードウェアで実装。マリオカートの床面に活用された。',
      '発売日には各地で長蛇の列が発生し、一部地域では深夜販売を狙った窃盗事件まで起きた。',
      '日本版とアメリカ版（SNES）ではデザインが大きく異なり、北米では角ばったフォルムが採用された。',
    ],
    model: 'models/03_SuperFamicom.glb',
  },
  {
    id: 'playstation1',
    name: 'プレイステーション',
    nameEn: 'PlayStation',
    manufacturer: 'ソニー・コンピュータエンタテインメント',
    year: 1994,
    description: '1994年12月3日にソニーから発売された家庭用ゲーム機。CD-ROMを採用し、3Dポリゴンゲームの時代を切り開いた。FF7、バイオハザード、鉄拳など革新的なタイトルが続々と登場した。',
    trivia: [
      '元々は任天堂と共同開発したスーパーファミコン用CD-ROMアドオンがルーツ。契約破棄後にソニーが独自開発した。',
      '発売価格39,800円はセガサターン（44,800円）より5,000円安く、価格競争で優位に立った。',
      '世界累計販売台数は約1億200万台。ゲーム機として初めて「1億台の壁」を突破したハード。',
    ],
    model: 'models/04_PlayStation1.glb',
  },
];

// ── Utility ──────────────────────────────────────────────────

function fitModel(model) {
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  return { center, size, maxDim };
}

function buildLighting(scene, { key = 3, fill = 1.2, rim = 0.6, ambient = 0.5 } = {}) {
  scene.add(new THREE.AmbientLight(0x2a1b54, ambient));
  const keyLight = new THREE.DirectionalLight(0xffffff, key);
  keyLight.position.set(5, 8, 6);
  scene.add(keyLight);
  const fillLight = new THREE.DirectionalLight(0x00f0ff, fill);
  fillLight.position.set(-4, 2, -4);
  scene.add(fillLight);
  const rimLight = new THREE.DirectionalLight(0xff0055, rim);
  rimLight.position.set(0, -3, -8);
  scene.add(rimLight);
}

// ── Hero ─────────────────────────────────────────────────────

function setupHero() {
  const canvas = document.getElementById('hero-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050214);
  scene.fog = new THREE.FogExp2(0x050214, 0.045);

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0.8, 5);

  buildLighting(scene, { key: 2.5, fill: 1, rim: 0.5, ambient: 0.4 });

  const grid = new THREE.GridHelper(40, 40, 0x00f0ff, 0x140847);
  grid.position.y = -2;
  scene.add(grid);

  const loader = new GLTFLoader();
  let heroModel = null;

  loader.load('models/01_Famicom.glb', (gltf) => {
    heroModel = gltf.scene;
    const { center, maxDim } = fitModel(heroModel);
    const isMobile = window.innerWidth <= 640;
    const scale = (isMobile ? 2.2 : 3) / maxDim;
    heroModel.scale.setScalar(scale);
    heroModel.position.sub(center.multiplyScalar(scale));
    heroModel.position.x = isMobile ? 0 : 2.2;
    scene.add(heroModel);
  });

  function getTargetX() { return canvas.clientWidth <= 640 ? 0 : 2.2; }

  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.clearViewOffset();
    camera.updateProjectionMatrix();
    if (heroModel) heroModel.position.x = getTargetX();
  }
  resize();
  window.addEventListener('resize', resize);

  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.005;
    if (heroModel) {
      heroModel.rotation.y = t * 0.5;
      heroModel.position.y = Math.sin(t) * 0.12;
    }
    camera.position.x = Math.sin(t * 0.15) * 0.4;
    camera.lookAt(getTargetX(), 0, 0);
    renderer.render(scene, camera);
  }
  animate();
}

// ── Collection Cards ─────────────────────────────────────────

function setupCard(data, index) {
  const grid = document.getElementById('collection-grid');

  const card = document.createElement('div');
  card.className = 'console-card';
  card.innerHTML = `
    <div class="card-canvas-wrapper" id="wrap-${index}">
      <div class="card-loading">LOADING...</div>
    </div>
    <div class="card-info">
      <div class="card-year">${data.year}</div>
      <div class="card-name">${data.name}</div>
      <div class="card-maker">${data.manufacturer}</div>
    </div>
    <div class="card-cta">3D で見る &nbsp;→&nbsp; VIEW</div>
  `;
  grid.appendChild(card);

  const wrapper = document.getElementById(`wrap-${index}`);
  const canvas = document.createElement('canvas');
  wrapper.appendChild(canvas);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0429);

  const camera = new THREE.PerspectiveCamera(40, 4 / 3, 0.1, 100);
  camera.position.set(0, 0.5, 4);

  buildLighting(scene, { key: 2.8, fill: 1.2, rim: 0, ambient: 0.6 });

  const loader = new GLTFLoader();
  let model = null;

  loader.load(data.model, (gltf) => {
    model = gltf.scene;
    const { center, maxDim } = fitModel(model);
    const scale = 2 / maxDim;
    model.scale.setScalar(scale);
    model.position.sub(center.multiplyScalar(scale));
    model.rotation.y = index * 0.8;
    scene.add(model);
    wrapper.querySelector('.card-loading')?.remove();
  });

  const ro = new ResizeObserver(() => {
    const w = wrapper.clientWidth;
    const h = wrapper.clientHeight;
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  });
  ro.observe(wrapper);

  let t = index * 2.1;
  (function animate() {
    requestAnimationFrame(animate);
    t += 0.008;
    if (model) model.rotation.y = t * 0.5;
    renderer.render(scene, camera);
  })();

  card.addEventListener('click', () => openViewer(data));
}

// ── Full Viewer ───────────────────────────────────────────────

let viewerState = null;

function openViewer(data) {
  const overlay = document.getElementById('viewer-overlay');
  overlay.classList.remove('hidden');

  // テキスト情報を設定
  document.getElementById('info-handle-name').textContent = data.name;
  document.getElementById('info-tag').textContent = `${data.year}年発売 / CONSOLE`;
  document.getElementById('info-name').textContent = data.name;
  document.getElementById('info-name-en').textContent = data.nameEn;
  document.getElementById('info-maker').textContent = data.manufacturer;
  document.getElementById('info-year').textContent = `${data.year}年`;
  document.getElementById('info-desc').textContent = data.description;

  // 豆知識リストを生成
  const triviaList = document.getElementById('trivia-list');
  triviaList.innerHTML = data.trivia.map(t => `<li class="trivia-item">${t}</li>`).join('');

  // パネルをリセット（モバイル用）
  document.getElementById('viewer-info').classList.remove('info-expanded');

  // 前のビューアーをクリーンアップ
  if (viewerState) {
    cancelAnimationFrame(viewerState.animId);
    viewerState.ro.disconnect();
    viewerState.renderer.dispose();
    viewerState = null;
  }

  const canvas = document.getElementById('viewer-canvas');

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050214);
  scene.fog = new THREE.FogExp2(0x050214, 0.035);

  buildLighting(scene, { key: 3, fill: 1.5, rim: 0.8, ambient: 0.5 });

  const grid = new THREE.GridHelper(30, 30, 0x00f0ff, 0x140847);
  grid.position.y = -2.5;
  scene.add(grid);

  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 1.2, 5);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1.8;
  controls.minDistance = 1.5;
  controls.maxDistance = 14;
  // モデルを画面上寄りに見せるためカメラの注視点を少し下にオフセット
  controls.target.set(0, -0.4, 0);

  function resizeViewer() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w <= 0 || h <= 0) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  resizeViewer();
  const ro = new ResizeObserver(resizeViewer);
  ro.observe(canvas);

  const loader = new GLTFLoader();
  loader.load(data.model, (gltf) => {
    const model = gltf.scene;
    const { center, maxDim } = fitModel(model);
    const scale = (window.innerWidth <= 900 ? 1.8 : 2.5) / maxDim;
    model.scale.setScalar(scale);
    model.position.sub(center.multiplyScalar(scale));
    model.traverse(child => {
      if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; }
    });
    scene.add(model);
    controls.update();
  });

  let animId;
  (function animate() {
    animId = requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  })();

  viewerState = { renderer, ro, get animId() { return animId; } };
}

function closeViewer() {
  document.getElementById('viewer-overlay').classList.add('hidden');
  document.getElementById('viewer-info').classList.remove('info-expanded');
  if (viewerState) {
    cancelAnimationFrame(viewerState.animId);
    viewerState.ro.disconnect();
    viewerState.renderer.dispose();
    viewerState = null;
  }
}

// ── Info panel toggle (モバイル) ──────────────────────────────

function setupInfoToggle() {
  const info = document.getElementById('viewer-info');
  const btn = document.getElementById('info-toggle-btn');
  const handle = document.querySelector('.info-handle');

  function toggle() {
    info.classList.toggle('info-expanded');
    const expanded = info.classList.contains('info-expanded');
    btn.querySelector('.toggle-label').textContent = expanded ? '閉じる' : '詳細';
  }

  btn.addEventListener('click', (e) => { e.stopPropagation(); toggle(); });
  handle.addEventListener('click', toggle);
}

// ── Header scroll effect ──────────────────────────────────────

window.addEventListener('scroll', () => {
  document.getElementById('site-header')
    .classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

// ── Init ─────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  setupHero();
  CONSOLES.forEach((c, i) => setupCard(c, i));
  setupInfoToggle();

  document.getElementById('viewer-close').addEventListener('click', closeViewer);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeViewer();
  });
});
