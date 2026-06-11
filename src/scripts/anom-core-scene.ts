/**
 * anom-core-scene.ts — ANOM コア背景シーン（v3 Phase A' / 案A: ミニマル版）
 *
 * 役割:
 *   - 星屑 Points（白〜薄青の微粒子）を広い球状フィールドに配置
 *   - 浮遊ボケ Sprite（ソフトな光円）をランダム浮遊
 *   - EffectComposer + UnrealBloomPass で発光感
 *   - マウス位置に合わせたカメラ微パララックス
 *   - スクロール進捗に応じたカメラ前進 & 星屑ブライトネスの控えめな変化
 *
 * 使い方:
 *   const core = startAnomCoreScene("neural-canvas");
 *   core.setScrollProgress(0.5);     // 0..1 で背景の前進度
 *   core.setMouseNormalized(0.2, -0.1);
 *   core.destroy();
 *
 * パフォーマンス:
 *   - PC: 星屑 600 / ボケ 30 / Bloom ON / DPR 上限 2.0
 *   - モバイル: 星屑 300 / ボケ 0 / Bloom OFF / DPR 上限 1.5
 *   - prefers-reduced-motion: 自動的な動き（sin 波、星屑回転）を停止、scrub 連動は保持
 *   - visibilitychange / IntersectionObserver で非表示時 rAF 停止
 *
 * 注意:
 *   - 動画 VideoTexture は採用見送り（scrub カクつきと中央明度で視認性悪化のため）
 */

import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

// ===== 環境判定 =====
const isMobile =
  typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ===== 設定定数 =====
const CONFIG = {
  // カメラ
  CAMERA_FOV: 50,
  CAMERA_Z_START: 8, // 初期 z
  CAMERA_Z_END: 6, // scrollProgress 1.0 到達時の z（控えめに前進）
  // 星屑
  STAR_COUNT: isMobile ? 300 : 600,
  STAR_FIELD_RADIUS: 18,
  STAR_SIZE: 0.035,
  STAR_OPACITY_MIN: 0.75,
  STAR_OPACITY_MAX: 0.95,
  // 浮遊ボケ
  BOKEH_COUNT: isMobile ? 0 : 30,
  BOKEH_FIELD_W: 28,
  BOKEH_FIELD_H: 18,
  BOKEH_SIZE_MIN: 0.35,
  BOKEH_SIZE_MAX: 1.2,
  // マウスパララックス
  MOUSE_LERP: 0.05,
  MOUSE_MAX_OFFSET: 0.6,
  // DPR
  DPR_MAX_PC: 2.0,
  DPR_MAX_MOBILE: 1.5,
  // Bloom
  BLOOM_STRENGTH: 0.55,
  BLOOM_RADIUS: 0.5,
  BLOOM_THRESHOLD: 0.0,
};

// ===== 戻り値の型 =====
export interface AnomCoreSceneHandle {
  /** スクロール進捗 0..1 — カメラ前進と星屑ブライトネスに反映 */
  setScrollProgress: (p: number) => void;
  /** マウス位置（-1..1）— カメラパララックス */
  setMouseNormalized: (x: number, y: number) => void;
  /** 破棄 */
  destroy: () => void;
}

// ===== メイン起動関数 =====
export function startAnomCoreScene(canvasId: string): AnomCoreSceneHandle | null {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
  if (!canvas) {
    console.warn(`[anom-core-scene] canvas #${canvasId} が見つかりません`);
    return null;
  }

  // ========== Scene / Camera / Renderer ==========
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    CONFIG.CAMERA_FOV,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, CONFIG.CAMERA_Z_START);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, isMobile ? CONFIG.DPR_MAX_MOBILE : CONFIG.DPR_MAX_PC)
  );
  renderer.setClearColor(0x000000, 0);

  if (import.meta.env?.DEV) {
    (window as any).__anomInfo = renderer.info;
  }

  // ========== 星屑 Points ==========
  const starGeom = new THREE.BufferGeometry();
  const starPositions = new Float32Array(CONFIG.STAR_COUNT * 3);
  const starColors = new Float32Array(CONFIG.STAR_COUNT * 3);

  for (let i = 0; i < CONFIG.STAR_COUNT; i++) {
    // 球面ランダム配置
    const r = CONFIG.STAR_FIELD_RADIUS * (0.5 + Math.random() * 0.5);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    starPositions[i * 3 + 2] = r * Math.cos(phi) - 2;

    // 色: 白〜薄い青紫
    const tint = Math.random();
    starColors[i * 3] = 0.9 + tint * 0.1;
    starColors[i * 3 + 1] = 0.92 + tint * 0.08;
    starColors[i * 3 + 2] = 1.0;
  }

  starGeom.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
  starGeom.setAttribute("color", new THREE.BufferAttribute(starColors, 3));

  const starMat = new THREE.PointsMaterial({
    size: CONFIG.STAR_SIZE,
    vertexColors: true,
    transparent: true,
    opacity: CONFIG.STAR_OPACITY_MIN,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });

  const stars = new THREE.Points(starGeom, starMat);
  scene.add(stars);

  // ========== 浮遊ボケ Sprite ==========
  const bokehSprites: THREE.Sprite[] = [];

  if (CONFIG.BOKEH_COUNT > 0) {
    const bokehCanvas = document.createElement("canvas");
    bokehCanvas.width = 128;
    bokehCanvas.height = 128;
    const ctx = bokehCanvas.getContext("2d")!;
    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, "rgba(255,255,255,1.0)");
    grad.addColorStop(0.3, "rgba(200,210,255,0.5)");
    grad.addColorStop(1, "rgba(200,210,255,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
    const bokehTex = new THREE.CanvasTexture(bokehCanvas);

    for (let i = 0; i < CONFIG.BOKEH_COUNT; i++) {
      const spriteMat = new THREE.SpriteMaterial({
        map: bokehTex,
        transparent: true,
        opacity: 0.25 + Math.random() * 0.3,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(spriteMat);
      const size =
        CONFIG.BOKEH_SIZE_MIN +
        Math.random() * (CONFIG.BOKEH_SIZE_MAX - CONFIG.BOKEH_SIZE_MIN);
      sprite.scale.set(size, size, 1);
      sprite.position.set(
        (Math.random() - 0.5) * CONFIG.BOKEH_FIELD_W,
        (Math.random() - 0.5) * CONFIG.BOKEH_FIELD_H,
        -5 + Math.random() * 4
      );
      (sprite.userData as any).driftSpeed = 0.02 + Math.random() * 0.03;
      (sprite.userData as any).driftPhase = Math.random() * Math.PI * 2;
      (sprite.userData as any).originalY = sprite.position.y;
      scene.add(sprite);
      bokehSprites.push(sprite);
    }
  }

  // ========== EffectComposer + Bloom ==========
  const composer = new EffectComposer(renderer);
  composer.setSize(window.innerWidth, window.innerHeight);
  composer.setPixelRatio(
    Math.min(window.devicePixelRatio, isMobile ? CONFIG.DPR_MAX_MOBILE : CONFIG.DPR_MAX_PC)
  );

  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  if (!isMobile) {
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      CONFIG.BLOOM_STRENGTH,
      CONFIG.BLOOM_RADIUS,
      CONFIG.BLOOM_THRESHOLD
    );
    composer.addPass(bloomPass);
  }

  // ========== 状態 ==========
  let mouseNx = 0;
  let mouseNy = 0;
  let cameraTargetX = 0;
  let cameraTargetY = 0;
  let scrollProgress = 0;

  // ========== リサイズ対応 ==========
  function onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    composer.setSize(w, h);
  }
  window.addEventListener("resize", onResize);

  // ========== 可視性制御 ==========
  let isVisible = true;
  let isDocumentHidden = false;

  function onVisibilityChange() {
    isDocumentHidden = document.hidden;
  }
  document.addEventListener("visibilitychange", onVisibilityChange);

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        isVisible = entry.isIntersecting;
      });
    },
    { threshold: 0 }
  );
  io.observe(canvas);

  // ========== アニメーションループ ==========
  const clock = new THREE.Clock();
  let rafId = 0;

  function animate() {
    rafId = requestAnimationFrame(animate);

    if (!isVisible || isDocumentHidden) return;

    const elapsed = clock.getElapsedTime();

    // スクロール連動: カメラを控えめに前進（8 → 6）+ 星屑ブライトネスを控えめに上げる
    const cameraZ =
      CONFIG.CAMERA_Z_START + (CONFIG.CAMERA_Z_END - CONFIG.CAMERA_Z_START) * scrollProgress;
    const starOpacity =
      CONFIG.STAR_OPACITY_MIN +
      (CONFIG.STAR_OPACITY_MAX - CONFIG.STAR_OPACITY_MIN) * scrollProgress;
    starMat.opacity = starOpacity;

    // prefers-reduced-motion は自動的な動きを停止、scrub 連動は保持
    if (!prefersReducedMotion) {
      // カメラパララックス
      cameraTargetX = mouseNx * CONFIG.MOUSE_MAX_OFFSET;
      cameraTargetY = mouseNy * CONFIG.MOUSE_MAX_OFFSET;
      camera.position.x += (cameraTargetX - camera.position.x) * CONFIG.MOUSE_LERP;
      camera.position.y += (cameraTargetY - camera.position.y) * CONFIG.MOUSE_LERP;
      // 微浮遊 sin 波
      camera.position.y += Math.sin(elapsed * 0.25) * 0.015;
      camera.position.z = cameraZ;
      camera.lookAt(0, 0, 0);

      // 星屑の緩やかな回転
      stars.rotation.y += 0.0003;
      stars.rotation.x += 0.00015;

      // ボケスプライトの浮遊
      for (const s of bokehSprites) {
        const ud = s.userData as any;
        s.position.y = ud.originalY + Math.sin(elapsed * ud.driftSpeed + ud.driftPhase) * 0.4;
      }
    } else {
      // reduced-motion: カメラ Z だけ scroll に追従、その他は静止
      camera.position.z = cameraZ;
      camera.lookAt(0, 0, 0);
    }

    composer.render();
  }
  animate();

  // ========== 公開 API ==========
  function setScrollProgress(p: number) {
    scrollProgress = Math.max(0, Math.min(1, p));
  }

  function setMouseNormalized(x: number, y: number) {
    mouseNx = Math.max(-1, Math.min(1, x));
    mouseNy = Math.max(-1, Math.min(1, y));
  }

  function destroy() {
    cancelAnimationFrame(rafId);
    window.removeEventListener("resize", onResize);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    io.disconnect();

    starGeom.dispose();
    starMat.dispose();
    for (const s of bokehSprites) {
      (s.material as THREE.SpriteMaterial).dispose();
    }
    composer.dispose?.();
    renderer.dispose();
  }

  return {
    setScrollProgress,
    setMouseNormalized,
    destroy,
  };
}
