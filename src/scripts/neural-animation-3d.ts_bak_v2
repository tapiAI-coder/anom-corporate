/**
 * neural-animation-3d.ts — 3D ニューロン伝達アニメーション（Phase 1-C リッチ版）
 *
 * 参考ビジュアル: 本物の神経細胞の顕微鏡写真風
 *   - 白コア + 青紫グロー + ハロー の発光ノード
 *   - 各ノードから樹状突起（dendrites）が放射状に伸びる
 *   - 軸索は CatmullRom でうねる曲線
 *   - 背景に星屑パーティクル 1000 粒
 *   - 青紫系パルスに時々オレンジアクセント
 *   - UnrealBloomPass でネオン発光（strength 1.3）
 *
 * パフォーマンス:
 *   - PC: ノード 80, 樹状突起 400, 星屑 1000, Bloom 有効, DPR 上限 2
 *   - モバイル: ノード 40, 樹状突起 0, 星屑 400, Bloom 無効, DPR 1.5
 *   - prefers-reduced-motion: 静止フォールバック（ノード + 星屑のみ）
 *   - document.hidden で rAF 停止
 */

import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

// ===== 環境判定 =====
const isMobile =
  typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches;

// ===== 設定定数 =====
const CONFIG = {
  // ノード
  NODE_COUNT: isMobile ? 40 : 80,
  NODE_RADIUS_CORE: 1.6, // 中心コア mesh の半径
  NODE_SPRITE_SIZE: 32, // グロースプライトの world 単位サイズ（画像に近い大きめ設定）
  // 樹状突起（dendrites）
  DENDRITE_PER_NODE_PC: 5,
  DENDRITE_PER_NODE_MOBILE: 0, // モバイルは負荷軽減で無し
  DENDRITE_LENGTH: 28, // 1 本の樹状突起の長さ
  DENDRITE_SEGMENTS: 6, // カーブ分割数
  // 軸索（エッジ）
  CONNECT_RADIUS: isMobile ? 140 : 175,
  EDGE_OPACITY: 0.18,
  EDGE_CURVE_SEGMENTS: 8,
  // パルス
  PULSE_SPEED: 0.55,
  PULSE_INTERVAL_MIN: 350,
  PULSE_INTERVAL_MAX: 800,
  CASCADE_PROBABILITY: 0.6,
  CASCADE_MAX_DEPTH: 4,
  ORANGE_PULSE_CHANCE: 0.3, // パルスがオレンジ色になる確率
  // 星屑
  STAR_COUNT: isMobile ? 400 : 1000,
  STAR_FIELD_SIZE: 1600,
  // 空間
  SPACE_SIZE: 800,
  // カメラ
  CAMERA_PARALLAX: 60,
  // 色
  COLOR_BLUE: 0x4a7cff, // やや冷たい青
  COLOR_VIOLET: 0x9470ff, // 青紫
  COLOR_ORANGE: 0xff8c42, // アクセントオレンジ
  COLOR_CORE_WHITE: 0xffffff,
  COLOR_EDGE: 0x5060a0, // 軸索ベース色（淡い青紫）
  COLOR_DENDRITE: 0xa0b0ff, // 樹状突起色
  COLOR_STAR: 0xbcc8ff, // 星屑
  // Bloom
  BLOOM_STRENGTH: 1.3,
  BLOOM_RADIUS: 0.6,
  BLOOM_THRESHOLD: 0.0,
  // DPR
  DPR_MAX_PC: 2,
  DPR_MAX_MOBILE: 1.5,
};

// ===== 型 =====

interface NeuralNode {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  baseIntensity: number;
  currentIntensity: number;
  coreMesh: THREE.Mesh;
  glowSprite: THREE.Sprite;
  dendriteLines: THREE.Line[];
  connections: number[];
  sizeMultiplier: number; // 距離に応じた奥行きサイズ
}

interface Edge {
  from: number;
  to: number;
  line: THREE.Line;
  geometry: THREE.BufferGeometry;
  curvePoints: THREE.Vector3[]; // キャッシュした曲線ポイント
}

interface Pulse {
  from: number;
  to: number;
  progress: number;
  depth: number;
  sprite: THREE.Sprite;
  isOrange: boolean;
  curvePoints: THREE.Vector3[]; // エッジから継承した曲線
}

// ===== テクスチャ生成（発光ディスク） =====

/** radial-gradient の発光ディスクを CanvasTexture で作る */
function createGlowTexture(
  innerColor: string,
  midColor: string,
  outerColor: string
): THREE.Texture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );
  gradient.addColorStop(0.0, innerColor); // 中心: ほぼ白
  gradient.addColorStop(0.2, midColor); // 少し外: 明るい青
  gradient.addColorStop(0.5, outerColor); // 中間: 青紫
  gradient.addColorStop(1.0, "rgba(0,0,0,0)"); // 外縁: 透明
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** 小さな星粒子のテクスチャ（円形減衰） */
function createStarTexture(): THREE.Texture {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );
  gradient.addColorStop(0.0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.3, "rgba(200,215,255,0.85)");
  gradient.addColorStop(1.0, "rgba(120,150,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

// ===== メインクラス =====

export class NeuralAnimation3D {
  private canvas: HTMLCanvasElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private composer: EffectComposer | null = null;
  private useBloom: boolean;

  private nodes: NeuralNode[] = [];
  private edges: Edge[] = [];
  private pulses: Pulse[] = [];
  private stars: THREE.Points | null = null;
  private starVelocities: Float32Array | null = null;

  // 共有テクスチャ/ジオメトリ
  private glowTextureBlue: THREE.Texture;
  private glowTextureOrange: THREE.Texture;
  private pulseTextureBlue: THREE.Texture;
  private pulseTextureOrange: THREE.Texture;
  private starTexture: THREE.Texture;
  private coreGeometry: THREE.SphereGeometry;

  private pointer = new THREE.Vector2(0, 0);
  private targetCameraOffset = new THREE.Vector3(0, 0, 0);
  private currentCameraOffset = new THREE.Vector3(0, 0, 0);
  private scrollProgress = 0;

  private clock = new THREE.Clock();
  private lastPulseTime = 0;
  private nextPulseInterval = 500;

  private animationId: number | null = null;
  private running = false;
  private visible = true;
  private prefersReducedMotion = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    this.useBloom = !isMobile && !this.prefersReducedMotion;

    // シーン
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(
      0x05060e,
      CONFIG.SPACE_SIZE * 0.35,
      CONFIG.SPACE_SIZE * 1.4
    );

    // カメラ
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      2500
    );
    this.camera.position.set(0, 0, CONFIG.SPACE_SIZE * 0.55);
    this.camera.lookAt(0, 0, 0);

    // レンダラー
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    this.renderer.setClearColor(0x000000, 0);
    this.setupRenderSize();

    // 共有リソース生成
    this.glowTextureBlue = createGlowTexture(
      "rgba(255,255,255,1)", // コア白
      "rgba(140,180,255,0.9)", // 明るい青
      "rgba(90,100,220,0.4)" // 青紫
    );
    this.glowTextureOrange = createGlowTexture(
      "rgba(255,240,220,1)",
      "rgba(255,160,80,0.85)",
      "rgba(220,90,40,0.3)"
    );
    this.pulseTextureBlue = createGlowTexture(
      "rgba(255,255,255,1)",
      "rgba(150,200,255,0.9)",
      "rgba(100,130,255,0.5)"
    );
    this.pulseTextureOrange = createGlowTexture(
      "rgba(255,240,220,1)",
      "rgba(255,170,100,0.9)",
      "rgba(230,100,40,0.5)"
    );
    this.starTexture = createStarTexture();
    this.coreGeometry = new THREE.SphereGeometry(CONFIG.NODE_RADIUS_CORE, 8, 8);

    // Bloom
    if (this.useBloom) {
      this.setupBloom();
    }

    // ビルド順: 星屑 → ノード → エッジ（ノード間接続）→ 樹状突起
    this.createStars();
    this.createNodes();
    this.createEdges();
    this.createDendrites();

    this.bindEvents();
  }

  // ===== 初期化系 =====

  private setupRenderSize(): void {
    const dprMax = isMobile ? CONFIG.DPR_MAX_MOBILE : CONFIG.DPR_MAX_PC;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, dprMax));
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  private setupBloom(): void {
    const renderPass = new RenderPass(this.scene, this.camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      CONFIG.BLOOM_STRENGTH,
      CONFIG.BLOOM_RADIUS,
      CONFIG.BLOOM_THRESHOLD
    );
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(renderPass);
    this.composer.addPass(bloomPass);
  }

  /** 星屑パーティクル背景 */
  private createStars(): void {
    const positions = new Float32Array(CONFIG.STAR_COUNT * 3);
    const velocities = new Float32Array(CONFIG.STAR_COUNT * 3);
    const sizes = new Float32Array(CONFIG.STAR_COUNT);
    const colors = new Float32Array(CONFIG.STAR_COUNT * 3);

    const baseColor = new THREE.Color(CONFIG.COLOR_STAR);
    const orangeColor = new THREE.Color(CONFIG.COLOR_ORANGE);

    for (let i = 0; i < CONFIG.STAR_COUNT; i++) {
      const i3 = i * 3;
      // 広いボックスに分布（奥行きを持たせる）
      positions[i3] = (Math.random() - 0.5) * CONFIG.STAR_FIELD_SIZE;
      positions[i3 + 1] = (Math.random() - 0.5) * CONFIG.STAR_FIELD_SIZE;
      positions[i3 + 2] = (Math.random() - 0.5) * CONFIG.STAR_FIELD_SIZE;

      // 微細なドリフト速度
      velocities[i3] = (Math.random() - 0.5) * 1.5;
      velocities[i3 + 1] = (Math.random() - 0.5) * 1.5;
      velocities[i3 + 2] = (Math.random() - 0.5) * 1.5;

      // サイズにばらつき（小粒メイン、たまに大粒）
      sizes[i] = Math.random() < 0.9 ? 2 + Math.random() * 2 : 5 + Math.random() * 3;

      // 色: 8% 程度オレンジ、それ以外は青白
      const useOrange = Math.random() < 0.08;
      const c = useOrange ? orangeColor : baseColor;
      colors[i3] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 3,
      map: this.starTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true,
      sizeAttenuation: true,
    });

    this.stars = new THREE.Points(geometry, material);
    this.scene.add(this.stars);
    this.starVelocities = velocities;
  }

  /** ノード生成（コア球 + グロースプライト） */
  private createNodes(): void {
    for (let i = 0; i < CONFIG.NODE_COUNT; i++) {
      const position = new THREE.Vector3(
        (Math.random() - 0.5) * CONFIG.SPACE_SIZE,
        (Math.random() - 0.5) * CONFIG.SPACE_SIZE * 0.7,
        (Math.random() - 0.5) * CONFIG.SPACE_SIZE * 0.85
      );

      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 3
      );

      // 距離によるサイズ調整（奥行き感）
      const normalizedZ = (position.z + CONFIG.SPACE_SIZE / 2) / CONFIG.SPACE_SIZE; // 0-1
      const sizeMultiplier = 0.6 + normalizedZ * 1.9; // 奥が 0.6x, 手前が 2.5x

      // コア球（強発光の中心）
      const coreMaterial = new THREE.MeshBasicMaterial({
        color: CONFIG.COLOR_CORE_WHITE,
        transparent: true,
        opacity: 0.95,
      });
      const coreMesh = new THREE.Mesh(this.coreGeometry, coreMaterial);
      coreMesh.position.copy(position);
      coreMesh.scale.setScalar(sizeMultiplier);
      this.scene.add(coreMesh);

      // グロースプライト（周囲のハロー）
      const glowMaterial = new THREE.SpriteMaterial({
        map: this.glowTextureBlue,
        color: 0xffffff,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const glowSprite = new THREE.Sprite(glowMaterial);
      glowSprite.position.copy(position);
      glowSprite.scale.setScalar(CONFIG.NODE_SPRITE_SIZE * sizeMultiplier);
      this.scene.add(glowSprite);

      this.nodes.push({
        position,
        velocity,
        baseIntensity: 0.6 + Math.random() * 0.3,
        currentIntensity: 0.6 + Math.random() * 0.3,
        coreMesh,
        glowSprite,
        dendriteLines: [],
        connections: [],
        sizeMultiplier,
      });
    }

    // 接続計算
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const dist = this.nodes[i].position.distanceTo(this.nodes[j].position);
        if (dist < CONFIG.CONNECT_RADIUS) {
          this.nodes[i].connections.push(j);
          this.nodes[j].connections.push(i);
        }
      }
    }
  }

  /** 軸索（エッジ）を CatmullRom 曲線で生成 */
  private createEdges(): void {
    const edgeMaterial = new THREE.LineBasicMaterial({
      color: CONFIG.COLOR_EDGE,
      transparent: true,
      opacity: CONFIG.EDGE_OPACITY,
      blending: THREE.AdditiveBlending,
    });

    const processed = new Set<string>();

    for (let i = 0; i < this.nodes.length; i++) {
      for (const j of this.nodes[i].connections) {
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (processed.has(key)) continue;
        processed.add(key);

        const start = this.nodes[i].position;
        const end = this.nodes[j].position;

        // 中間点をランダムにずらして有機的なうねり
        const mid = new THREE.Vector3()
          .addVectors(start, end)
          .multiplyScalar(0.5)
          .add(
            new THREE.Vector3(
              (Math.random() - 0.5) * 20,
              (Math.random() - 0.5) * 20,
              (Math.random() - 0.5) * 20
            )
          );

        const curve = new THREE.CatmullRomCurve3([start, mid, end]);
        const curvePoints = curve.getPoints(CONFIG.EDGE_CURVE_SEGMENTS);

        const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
        const line = new THREE.Line(geometry, edgeMaterial);
        this.scene.add(line);

        this.edges.push({ from: i, to: j, line, geometry, curvePoints });
      }
    }
  }

  /** 各ノードから樹状突起を伸ばす（PC のみ） */
  private createDendrites(): void {
    const dendritesPerNode = isMobile
      ? CONFIG.DENDRITE_PER_NODE_MOBILE
      : CONFIG.DENDRITE_PER_NODE_PC;
    if (dendritesPerNode === 0) return;

    const dendriteMaterial = new THREE.LineBasicMaterial({
      color: CONFIG.COLOR_DENDRITE,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
    });

    for (const node of this.nodes) {
      for (let d = 0; d < dendritesPerNode; d++) {
        // 放射方向をランダム（球面上）
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const dir = new THREE.Vector3(
          Math.sin(phi) * Math.cos(theta),
          Math.sin(phi) * Math.sin(theta),
          Math.cos(phi)
        );

        // 途中でわずかに曲げる（有機感）
        const len = CONFIG.DENDRITE_LENGTH * (0.7 + Math.random() * 0.6);
        const mid1 = node.position.clone().add(dir.clone().multiplyScalar(len * 0.4));
        // 横方向に少しずらす
        const perp = new THREE.Vector3(-dir.y, dir.x, 0).normalize();
        mid1.add(perp.multiplyScalar((Math.random() - 0.5) * len * 0.3));
        const end = node.position.clone().add(dir.clone().multiplyScalar(len));

        const curve = new THREE.CatmullRomCurve3([node.position.clone(), mid1, end]);
        const points = curve.getPoints(CONFIG.DENDRITE_SEGMENTS);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, dendriteMaterial);
        this.scene.add(line);
        node.dendriteLines.push(line);
      }
    }
  }

  // ===== イベント =====

  private bindEvents(): void {
    window.addEventListener("resize", this.handleResize);
    window.addEventListener("pointermove", this.handlePointerMove, { passive: true });
    window.addEventListener("scroll", this.handleScroll, { passive: true });
    document.addEventListener("visibilitychange", this.handleVisibilityChange);
  }

  private handleResize = (): void => {
    this.setupRenderSize();
    if (this.composer) {
      this.composer.setSize(window.innerWidth, window.innerHeight);
    }
  };

  private handlePointerMove = (e: PointerEvent): void => {
    this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    if (!isMobile) {
      this.targetCameraOffset.x = this.pointer.x * CONFIG.CAMERA_PARALLAX;
      this.targetCameraOffset.y = this.pointer.y * CONFIG.CAMERA_PARALLAX * 0.5;
    }
  };

  private handleScroll = (): void => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    this.scrollProgress = maxScroll > 0 ? Math.min(window.scrollY / maxScroll, 1) : 0;
    // スクロールで奥へ潜る + 下方向に視線が動く
    this.targetCameraOffset.z = -this.scrollProgress * CONFIG.SPACE_SIZE * 0.35;
  };

  private handleVisibilityChange = (): void => {
    this.visible = !document.hidden;
    if (this.visible && this.running && !this.animationId) {
      this.clock.start();
      this.loop();
    }
  };

  // ===== パルス =====

  private triggerPulse(fromIdx: number, toIdx: number, depth: number): void {
    // エッジを検索して曲線ポイントを共有
    const edge = this.edges.find(
      (e) =>
        (e.from === fromIdx && e.to === toIdx) || (e.from === toIdx && e.to === fromIdx)
    );
    if (!edge) return;

    // 方向によって曲線を逆順に
    const curvePoints =
      edge.from === fromIdx ? edge.curvePoints : edge.curvePoints.slice().reverse();

    const isOrange = Math.random() < CONFIG.ORANGE_PULSE_CHANCE;
    const tex = isOrange ? this.pulseTextureOrange : this.pulseTextureBlue;

    const material = new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const sprite = new THREE.Sprite(material);
    sprite.position.copy(curvePoints[0]);
    const size = isOrange ? 14 : 12;
    sprite.scale.setScalar(size);
    this.scene.add(sprite);

    this.pulses.push({
      from: fromIdx,
      to: toIdx,
      progress: 0,
      depth,
      sprite,
      isOrange,
      curvePoints,
    });

    // 発火ノードのコア強度上昇
    this.nodes[fromIdx].currentIntensity = Math.min(
      this.nodes[fromIdx].currentIntensity + 0.9,
      2.8
    );
  }

  private spawnRandomPulse(): void {
    if (this.nodes.length === 0) return;
    const candidates = this.nodes.filter((n) => n.connections.length > 0);
    if (candidates.length === 0) return;
    const from = candidates[Math.floor(Math.random() * candidates.length)];
    const fromIdx = this.nodes.indexOf(from);
    const toIdx = from.connections[Math.floor(Math.random() * from.connections.length)];
    this.triggerPulse(fromIdx, toIdx, 0);
  }

  /** 曲線上の位置を進捗 0-1 で取得（線形補間ベース） */
  private interpolateCurve(points: THREE.Vector3[], t: number): THREE.Vector3 {
    if (t <= 0) return points[0].clone();
    if (t >= 1) return points[points.length - 1].clone();
    const totalSegs = points.length - 1;
    const segIndex = Math.floor(t * totalSegs);
    const segT = t * totalSegs - segIndex;
    return new THREE.Vector3().lerpVectors(points[segIndex], points[segIndex + 1], segT);
  }

  private updatePulses(delta: number): void {
    for (let i = this.pulses.length - 1; i >= 0; i--) {
      const pulse = this.pulses[i];
      pulse.progress += CONFIG.PULSE_SPEED * delta;

      if (pulse.progress >= 1) {
        // 到達 → 発火
        this.nodes[pulse.to].currentIntensity = Math.min(
          this.nodes[pulse.to].currentIntensity + 1.1,
          3.3
        );

        // カスケード
        if (
          pulse.depth < CONFIG.CASCADE_MAX_DEPTH &&
          Math.random() < CONFIG.CASCADE_PROBABILITY
        ) {
          const nextNode = this.nodes[pulse.to];
          const candidates = nextNode.connections.filter((c) => c !== pulse.from);
          if (candidates.length > 0) {
            const nextTo = candidates[Math.floor(Math.random() * candidates.length)];
            this.triggerPulse(pulse.to, nextTo, pulse.depth + 1);
          }
        }

        this.scene.remove(pulse.sprite);
        (pulse.sprite.material as THREE.SpriteMaterial).dispose();
        this.pulses.splice(i, 1);
      } else {
        // 曲線上を移動
        const pos = this.interpolateCurve(pulse.curvePoints, pulse.progress);
        pulse.sprite.position.copy(pos);
        // 進行中は徐々に scale を大きく（到達直前がピーク）
        const scale = (pulse.isOrange ? 14 : 12) * (0.7 + 0.5 * Math.sin(pulse.progress * Math.PI));
        pulse.sprite.scale.setScalar(scale);
      }
    }
  }

  // ===== ループ =====

  private update(delta: number): void {
    const now = performance.now();

    // 新パルス生成
    if (!this.prefersReducedMotion && now - this.lastPulseTime > this.nextPulseInterval) {
      this.spawnRandomPulse();
      this.lastPulseTime = now;
      this.nextPulseInterval =
        CONFIG.PULSE_INTERVAL_MIN +
        Math.random() * (CONFIG.PULSE_INTERVAL_MAX - CONFIG.PULSE_INTERVAL_MIN);
    }

    // 星屑ドリフト
    if (this.stars && this.starVelocities && !this.prefersReducedMotion) {
      const positions = this.stars.geometry.attributes.position as THREE.BufferAttribute;
      const arr = positions.array as Float32Array;
      const half = CONFIG.STAR_FIELD_SIZE / 2;
      for (let i = 0; i < CONFIG.STAR_COUNT * 3; i += 3) {
        arr[i] += this.starVelocities[i] * delta;
        arr[i + 1] += this.starVelocities[i + 1] * delta;
        arr[i + 2] += this.starVelocities[i + 2] * delta;
        // 境界ラップ
        if (arr[i] > half) arr[i] -= CONFIG.STAR_FIELD_SIZE;
        else if (arr[i] < -half) arr[i] += CONFIG.STAR_FIELD_SIZE;
        if (arr[i + 1] > half) arr[i + 1] -= CONFIG.STAR_FIELD_SIZE;
        else if (arr[i + 1] < -half) arr[i + 1] += CONFIG.STAR_FIELD_SIZE;
        if (arr[i + 2] > half) arr[i + 2] -= CONFIG.STAR_FIELD_SIZE;
        else if (arr[i + 2] < -half) arr[i + 2] += CONFIG.STAR_FIELD_SIZE;
      }
      positions.needsUpdate = true;
    }

    // ノード更新
    const half = CONFIG.SPACE_SIZE / 2;
    for (const node of this.nodes) {
      if (!this.prefersReducedMotion) {
        node.position.addScaledVector(node.velocity, delta);
        if (Math.abs(node.position.x) > half) node.velocity.x *= -1;
        if (Math.abs(node.position.y) > half * 0.7) node.velocity.y *= -1;
        if (Math.abs(node.position.z) > half * 0.85) node.velocity.z *= -1;

        node.coreMesh.position.copy(node.position);
        node.glowSprite.position.copy(node.position);
      }

      // 発光強度を base に減衰
      node.currentIntensity +=
        (node.baseIntensity - node.currentIntensity) * Math.min(delta * 2, 1);

      // コア & グロースプライトの不透明度を強度に反映
      const coreMat = node.coreMesh.material as THREE.MeshBasicMaterial;
      coreMat.opacity = Math.min(0.5 + node.currentIntensity * 0.35, 1);

      const glowMat = node.glowSprite.material as THREE.SpriteMaterial;
      glowMat.opacity = Math.min(node.currentIntensity * 0.7, 1.4);

      // 発火中はスプライトを少し大きく
      const baseSpriteScale = CONFIG.NODE_SPRITE_SIZE * node.sizeMultiplier;
      const fireScale = 1 + Math.max(0, (node.currentIntensity - node.baseIntensity) * 0.5);
      node.glowSprite.scale.setScalar(baseSpriteScale * fireScale);
    }

    // 樹状突起もノード移動に追従（簡易: 開始点だけ同期しない — 静的配置でも見た目は気にならない）
    // ※ 樹状突起のフル更新はコスト大。初期位置で固定し、ノードが少し動いても違和感出にくい

    // パルス更新
    this.updatePulses(delta);

    // カメラ smoothing
    this.currentCameraOffset.lerp(this.targetCameraOffset, Math.min(delta * 3, 1));
    this.camera.position.x = this.currentCameraOffset.x;
    this.camera.position.y = this.currentCameraOffset.y;
    this.camera.position.z = CONFIG.SPACE_SIZE * 0.55 + this.currentCameraOffset.z;
    this.camera.lookAt(0, 0, 0);
  }

  private render(): void {
    if (this.composer) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }

  private loop = (): void => {
    if (!this.running || !this.visible) {
      this.animationId = null;
      return;
    }
    const delta = Math.min(this.clock.getDelta(), 0.1);
    this.update(delta);
    this.render();
    this.animationId = requestAnimationFrame(this.loop);
  };

  // ===== 公開 API =====

  start(): void {
    if (this.running) return;
    this.running = true;
    this.clock.start();
    this.handleScroll();
    this.loop();
  }

  pause(): void {
    this.running = false;
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  destroy(): void {
    this.pause();
    window.removeEventListener("resize", this.handleResize);
    window.removeEventListener("pointermove", this.handlePointerMove);
    window.removeEventListener("scroll", this.handleScroll);
    document.removeEventListener("visibilitychange", this.handleVisibilityChange);

    // リソース解放
    this.nodes.forEach((n) => {
      this.scene.remove(n.coreMesh);
      (n.coreMesh.material as THREE.Material).dispose();
      this.scene.remove(n.glowSprite);
      (n.glowSprite.material as THREE.Material).dispose();
      n.dendriteLines.forEach((l) => {
        this.scene.remove(l);
        l.geometry.dispose();
      });
    });
    this.edges.forEach((e) => {
      this.scene.remove(e.line);
      e.geometry.dispose();
    });
    this.pulses.forEach((p) => {
      this.scene.remove(p.sprite);
      (p.sprite.material as THREE.Material).dispose();
    });
    if (this.stars) {
      this.scene.remove(this.stars);
      this.stars.geometry.dispose();
      (this.stars.material as THREE.Material).dispose();
    }

    this.glowTextureBlue.dispose();
    this.glowTextureOrange.dispose();
    this.pulseTextureBlue.dispose();
    this.pulseTextureOrange.dispose();
    this.starTexture.dispose();
    this.coreGeometry.dispose();
    this.renderer.dispose();
  }
}

// ===== 起動ヘルパー =====

let instance: NeuralAnimation3D | null = null;

export function startNeuralAnimation3D(canvasId: string): void {
  if (instance) return;

  const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
  if (!canvas) {
    console.warn(`[neural-animation-3d] canvas #${canvasId} not found`);
    return;
  }

  try {
    instance = new NeuralAnimation3D(canvas);
    instance.start();

    window.addEventListener("beforeunload", () => {
      instance?.destroy();
      instance = null;
    });

    if (import.meta.env.DEV) {
      (window as any).__neural3d = instance;
    }
  } catch (err) {
    console.error("[neural-animation-3d] failed to start:", err);
  }
}
