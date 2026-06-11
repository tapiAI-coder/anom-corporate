// OrbCanvas.tsx — About セクション右側の光点球体ラッパー
// anom-orb-scene.ts（Three.js vanilla）を React ライフサイクルに接続する薄いラッパー。
// マウス位置は canvas 基準の NDC に変換して渡す。canvas 外のときは setMouseActive(0) でフェードアウト。

import { useEffect, useRef, useState } from "react";
import type { AnomOrbSceneHandle } from "../../scripts/anom-orb-scene";

interface OrbCanvasProps {
  /** コンテナに適用する追加クラス（アスペクト比・サイズ調整用） */
  className?: string;
  /** aria-label（装飾要素だが SR 向けに説明したい場合） */
  label?: string;
}

export default function OrbCanvas({ className = "", label }: OrbCanvasProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleRef = useRef<AnomOrbSceneHandle | null>(null);
  const [ready, setReady] = useState(false);

  // ===== シーン起動（マウント後に dynamic import） =====
  useEffect(() => {
    let cancelled = false;

    // dynamic import で three.js バンドルを他ページで読み込まない
    import("../../scripts/anom-orb-scene").then(({ startAnomOrbScene }) => {
      if (cancelled || !canvasRef.current) return;
      handleRef.current = startAnomOrbScene(canvasRef.current);
      setReady(true);
    });

    return () => {
      cancelled = true;
      handleRef.current?.destroy();
      handleRef.current = null;
    };
  }, []);

  // ===== マウスイベント（PC のみ） =====
  useEffect(() => {
    if (!ready) return;
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    function handleMove(e: PointerEvent) {
      const rect = wrapper!.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      handleRef.current?.setMouse(nx, ny);
      handleRef.current?.setMouseActive(1);
    }
    function handleLeave() {
      handleRef.current?.setMouseActive(0);
    }

    wrapper.addEventListener("pointermove", handleMove);
    wrapper.addEventListener("pointerleave", handleLeave);
    return () => {
      wrapper.removeEventListener("pointermove", handleMove);
      wrapper.removeEventListener("pointerleave", handleLeave);
    };
  }, [ready]);

  return (
    <div
      ref={wrapperRef}
      className={`relative ${className}`}
      aria-hidden={label ? undefined : true}
      aria-label={label}
    >
      <canvas
        ref={canvasRef}
        className="block h-full w-full"
        // 初期化前の一瞬の空白を目立たせないためフェードイン
        style={{
          opacity: ready ? 1 : 0,
          transition: "opacity 0.8s ease-out",
        }}
      />
    </div>
  );
}
