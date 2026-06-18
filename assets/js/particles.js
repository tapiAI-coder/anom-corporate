/* =========================================================
   particles.js — ヒーローのWebGL粒子演出（Three.js）
   ---------------------------------------------------------
   ■ 何をしているか
     数千個の粒子が「混沌（ランダムな球状）」から集まり、
     「秩序（ANOMのワードマーク）」を形づくる。
     = ミッション「無駄を削ぎ落とし、自走する組織へ」の視覚化。
   ■ 主な調整ポイント（探しやすいよう【調整】と記載）
     ・粒子の数 / 色 / 大きさ / 形成スピード
   ■ 安全設計
     ・WebGLが使えない端末 → 静的な「ANOM」表示に自動で切り替え
     ・タブが非表示 / ヒーローが画面外 → 描画を止めて省電力
     ・「視覚効果を減らす」設定の人 → 動きなしで完成形だけ表示
========================================================= */
window.ANOM = window.ANOM || {};

(function(A){
"use strict";

/* WebGLが使えない時: canvasを隠し、静的フォールバックを表示する */
function showFallback(canvas){
  if(canvas){ canvas.hidden = true; }
  var fb = document.getElementById("heroFallback");
  if(fb){ fb.hidden = false; }
  return null;
}

A.initParticles = function(){
  var canvas = document.getElementById("particle-canvas");
  if(!canvas || typeof THREE === "undefined"){ return showFallback(canvas); }
  /* 基準サイズはヒーロー要素の実寸（CSSの100svhで固定）を使う。
     window.innerHeightだとスマホのアドレスバー伸縮で値が揺れ、表示が不安定になるため */
  var hero = document.querySelector(".hero") || canvas.parentNode;

  var renderer;
  try{
    renderer = new THREE.WebGLRenderer({ canvas:canvas, alpha:true, antialias:false });
  }catch(e){
    return showFallback(canvas); /* WebGL非対応端末 */
  }

  /* 端末の解像度に合わせる（高すぎると重いので上限あり） */
  var DPR = Math.min(window.devicePixelRatio || 1, A.MOBILE ? 1.5 : 2);
  renderer.setPixelRatio(DPR);
  /* 第3引数false: canvasのCSS(width/height:100%)を上書きしない＝ヒーローに追従させる */
  renderer.setSize(hero.clientWidth, hero.clientHeight, false);

  /* GPUの不調等で描画コンテキストが失われた場合も静的表示へ退避 */
  canvas.addEventListener("webglcontextlost", function(ev){
    ev.preventDefault();
    showFallback(canvas);
  });

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(55, hero.clientWidth/hero.clientHeight, .1, 100);
  camera.position.z = 11;

  /* --- "ANOM" の文字形状を、見えないcanvasに描いて点として読み取る --- */
  var W = 1000, H = 320;
  var tc = document.createElement("canvas");
  tc.width = W; tc.height = H;
  var tx = tc.getContext("2d");
  tx.fillStyle = "#fff";
  tx.textBaseline = "middle";
  tx.font = "800 235px Inter, 'Arial Black', sans-serif";
  /* 字間を手動で空けてワードマークらしく描画 */
  var word = "ANOM", sp = 18;
  var totalW = 0, i;
  for(i=0;i<word.length;i++){ totalW += tx.measureText(word[i]).width + (i<word.length-1?sp:0); }
  var cx = (W-totalW)/2;
  for(i=0;i<word.length;i++){
    tx.fillText(word[i], cx, H/2);
    cx += tx.measureText(word[i]).width + sp;
  }
  var img = tx.getImageData(0,0,W,H).data;
  var targets = [];
  for(var y=0; y<H; y+=3){
    for(var x=0; x<W; x+=3){
      if(img[(y*W+x)*4+3] > 128){
        /* 文字幅=10ユニットの正規化空間へ変換（中心が原点） */
        targets.push([ (x-W/2)/W*10, -(y-H/2)/W*10 ]);
      }
    }
  }
  if(!targets.length){ return showFallback(canvas); } /* フォント描画に失敗した保険 */

  /* 【調整】粒子の数（多いほど密だが重くなる） */
  var COUNT = A.MOBILE ? 2600 : (window.innerWidth < 1100 ? 4500 : 7000);

  var startArr  = new Float32Array(COUNT*3);
  var targetArr = new Float32Array(COUNT*3);
  var randArr   = new Float32Array(COUNT);

  for(i=0;i<COUNT;i++){
    /* 始点（混沌）: 球状にランダム散布 */
    var r = 9*Math.cbrt(Math.random());
    var th = Math.random()*Math.PI*2, ph = Math.acos(2*Math.random()-1);
    startArr[i*3]   = r*Math.sin(ph)*Math.cos(th);
    startArr[i*3+1] = r*Math.sin(ph)*Math.sin(th)*.6;
    startArr[i*3+2] = r*Math.cos(ph)*.5;
    /* 終点（秩序）: 文字上の点（わずかな揺らぎ付き） */
    var t = targets[(Math.random()*targets.length)|0];
    targetArr[i*3]   = t[0] + (Math.random()-.5)*.03;
    targetArr[i*3+1] = t[1] + (Math.random()-.5)*.03;
    targetArr[i*3+2] = (Math.random()-.5)*.25;
    randArr[i] = Math.random();
  }

  var geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(startArr, 3));
  geo.setAttribute("aTarget",  new THREE.BufferAttribute(targetArr, 3));
  geo.setAttribute("aRand",    new THREE.BufferAttribute(randArr, 1));

  var uniforms = {
    uProgress:{ value: A.REDUCED ? 1 : 0 }, /* 形成の進行度（0=混沌 → 1=ANOM） */
    uScatter:{ value: 0 },                  /* スクロール時の再拡散（トンネル演出） */
    uFade:{ value: 1 },                     /* 全体の透明度 */
    uTime:{ value: 0 },
    uMouse:{ value: new THREE.Vector3(999,999,0) },
    uMouseActive:{ value: A.FINE && !A.REDUCED ? 1 : 0 },
    uPixelRatio:{ value: DPR },
    /* 【調整】粒子の色（2色の間でランダムに混ざる） */
    uColorA:{ value: new THREE.Color("#4D5DFF") },
    uColorB:{ value: new THREE.Color("#C9D6FF") }
  };

  /* GPUで動く描画プログラム（シェーダー）。粒子の動きはほぼ全部ここ */
  var mat = new THREE.ShaderMaterial({
    uniforms: uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: [
      "attribute vec3 aTarget;",
      "attribute float aRand;",
      "uniform float uProgress;",
      "uniform float uScatter;",
      "uniform float uTime;",
      "uniform vec3 uMouse;",
      "uniform float uMouseActive;",
      "uniform float uPixelRatio;",
      "varying float vAlpha;",
      "varying float vRand;",
      "float easeOutCubic(float x){ return 1.0 - pow(1.0 - x, 3.0); }",
      "void main(){",
      "  // 粒子ごとに到達タイミングをずらし、混沌→秩序の波をつくる",
      "  float p = clamp(uProgress * 1.6 - aRand * 0.6, 0.0, 1.0);",
      "  p = easeOutCubic(p);",
      "  vec3 pos = mix(position, aTarget, p);",
      "  // 形成後の微細な呼吸",
      "  float w = sin(uTime*1.3 + aRand*40.0)*0.02 + cos(uTime*0.8 + aRand*23.0)*0.02;",
      "  pos.xy += w * (0.4 + aRand);",
      "  // カーソル付近の粒子が反発する",
      "  vec2 d = pos.xy - uMouse.xy;",
      "  float dist = length(d);",
      "  float force = smoothstep(1.7, 0.0, dist) * uMouseActive;",
      "  pos.xy += normalize(d + 0.0001) * force * 0.9;",
      "  // トンネル: 粒子が再び散り、視点の脇を流れていく",
      "  pos.z += uScatter * (aRand * 16.0 - 4.0);",
      "  pos.xy *= 1.0 + uScatter * (aRand * 1.5);",
      "  vec4 mv = modelViewMatrix * vec4(pos, 1.0);",
      "  gl_Position = projectionMatrix * mv;",
      "  float size = (1.6 + aRand * 2.6) * uPixelRatio;",
      "  gl_PointSize = min(size * (6.0 / -mv.z), 60.0 * uPixelRatio);",
      "  vAlpha = 0.35 + 0.65 * p;",
      "  vRand = aRand;",
      "}"
    ].join("\n"),
    fragmentShader: [
      "precision mediump float;",
      "varying float vAlpha;",
      "varying float vRand;",
      "uniform vec3 uColorA;",
      "uniform vec3 uColorB;",
      "uniform float uFade;",
      "void main(){",
      "  vec2 uv = gl_PointCoord - 0.5;",
      "  float d = length(uv);",
      "  float a = smoothstep(0.5, 0.05, d) * vAlpha * uFade;",
      "  vec3 col = mix(uColorA, uColorB, vRand);",
      "  gl_FragColor = vec4(col, a);",
      "}"
    ].join("\n")
  });

  var points = new THREE.Points(geo, mat);
  var group = new THREE.Group();
  group.add(points);
  scene.add(group);

  /* --- 奥行きの星屑（静かに漂う背景の点） --- */
  var dustN = 500;
  var dustArr = new Float32Array(dustN*3);
  for(i=0;i<dustN;i++){
    dustArr[i*3]   = (Math.random()-.5)*30;
    dustArr[i*3+1] = (Math.random()-.5)*16;
    dustArr[i*3+2] = -4 - Math.random()*14;
  }
  var dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustArr,3));
  var dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
    color:0x5A6FB0, size:.05, transparent:true, opacity:.55,
    depthWrite:false, blending:THREE.AdditiveBlending
  }));
  scene.add(dust);

  /* --- 画面サイズに合わせてワードマークを拡縮・配置 ---
     スマホ等の縦長画面ではコピー文が画面上部まで届くため、
     「ナビ下端〜コピー上端」の空きゾーンを実測し、その中央に置く。
     収まらない場合は縮小する（文字との重なりを防ぐ） */
  function fit(){
    var vh = 2 * camera.position.z * Math.tan(camera.fov*Math.PI/360);
    var vw = vh * camera.aspect;
    var H = hero.clientHeight;                /* ヒーロー実寸（svhで安定。innerHeightは使わない） */
    var navBottom = 90;                       /* ナビの下端（px目安） */
    var label = document.querySelector(".hero-label");
    var zoneEnd = label ? label.getBoundingClientRect().top : H*.42;
    if(zoneEnd < navBottom + 100){ zoneEnd = H*.42; } /* 計測異常時の保険 */
    /* スケール: 横幅基準と、空きゾーンの高さ基準の小さい方 */
    var availWorld = vh * (zoneEnd - navBottom - 24) / H;
    /* 横幅の占有率: スマホは粒子の光彩のはみ出し（見切れ）を避けて控えめにする */
    var widthFactor = A.MOBILE ? 0.6 : 0.8;
    var s = Math.min(vw*widthFactor/10, availWorld/3.4, 1.5);
    group.scale.set(s,s,s);
    /* 位置: 空きゾーンの中央（px→ワールド座標へ変換） */
    var centerPx = (navBottom + zoneEnd) / 2;
    group.position.y = vh * (0.5 - centerPx/H);
  }
  fit();

  /* --- マウス座標を、粒子のいる3D空間の座標へ変換 --- */
  var mouseTarget = new THREE.Vector3(999,999,0);
  if(A.FINE && !A.REDUCED){
    window.addEventListener("mousemove", function(e){
      var ndc = new THREE.Vector3(
        (e.clientX/window.innerWidth)*2-1,
        -(e.clientY/window.innerHeight)*2+1, .5);
      ndc.unproject(camera);
      var dir = ndc.sub(camera.position).normalize();
      var t = -camera.position.z/dir.z;
      mouseTarget.copy(camera.position).add(dir.multiplyScalar(t));
      mouseTarget.divideScalar(group.scale.x || 1);
      mouseTarget.y -= group.position.y/(group.scale.x||1);
    });
    window.addEventListener("mouseleave", function(){ mouseTarget.set(999,999,0); });
  }

  /* --- 描画ループ --- */
  var clock = new THREE.Clock();
  if(A.REDUCED){
    /* モーション低減設定: 完成形を1枚だけ描いて止める（動かさない） */
    renderer.render(scene, camera);
  }else{
    (function loop(){
      requestAnimationFrame(loop);
      /* ヒーローが画面外 or タブが非表示なら描画を止める（省電力） */
      if(!A.heroVisible || !A.pageVisible) return;
      uniforms.uTime.value = clock.getElapsedTime();
      uniforms.uMouse.value.lerp(mouseTarget, .12);
      renderer.render(scene, camera);
    })();
  }

  /* --- ウィンドウのリサイズに追従 --- */
  var rT, lastW = hero.clientWidth, lastH = hero.clientHeight;
  window.addEventListener("resize", function(){
    clearTimeout(rT);
    rT = setTimeout(function(){
      var hw = hero.clientWidth, hh = hero.clientHeight;
      /* ヒーロー実寸が変わらない（＝スマホのアドレスバー伸縮だけ）なら何もしない＝表示を安定させる */
      if(hw === lastW && hh === lastH){ return; }
      var widthChanged = (hw !== lastW);
      lastW = hw; lastH = hh;
      camera.aspect = hw/hh;
      camera.updateProjectionMatrix();
      renderer.setSize(hw, hh, false);
      fit();
      if(A.REDUCED){ renderer.render(scene, camera); }
      /* スクロール演出の再計算は横幅が変わった時だけ（高さ変化＝アドレスバーでは再計算しない） */
      if(window.ScrollTrigger && widthChanged){ ScrollTrigger.refresh(); }
    }, 150);
  });

  return { renderer:renderer, camera:camera, uniforms:uniforms, canvas:canvas };
};

})(window.ANOM);
