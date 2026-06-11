/**
 * anom-orb-scene.ts — 光点球体（緯度経度グリッド）のマウスインタラクション
 *
 * ビジュアル:
 *   - 半径固定の球面上に緯度 lat × 経度 lon 格子で点を配置（画像リファレンス準拠）
 *   - 全点は基本白、ShaderMaterial でカリスマティックに描画（additive blend + 円形ディスク）
 *   - Y 軸回りにゆっくり自動回転（アイドル）
 *   - カーソルと球面の法線との角度近傍で輝度アップ + わずかに法線方向へ押し出し
 *
 * 使い方:
 *   import { startAnomOrbScene } from "./anom-orb-scene";
 *   const orb = startAnomOrbScene(canvasEl);
 *   // ... unmount 時:
 *   orb.destroy();
 *
 * 制約:
 *   - Three.js vanilla（R3F 禁止 / CLAUDE.md 準拠）
 *   - DPR 上限 2、ResizeObserver でキャンバスサイズ追従
 *   - prefers-reduced-motion: 自動回転停止 + マウス反応無効（静止）
 */

import * as THREE from "three";

// ===== 環境判定 =====
const isCoarsePointer =
  typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ===== 設定 =====
// 緯度経度の分割数（PC / モバイル切替）
// 参考画像の密度に合わせ、PC では 60×120=7200 点、モバイルは 1800 点
const LAT_DIVISIONS = isCoarsePointer ? 30 : 60;
const LON_DIVISIONS = isCoarsePointer ? 60 : 120;

// 球体の視覚上の半径（カメラ距離で調整するためワールド座標では 1.0 を基準）
const ORB_RADIUS = 1.0;

// 自動回転速度（rad/sec）— 約 25 秒/周
const AUTO_ROTATE_SPEED = (Math.PI * 2) / 25;

// マウス影響: 画面上の近接範囲（正規化 0..1）
// 影響が及ぶ角度（cos 値）— 例: 0.9 なら角度約 26°以内
const MOUSE_INFLUENCE_COS = 0.9;

// マウス影響強度（押し出し・輝度ブースト）
const MOUSE_BOOST_AMOUNT = 0.6;

// ===== シェーダー =====
// ポイントサイズはスクリーンスペース（ピクセル）で指定する sizeAttenuation 方式。
// 近傍ほど大きく・明るく見せる。
const VERTEX_SHADER = /* glsl */ `
  uniform vec3 uMouseDir;      // 球体中心から見たマウス方向（正規化）
  uniform float uMouseActive;  // 0..1 マウス有効度
  uniform float uPointSize;    // 基本ポイントサイズ（px）
  uniform float uPixelRatio;

  varying float vBrightness;

  void main() {
    vec3 nrm = normalize(position);

    // カーソル方向との内積（0..1）
    float prox = max(0.0, dot(nrm, uMouseDir));
    // 近接しているときだけ強く反応
    float boost = smoothstep(${MOUSE_INFLUENCE_COS.toFixed(3)}, 1.0, prox) * uMouseActive;

    // 法線方向にわずかに押し出し（膨らむような錯覚）
    vec3 pos = position + nrm * boost * ${MOUSE_BOOST_AMOUNT.toFixed(3)} * 0.08;

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);

    // 輝度: 基本 1.0 + ブースト時に 1.8 付近まで持ち上げ（白飛びするほどではなく発光感）
    vBrightness = 1.0 + boost * 0.8;

    // ポイントサイズ: 距離に依らず固定ピクセルサイズ（DPR スケール）
    // - 深さで除算すると fov とカメラ距離に依存して極端に小さくなり、画面上で消えるため固定
    // - boost 時にわずかに拡大
    gl_PointSize = uPointSize * uPixelRatio * (1.0 + boost * 1.2);

    gl_Position = projectionMatrix * mvPos;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  varying float vBrightness;

  void main() {
    // gl_PointCoord を中心 0 の UV に
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    // 円形 + ソフトエッジ（ハードに見えるよう 0.4〜0.5 で急峻にフォールオフ）
    float alpha = smoothstep(0.5, 0.35, d);
    if (alpha <= 0.001) discard;

    // 基本白、ブースト時にほんのり青紫寄りにシフト（ANOM アクセントカラーに寄せる）
    vec3 base = vec3(1.0);
    vec3 accent = vec3(0.76, 0.78, 1.0); // ほぼ白だがわずかに青紫を含む
    float mixT = clamp((vBrightness - 1.0) / 0.8, 0.0, 1.0);
    vec3 color = mix(base, accent, mixT) * vBrightness;

    gl_FragColor = vec4(color, alpha);
  }
`;

// ===== ハンドル型 =====
export interface AnomOrbSceneHandle {
  /** マウス位置を正規化座標 (-1..1) で渡す（NDC 風）。画面外時は uMouseActive を減衰させる前提で別途 setMouseActive を使う */
  setMouse(nx: number, ny: number): void;
  /** マウスの有効度を 0..1 で設定（hover 離脱時に 0 へフェード） */
  setMouseActive(active: number): void;
  /** 破棄 */
  destroy(): void;
}

/**
 * Orb シーン起動
 * @param canvas 対象 <canvas> 要素（親要素のサイズにフィット）
 */
export function startAnomOrbScene(canvas: HTMLCanvasElement): AnomOrbSceneHandle {
  // ===== レンダラー =====
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false, // ポイントは点描画なので AA 不要
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 0); // 透明背景

  const getPixelRatio = () => Math.min(window.devicePixelRatio || 1, 2);

  // ===== シーン / カメラ =====
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 3.2);
  camera.lookAt(0, 0, 0);

  // ===== 点群の生成（緯度経度グリッド） =====
  const pointCount = LAT_DIVISIONS * LON_DIVISIONS;
  const positions = new Float32Array(pointCount * 3);

  let idx = 0;
  for (let i = 0; i < LAT_DIVISIONS; i++) {
    // 緯度 -π/2..π/2
    // 両極をつぶさないよう i/(LAT_DIVISIONS-1) を使う
    const lat = (i / (LAT_DIVISIONS - 1) - 0.5) * Math.PI;
    const cosLat = Math.cos(lat);
    const sinLat = Math.sin(lat);
    for (let j = 0; j < LON_DIVISIONS; j++) {
      // 経度 0..2π
      const lon = (j / LON_DIVISIONS) * Math.PI * 2;
      positions[idx++] = ORB_RADIUS * cosLat * Math.cos(lon);
      positions[idx++] = ORB_RADIUS * sinLat;
      positions[idx++] = ORB_RADIUS * cosLat * Math.sin(lon);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  // ===== マテリアル（Shader） =====
  const material = new THREE.ShaderMaterial({
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uMouseDir: { value: new THREE.Vector3(0, 0, 1) },
      uMouseActive: { value: 0 },
      uPointSize: { value: 2.2 }, // 基本 2.2px（DPR 適用後の論理サイズ）
      uPixelRatio: { value: getPixelRatio() },
    },
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  // ===== マウス関連状態 =====
  // 画面 NDC (-1..1) をワールド方向ベクトルに変換（球体中心原点からの方向）
  // カメラ位置から NDC 方向にレイを飛ばして球と交差させ、交点を球体中心から見た方向ベクトルとして使う
  const mouseNdc = new THREE.Vector2(0, 0);
  let mouseActiveTarget = 0; // 目標値（setMouseActive で更新）
  let mouseActive = 0; // 現在値（滑らかに追従）

  const raycaster = new THREE.Raycaster();
  const sphereForRaycast = new THREE.Mesh(
    new THREE.SphereGeometry(ORB_RADIUS, 32, 32),
    new THREE.MeshBasicMaterial({ visible: false })
  );

  function updateMouseDirFromNdc() {
    raycaster.setFromCamera(mouseNdc, camera);
    // 球体との交点を取得（points 自身に対してのレイキャストは負荷が高いので unit sphere を流用）
    const hits = raycaster.intersectObject(sphereForRaycast, false);
    if (hits.length > 0) {
      const hit = hits[0].point;
      // world space でも球体中心は原点なのでそのまま方向ベクトルとして使える
      // ただし group の回転がかかるため points 側のローカル空間に変換する必要あり
      // → points の worldMatrix の逆行列で変換
      const localHit = hit.clone().applyMatrix4(points.matrixWorld.clone().invert());
      localHit.normalize();
      material.uniforms.uMouseDir.value.copy(localHit);
    } else {
      // 球体外の場合は現状維持（輝度 boost だけフェードアウトするように active を 0 に近づける）
      // uMouseActive の減衰で描画上は目立たなくなる
    }
  }

  // ===== アニメーションループ =====
  const clock = new THREE.Clock();
  let rafId = 0;

  function tick() {
    const dt = clock.getDelta();

    // 自動回転（reduced-motion 時は停止）
    if (!prefersReducedMotion) {
      points.rotation.y += AUTO_ROTATE_SPEED * dt;
      // マウス方向は回転後のローカル座標で評価するため毎フレーム再計算
      // （画面上のカーソル位置が固定でも、点群の回転に伴い相対方向が変わる）
      points.updateMatrixWorld(true);
      updateMouseDirFromNdc();
    }

    // uMouseActive を滑らかに追従（hover 離脱時のフェードアウト）
    mouseActive += (mouseActiveTarget - mouseActive) * Math.min(1, dt * 6);
    material.uniforms.uMouseActive.value = mouseActive;

    renderer.render(scene, camera);
    rafId = requestAnimationFrame(tick);
  }

  // ===== リサイズ =====
  function handleResize() {
    const parent = canvas.parentElement;
    if (!parent) return;
    const { clientWidth: w, clientHeight: h } = parent;
    if (w === 0 || h === 0) return;
    renderer.setPixelRatio(getPixelRatio());
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    material.uniforms.uPixelRatio.value = getPixelRatio();
  }

  const resizeObserver = new ResizeObserver(handleResize);
  if (canvas.parentElement) {
    resizeObserver.observe(canvas.parentElement);
  }
  handleResize();

  // 起動
  rafId = requestAnimationFrame(tick);

  // ===== ハンドル =====
  return {
    setMouse(nx: number, ny: number) {
      mouseNdc.set(nx, ny);
      // reduced-motion 時は評価のみ（自動回転ループ内の updateMouseDir は動かないため即時更新）
      if (prefersReducedMotion) {
        points.updateMatrixWorld(true);
        updateMouseDirFromNdc();
      }
    },
    setMouseActive(active: number) {
      if (prefersReducedMotion || isCoarsePointer) {
        mouseActiveTarget = 0;
        return;
      }
      mouseActiveTarget = Math.max(0, Math.min(1, active));
    },
    destroy() {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      geometry.dispose();
      material.dispose();
      sphereForRaycast.geometry.dispose();
      (sphereForRaycast.material as THREE.Material).dispose();
      renderer.dispose();
    },
  };
}
