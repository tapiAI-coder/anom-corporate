/**
 * ニューロン伝達アニメーション — vanilla Canvas 2D 実装
 *
 * コンセプト（CLAUDE.md 4-3 参照）:
 *   暗闇（導入前）→ 光の連鎖（AI 変革後）の対比を UX で体験させる。
 *   - 黒背景に神経伝達ネットワークが広がる
 *   - スクロール深度に比例してノード密度が増加
 *   - 1〜2秒間隔でスパーク（光の粒）がノード間を走る
 *   - PC はカーソル引力（半径 150px）
 *
 * パフォーマンス:
 *   - requestAnimationFrame 単一ループ
 *   - document.hidden / IntersectionObserver で一時停止
 *   - DPR 上限 2
 *   - モバイルはノード数半減、カーソル連動無効
 *   - prefers-reduced-motion は静止状態（スパーク無効）
 */

// ========================================
// 設定定数
// ========================================

const CONFIG = {
  // ノード数
  INITIAL_NODES_PC: 40,
  INITIAL_NODES_MOBILE: 20,
  MAX_NODES_PC: 150,
  MAX_NODES_MOBILE: 75,

  // ノード見た目
  NODE_RADIUS_MIN: 1.2,
  NODE_RADIUS_MAX: 2.4,
  NODE_OPACITY_MIN: 0.3,
  NODE_OPACITY_MAX: 0.7,

  // 接続判定
  CONNECT_RADIUS_PC: 180,
  CONNECT_RADIUS_MOBILE: 140,
  MAX_CONNECTIONS_PER_NODE: 3, // 1 ノードあたり描画する線の最大数

  // 動き
  NODE_SPEED: 0.15, // px/frame（60fps 基準）
  ATTRACT_RADIUS: 150,
  ATTRACT_FORCE: 0.04,
  DAMPING: 0.96, // 速度減衰

  // スパーク
  SPARK_INTERVAL_MIN: 800, // ms
  SPARK_INTERVAL_MAX: 2000, // ms
  SPARK_DURATION_MIN: 500, // ms
  SPARK_DURATION_MAX: 900, // ms
  SPARK_RADIUS: 2.2,
  SPARK_GLOW: 12,

  // 色
  NODE_COLOR_BASE: [255, 255, 255] as const, // white
  SPARK_COLOR_A: [59, 130, 246] as const,    // #3b82f6 blue-500
  SPARK_COLOR_B: [139, 92, 246] as const,    // #8b5cf6 violet-500
  LINE_OPACITY: 0.08,

  // その他
  DPR_MAX: 2,
  MOBILE_BREAKPOINT: 768, // px
  SCROLL_THROTTLE_MS: 16,
} as const;

// ========================================
// 型定義
// ========================================

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  /** 画面に現れた時刻（フェードイン用） */
  spawnTime: number;
}

interface Spark {
  from: Node;
  to: Node;
  /** 0〜1 の進行度 */
  progress: number;
  /** スポーン時刻 */
  startTime: number;
  /** 所要時間 ms */
  duration: number;
}

// ========================================
// メインクラス
// ========================================

class NeuralAnimation {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  // 画面サイズ（CSS px）
  private width = 0;
  private height = 0;
  private dpr = 1;

  // 環境判定
  private isMobile = false;
  private isReduced = false;

  // ステート
  private nodes: Node[] = [];
  private sparks: Spark[] = [];
  private pointer = { x: 0, y: 0, active: false };
  private scrollProgress = 0;
  private targetNodeCount = 0;

  // ループ制御
  private running = false;
  private rafId: number | null = null;
  private lastSparkSpawn = 0;
  private nextSparkInterval = 0;
  private resizeHandler: (() => void) | null = null;
  private pointerHandler: ((e: PointerEvent) => void) | null = null;
  private pointerLeaveHandler: (() => void) | null = null;
  private scrollHandler: (() => void) | null = null;
  private visibilityHandler: (() => void) | null = null;
  private intersectionObserver: IntersectionObserver | null = null;
  private inViewport = true;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) {
      throw new Error("Canvas 2D context の取得に失敗");
    }
    this.ctx = ctx;
    this.detectEnvironment();
    this.setupCanvas();
    this.spawnInitialNodes();
    this.updateScrollProgress();
    this.nextSparkInterval = this.randomSparkInterval();
    this.attachListeners();
  }

  // --- 環境検出 ---

  private detectEnvironment(): void {
    this.isMobile = window.matchMedia(
      `(max-width: ${CONFIG.MOBILE_BREAKPOINT}px)`
    ).matches;
    this.isReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
  }

  // --- Canvas 設定 ---

  private setupCanvas(): void {
    this.resize();
  }

  private resize(): void {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, CONFIG.DPR_MAX);

    // 実解像度サイズ設定
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    // CSS サイズ設定
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    // DPR スケーリング
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  // --- ノード生成 ---

  private spawnInitialNodes(): void {
    const initialCount = this.isMobile
      ? CONFIG.INITIAL_NODES_MOBILE
      : CONFIG.INITIAL_NODES_PC;
    for (let i = 0; i < initialCount; i++) {
      this.spawnNode(true);
    }
    this.targetNodeCount = initialCount;
  }

  private spawnNode(immediate = false): void {
    const node: Node = {
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      vx: (Math.random() - 0.5) * CONFIG.NODE_SPEED * 2,
      vy: (Math.random() - 0.5) * CONFIG.NODE_SPEED * 2,
      radius:
        CONFIG.NODE_RADIUS_MIN +
        Math.random() * (CONFIG.NODE_RADIUS_MAX - CONFIG.NODE_RADIUS_MIN),
      opacity:
        CONFIG.NODE_OPACITY_MIN +
        Math.random() * (CONFIG.NODE_OPACITY_MAX - CONFIG.NODE_OPACITY_MIN),
      spawnTime: immediate ? 0 : performance.now(),
    };
    this.nodes.push(node);
  }

  // --- スクロール連動 ---

  private updateScrollProgress(): void {
    const maxScroll = Math.max(
      document.documentElement.scrollHeight - window.innerHeight,
      1
    );
    this.scrollProgress = Math.min(window.scrollY / maxScroll, 1);

    // 目標ノード数を更新
    const maxNodes = this.isMobile
      ? CONFIG.MAX_NODES_MOBILE
      : CONFIG.MAX_NODES_PC;
    const initialNodes = this.isMobile
      ? CONFIG.INITIAL_NODES_MOBILE
      : CONFIG.INITIAL_NODES_PC;
    this.targetNodeCount = Math.floor(
      initialNodes + (maxNodes - initialNodes) * this.scrollProgress
    );
  }

  // --- スパーク生成 ---

  private randomSparkInterval(): number {
    const { SPARK_INTERVAL_MIN, SPARK_INTERVAL_MAX } = CONFIG;
    const range = SPARK_INTERVAL_MAX - SPARK_INTERVAL_MIN;
    // スクロール深度が上がるほど頻度 UP
    const speedMultiplier = 1 - this.scrollProgress * 0.5; // 深いほど半分に
    return (SPARK_INTERVAL_MIN + Math.random() * range) * speedMultiplier;
  }

  private spawnSpark(): void {
    if (this.isReduced) return; // reduced-motion 時はスパーク無効
    if (this.nodes.length < 2) return;

    const connectRadius = this.isMobile
      ? CONFIG.CONNECT_RADIUS_MOBILE
      : CONFIG.CONNECT_RADIUS_PC;

    // ランダムなノードを選ぶ
    const from = this.nodes[Math.floor(Math.random() * this.nodes.length)];

    // 接続距離内のノードを探す
    const candidates: Node[] = [];
    for (const node of this.nodes) {
      if (node === from) continue;
      const dx = node.x - from.x;
      const dy = node.y - from.y;
      if (dx * dx + dy * dy < connectRadius * connectRadius) {
        candidates.push(node);
      }
    }
    if (candidates.length === 0) return;

    const to = candidates[Math.floor(Math.random() * candidates.length)];
    const duration =
      CONFIG.SPARK_DURATION_MIN +
      Math.random() * (CONFIG.SPARK_DURATION_MAX - CONFIG.SPARK_DURATION_MIN);

    this.sparks.push({
      from,
      to,
      progress: 0,
      startTime: performance.now(),
      duration,
    });
  }

  // --- イベントリスナー ---

  private attachListeners(): void {
    // Resize（throttled）
    let resizeRaf: number | null = null;
    this.resizeHandler = () => {
      if (resizeRaf !== null) return;
      resizeRaf = requestAnimationFrame(() => {
        this.detectEnvironment();
        this.resize();
        resizeRaf = null;
      });
    };
    window.addEventListener("resize", this.resizeHandler, { passive: true });

    // Pointer（PC のみ）
    if (!this.isMobile) {
      this.pointerHandler = (e: PointerEvent) => {
        this.pointer.x = e.clientX;
        this.pointer.y = e.clientY;
        this.pointer.active = true;
      };
      this.pointerLeaveHandler = () => {
        this.pointer.active = false;
      };
      window.addEventListener("pointermove", this.pointerHandler, {
        passive: true,
      });
      window.addEventListener("pointerleave", this.pointerLeaveHandler);
    }

    // Scroll（throttled）
    let lastScrollTime = 0;
    this.scrollHandler = () => {
      const now = performance.now();
      if (now - lastScrollTime < CONFIG.SCROLL_THROTTLE_MS) return;
      lastScrollTime = now;
      this.updateScrollProgress();
    };
    window.addEventListener("scroll", this.scrollHandler, { passive: true });

    // Visibility（タブ非表示時は停止）
    this.visibilityHandler = () => {
      if (document.hidden) {
        this.pause();
      } else if (this.inViewport) {
        this.resume();
      }
    };
    document.addEventListener("visibilitychange", this.visibilityHandler);

    // Viewport（canvas が画面外なら停止）
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          this.inViewport = entry.isIntersecting;
          if (this.inViewport && !document.hidden) {
            this.resume();
          } else {
            this.pause();
          }
        }
      },
      { threshold: 0 }
    );
    this.intersectionObserver.observe(this.canvas);
  }

  private detachListeners(): void {
    if (this.resizeHandler) {
      window.removeEventListener("resize", this.resizeHandler);
    }
    if (this.pointerHandler) {
      window.removeEventListener("pointermove", this.pointerHandler);
    }
    if (this.pointerLeaveHandler) {
      window.removeEventListener("pointerleave", this.pointerLeaveHandler);
    }
    if (this.scrollHandler) {
      window.removeEventListener("scroll", this.scrollHandler);
    }
    if (this.visibilityHandler) {
      document.removeEventListener("visibilitychange", this.visibilityHandler);
    }
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
  }

  // --- 更新 ---

  private update(now: number): void {
    // 目標ノード数との差分を徐々に埋める
    if (this.nodes.length < this.targetNodeCount) {
      // 1 フレームで追加するノード数は最大 1（急増を避けて滑らかに）
      this.spawnNode();
    } else if (this.nodes.length > this.targetNodeCount) {
      // 上限超過時は少しずつ削減（現状スクロール戻しではほぼ発生しない）
      this.nodes.pop();
    }

    // ノード更新
    for (const node of this.nodes) {
      // 速度減衰
      node.vx *= CONFIG.DAMPING;
      node.vy *= CONFIG.DAMPING;

      // カーソル引力（PC のみ）
      if (this.pointer.active && !this.isMobile && !this.isReduced) {
        const dx = this.pointer.x - node.x;
        const dy = this.pointer.y - node.y;
        const distSq = dx * dx + dy * dy;
        const radiusSq = CONFIG.ATTRACT_RADIUS * CONFIG.ATTRACT_RADIUS;
        if (distSq < radiusSq && distSq > 1) {
          const dist = Math.sqrt(distSq);
          const force =
            ((CONFIG.ATTRACT_RADIUS - dist) / CONFIG.ATTRACT_RADIUS) *
            CONFIG.ATTRACT_FORCE;
          node.vx += (dx / dist) * force;
          node.vy += (dy / dist) * force;
        }
      }

      // 位置更新
      node.x += node.vx;
      node.y += node.vy;

      // 画面端で反射
      if (node.x < 0 || node.x > this.width) {
        node.vx *= -1;
        node.x = Math.max(0, Math.min(this.width, node.x));
      }
      if (node.y < 0 || node.y > this.height) {
        node.vy *= -1;
        node.y = Math.max(0, Math.min(this.height, node.y));
      }
    }

    // スパーク更新
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const spark = this.sparks[i];
      spark.progress = Math.min((now - spark.startTime) / spark.duration, 1);
      if (spark.progress >= 1) {
        this.sparks.splice(i, 1);
      }
    }

    // スパーク生成判定
    if (!this.isReduced && now - this.lastSparkSpawn > this.nextSparkInterval) {
      this.spawnSpark();
      this.lastSparkSpawn = now;
      this.nextSparkInterval = this.randomSparkInterval();
    }
  }

  // --- 描画 ---

  private draw(now: number): void {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    const connectRadius = this.isMobile
      ? CONFIG.CONNECT_RADIUS_MOBILE
      : CONFIG.CONNECT_RADIUS_PC;
    const connectRadiusSq = connectRadius * connectRadius;

    // ----- ライン描画（バッチ）-----
    ctx.save();
    ctx.strokeStyle = `rgba(255, 255, 255, ${CONFIG.LINE_OPACITY})`;
    ctx.lineWidth = 0.6;
    ctx.beginPath();

    for (let i = 0; i < this.nodes.length; i++) {
      const a = this.nodes[i];
      let drawn = 0;
      for (let j = i + 1; j < this.nodes.length; j++) {
        const b = this.nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < connectRadiusSq) {
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          drawn++;
          if (drawn >= CONFIG.MAX_CONNECTIONS_PER_NODE) break;
        }
      }
    }
    ctx.stroke();
    ctx.restore();

    // ----- ノード描画 -----
    ctx.save();
    for (const node of this.nodes) {
      // フェードイン（スポーン後 600ms で完全表示）
      const fadeIn = node.spawnTime
        ? Math.min((now - node.spawnTime) / 600, 1)
        : 1;
      const opacity = node.opacity * fadeIn;
      ctx.fillStyle = `rgba(${CONFIG.NODE_COLOR_BASE.join(",")}, ${opacity})`;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // ----- スパーク描画（グロー付き）-----
    ctx.save();
    for (const spark of this.sparks) {
      // 現在位置
      const x = spark.from.x + (spark.to.x - spark.from.x) * spark.progress;
      const y = spark.from.y + (spark.to.y - spark.from.y) * spark.progress;

      // 色は progress で A→B 補間
      const t = spark.progress;
      const r = Math.round(
        CONFIG.SPARK_COLOR_A[0] +
          (CONFIG.SPARK_COLOR_B[0] - CONFIG.SPARK_COLOR_A[0]) * t
      );
      const g = Math.round(
        CONFIG.SPARK_COLOR_A[1] +
          (CONFIG.SPARK_COLOR_B[1] - CONFIG.SPARK_COLOR_A[1]) * t
      );
      const b = Math.round(
        CONFIG.SPARK_COLOR_A[2] +
          (CONFIG.SPARK_COLOR_B[2] - CONFIG.SPARK_COLOR_A[2]) * t
      );
      const color = `rgb(${r}, ${g}, ${b})`;

      // グロー効果
      ctx.shadowBlur = CONFIG.SPARK_GLOW;
      ctx.shadowColor = color;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, CONFIG.SPARK_RADIUS, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // --- ループ ---

  private loop = (now: number): void => {
    if (!this.running) return;
    this.update(now);
    this.draw(now);
    this.rafId = requestAnimationFrame(this.loop);
  };

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastSparkSpawn = performance.now();
    this.rafId = requestAnimationFrame(this.loop);
  }

  pause(): void {
    this.running = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  resume(): void {
    if (this.running) return;
    this.start();
  }

  destroy(): void {
    this.pause();
    this.detachListeners();
    this.nodes = [];
    this.sparks = [];
  }
}

// ========================================
// エクスポート — 初期化関数
// ========================================

/**
 * ニューロンアニメーションを起動する。
 * 呼び出し元の `<script>` から import して呼ぶ。
 *
 * 注意: この関数は複数回呼び出しても安全（重複起動を防ぐ）。
 */
export function startNeuralAnimation(canvasId = "neural-canvas"): void {
  // 重複起動防止
  if ((window as any).__neuralAnimation) {
    return;
  }

  const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
  if (!canvas) {
    console.warn(`Neural animation: canvas #${canvasId} not found`);
    return;
  }

  const animation = new NeuralAnimation(canvas);
  animation.start();

  // 開発時のデバッグ用
  (window as any).__neuralAnimation = animation;
}
