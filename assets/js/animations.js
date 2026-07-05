/* =========================================================
   animations.js — スクロール演出・カーソル演出（GSAP・v6タイポ主役）
   ---------------------------------------------------------
   ■ 何をしているか
     1. イントロ: ヒーローのコピーが文字単位で静かに立ち上がる
     2. ヒーローの削り演出: スクロールで「ムダ」に見え消し線＋語が薄くなる
     3. 各セクションのスクロール出現（.reveal / .reveal-group / .split）
     4. サービス4枠のヴィネット（印象を運ぶミニシーン）＋カード出現・メディア読込・動画の省電力再生
     5. 物語インタールード: 「乖離→合流」を文字の間合いだけで語る
     6. 支援の流れ: 道のりの線がスクロールで満ちる（setupFlowRail）
     7. ヒーローの質感: スクロールで墨が満ちるスクラブ描画（setupSeqScrub）
     8. カスタムカーソル / ボタンの吸着 / ヒーローの多層視差・サービス4枠のカーソルチルト
   ■ 仕組みのメモ
     ・HTML側のクラス/属性が合図になる:
         .reveal       … ふわっと出現
         .reveal-group … 子要素が順番に出現
         .split        … 見出しを1文字ずつ出現
         .magnetic     … カーソルに吸着するボタン
         data-svc      … サービスのカード出現＋メディア制御
         .interlude    … 乖離/合流の幕間（setupInterlude）
         data-seq      … 連番画像のスクロールスクラブ描画（setupSeqScrub）
     ・「視覚効果を減らす」設定の人には演出を行わない（全て即時表示。
       インタールードはCSSの標準状態＝完成形なので静止でも意味が通る）
     ・旧v5の粒子連携・トンネル・グロー・2本線SVGは廃止
       （v6タイポ主役の原則: 意味を運ばない動きは足さない）
========================================================= */
window.ANOM = window.ANOM || {};

(function(A){
"use strict";

/* --- 文字分割: 見出しのテキストを1文字ずつ<span>に分ける ---
   入れ子の要素（例: ヒーローの「ムダ」を包む .kezuru）の中の文字も分割する。
   <br>と<svg>（削り線）は分割せずそのまま残す */
function splitChars(el){
  var chars = [];
  (function walk(container){
    var nodes = Array.prototype.slice.call(container.childNodes);
    container.innerHTML = "";
    nodes.forEach(function(node){
      if(node.nodeType === 3){ /* テキスト → 1文字ずつspan化 */
        Array.prototype.forEach.call(node.textContent, function(c){
          var s = document.createElement("span");
          s.className = "ch";
          s.textContent = c;
          container.appendChild(s);
          chars.push(s);
        });
      }else{
        container.appendChild(node);
        if(node.nodeType === 1 && !/^(br|svg)$/i.test(node.tagName) && node.childNodes.length){
          walk(node); /* 中に文字を持つ要素は中まで分割する */
        }
      }
    });
  })(el);
  return chars;
}

/* =========================
   スクロール・イントロ演出
========================= */
A.initMotion = function(){
  var heroCopy = document.getElementById("heroCopy");
  var heroChars = heroCopy ? splitChars(heroCopy) : [];

  /* サービスのメディア読み込み・動画制御は、モーション低減設定でも
     「先頭フレームの静止表示」が必要なため、演出の有無に関わらず先に仕込む */
  setupSvcMedia();

  if(A.REDUCED){
    /* モーション低減: 全て即時表示で終了（アニメなし） */
    gsap.set(".reveal-hero, .reveal, .reveal-group > *, .band-copy .line > span", { opacity:1 });
    return;
  }

  /* --- イントロ: コピーが文字単位で静かに立ち上がる ---
     （旧v5は粒子形成を待って1.5秒後に開始していた。粒子廃止に伴い前倒し） */
  gsap.set(heroChars, { opacity:0, y:26, filter:"blur(10px)" });
  gsap.set(".reveal-hero", { opacity:0, y:20 });
  gsap.to(heroChars, {
    opacity:1, y:0, filter:"blur(0px)",
    duration:.9, ease:"power3.out", stagger:.035, delay:.35,
    /* will-changeはこの一瞬の演出中だけ付ける。付けっぱなしにすると1文字ごとに
       合成レイヤーが残り続け、後々のスクロール全体を重くする（モバイルの描画不安定の一因） */
    onStart:function(){ gsap.set(heroChars, { willChange:"transform,filter,opacity" }); },
    onComplete:function(){ gsap.set(heroChars, { willChange:"auto" }); }
  });
  gsap.to(".reveal-hero", { opacity:1, y:0, duration:1, ease:"power3.out", stagger:.12, delay:1.05 });

  /* --- ヒーローのスクロール連動演出（削り演出・退場フェード・質感パララックス）---
     いずれもスクロール量に毎フレーム同期して変形/減光する。スマホやアプリ内ブラウザ
     （Instagram/LINE等のWebView）ではツールバー伸縮と重なってガタつきの主因になるため、
     タッチ端末では実行しない。削り線はCSS標準状態＝引き切られた完成形（rect width=104）で
     静止し、ヒーローはネイティブスクロールで自然に流れて退場する（意味は保たれる）。 */
  if(!A.TOUCH){
    /* 削り演出: 「ムダ」に筆の一閃が引かれ、語が薄くなる（clipPathの矩形幅で描画） */
    var kez = document.getElementById("kezuru");
    if(kez){
      var kezClip = kez.querySelector(".kezuru-clip");
      var kezChars = kez.querySelectorAll(".ch");
      gsap.set(kezClip, { attr:{ width:0 } }); /* 初期状態は線なし */
      var kezTl = gsap.timeline({
        scrollTrigger:{ trigger:".hero", start:"top top", end:"+=24%", scrub:.6 }
      });
      kezTl.to(kezClip, { attr:{ width:104 }, duration:.7, ease:"none" }, 0); /* 一閃が左から右へ */
      kezTl.to(kezChars, { opacity:.3, duration:.35, ease:"none" }, .5);     /* 削られた語は薄く残る */
    }
    /* ヒーローはスクロールで静かに退場（削り演出が読み切れるよう18%地点から） */
    gsap.to(".hero-inner", {
      y:-50, opacity:0, ease:"none",
      scrollTrigger:{ trigger:".hero", start:"18% top", end:"bottom 40%", scrub:.5 }
    });
    gsap.to(".hero-tagline, .scroll-hint", {
      opacity:0, ease:"none",
      scrollTrigger:{ trigger:".hero", start:"top top", end:"bottom 72%", scrub:.5 }
    });
    /* 質感レイヤーはわずかに遅れて流れる（紙の上を本文が滑る奥行き） */
    gsap.to(".hero-tex", {
      yPercent:7, ease:"none",
      scrollTrigger:{ trigger:".hero", start:"top top", end:"bottom top", scrub:.6 }
    });
  }

  /* --- 見出し（.split）の1文字ずつ出現 --- */
  document.querySelectorAll(".split").forEach(function(h){
    var chars = splitChars(h);
    gsap.from(chars, {
      opacity:0, y:30, filter:"blur(6px)",
      duration:.8, ease:"power3.out", stagger:.025,
      scrollTrigger:{ trigger:h, start:"top 85%" }
    });
  });

  /* --- 汎用のスクロール出現 --- */
  gsap.utils.toArray(".reveal").forEach(function(el){
    gsap.from(el, {
      opacity:0, y:42, duration:1, ease:"power3.out",
      scrollTrigger:{ trigger:el, start:"top 88%" }
    });
  });
  gsap.utils.toArray(".reveal-group").forEach(function(g){
    gsap.from(g.children, {
      opacity:0, y:50, duration:.95, ease:"power3.out", stagger:.1,
      scrollTrigger:{ trigger:g, start:"top 85%" }
    });
  });

  /* --- サービス4ブロックのカード出現 --- */
  setupSvcReveal();

  /* --- サービス4枠のヴィネット: スクロール連動のミニシーン --- */
  setupVignettes();

  /* --- スクロール動画スクラブ: 連番画像をスクロール量でコマ送り描画 --- */
  setupSeqScrub();

  /* --- 物語インタールード: 乖離→合流（文字の間合いで語る） --- */
  setupInterlude();

  /* --- 支援の流れ: 道のりの線がスクロールで満ちる --- */
  setupFlowRail();

  /* --- 自己言及バンド: 行マスクのスライドアップ --- */
  gsap.from(".band-copy .line > span", {
    yPercent:110, duration:1.1, ease:"power4.out", stagger:.14,
    scrollTrigger:{ trigger:".band", start:"top 75%" }
  });

  /* --- 自己言及バンドの背景マーキー: 画面から遠い間はCSSの無限アニメを止める ---
     常時animation:infiniteで回り続けると、ページのどこをスクロール中でも
     合成の負荷になり続ける。画面から十分離れたら一時停止し、近づいたら再開する */
  var bandTrack = document.querySelector(".band-track");
  if(bandTrack && "IntersectionObserver" in window){
    var bandIO = new IntersectionObserver(function(entries){
      entries.forEach(function(en){ bandTrack.classList.toggle("is-paused", !en.isIntersecting); });
    }, { rootMargin:"600px 0px" });
    bandIO.observe(bandTrack);
  }

  /* v6: 背景ブロブは廃止（パララックスも削除） */
};

/* =========================
   サービスのスクロール連動演出
   ---------------------------------------------------------
   対象はServicesの4ブロック（index.htmlの data-svc 属性が合図）。
     1. setupSvcMedia  … 画像/動画の読み込みと、動画の再生/停止。
        「画面に入った/出た」の判定は Intersection Observer
        （ブラウザ標準の可視判定機能。scrollイベントを監視しないので軽い）
     2. setupSvcReveal … カード出現。既存reveal系と同じScrollTrigger駆動で、
        テキストの立ち上がりに半歩遅れてメディアが続く
   素材ファイルが未配置でも壊れない（CSSの下地＝一段沈めた紙が見えるだけ）
========================= */

/* --- メディアの読み込み管理と、動画の省電力な自動再生 --- */
function setupSvcMedia(){
  var blocks = document.querySelectorAll("[data-svc]");
  if(!blocks.length) return;
  var videos = [];

  blocks.forEach(function(block){
    /* 画像: 読み込みに成功した時だけフェードイン（失敗時は透明のまま＝下地が見える） */
    var img = block.querySelector(".svc-media img");
    if(img){
      if(img.complete && img.naturalWidth > 0){ img.classList.add("is-loaded"); }
      else{ img.addEventListener("load", function(){ img.classList.add("is-loaded"); }); }
    }
    var video = block.querySelector(".svc-media video");
    if(video){
      video.muted = true; /* 属性だけでは自動再生を拒む環境があるためJSでも明示 */
      video.addEventListener("loadeddata", function(){ video.classList.add("is-loaded"); });
      videos.push(video);
    }
  });
  if(!videos.length) return;

  if(A.REDUCED){
    /* モーション低減設定: 再生はせず、先頭フレームだけ静止表示する */
    videos.forEach(function(v){ v.preload = "metadata"; v.load(); });
    return;
  }
  if(!("IntersectionObserver" in window)){
    /* 古い環境の保険: 可視判定なしでそのまま再生（音なしループなので実害なし） */
    videos.forEach(function(v){
      v.preload = "auto";
      var p = v.play(); if(p && p.catch){ p.catch(function(){}); }
    });
    return;
  }

  /* 手前600pxまで近づいたら読み込みを開始（表示された時の待ちをなくす） */
  var warm = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(!en.isIntersecting) return;
      en.target.preload = "auto";
      en.target.load();
      warm.unobserve(en.target); /* 読み込みは一度だけでよい */
    });
  }, { rootMargin:"600px 0px" });

  /* 画面内にいる間だけ再生し、外れたら止める（バッテリー・通信量への配慮） */
  var player = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      var v = en.target;
      if(en.isIntersecting){
        v.dataset.inview = "1";
        var p = v.play(); if(p && p.catch){ p.catch(function(){}); }
      }else{
        delete v.dataset.inview;
        v.pause();
      }
    });
  }, { threshold:.2 });

  videos.forEach(function(v){ warm.observe(v); player.observe(v); });

  /* タブが裏に回ったら止め、戻ったら画面内のものだけ再開（main.jsの省電力思想と同じ） */
  document.addEventListener("visibilitychange", function(){
    videos.forEach(function(v){
      if(document.hidden){ v.pause(); }
      else if(v.dataset.inview){ var p = v.play(); if(p && p.catch){ p.catch(function(){}); } }
    });
  });
}

/* --- カード出現: ブロックが下から立ち上がり、メディアが半歩遅れて続く --- */
function setupSvcReveal(){
  var duo = document.querySelector(".svc-duo");
  document.querySelectorAll("[data-svc]").forEach(function(block){
    var media = block.querySelector(".svc-media");
    /* 柱2・柱3は横並びのため、2枚目をわずかに遅らせて順に出す */
    var delay = 0;
    if(duo && duo.contains(block)){
      delay = Array.prototype.indexOf.call(duo.children, block) * .12;
    }
    var tl = gsap.timeline({
      delay: delay,
      scrollTrigger:{ trigger:block, start:"top 85%" } /* 既存revealと同じ発火位置 */
    });
    tl.from(block, { opacity:0, y:46, duration:1, ease:"power3.out" }, 0);
    if(media){
      tl.from(media, { opacity:0, y:26, scale:1.05, duration:1.05, ease:"power3.out" }, .18);
    }
  });
}

/* --- ヴィネットのオーバーレイ（吹き出し・ラベル・実物コピー）のポップ。
   背景の物語はsetupSeqScrubのスクラブが担う --- */
function setupVignettes(){
  /* 汎用ポップ: [data-at] 付きの要素（吹き出し・ラベルなど）は
     額装（.svc-media）が指定スクロール位置に来た時、ふわっと弾んで現れる */
  gsap.utils.toArray(".vin [data-at]").forEach(function(el){
    var root = el.closest(".svc-media");
    gsap.from(el, {
      opacity:0, scale:.55, y:8, transformOrigin:"50% 100%",
      duration:.45, ease:"back.out(1.6)",
      scrollTrigger:{ trigger:root, start:"top " + el.getAttribute("data-at") + "%", toggleActions:"play none none reverse" }
    });
  });
}

/* --- スクロール動画スクラブ: 連番画像をスクロール量でコマ送り描画（scroll-video-scrubスキル） ---
   ・PCのみ（スマホと低減設定はフォールバック静止画のまま＝データ量とCSS標準状態の原則）
   ・読み込みは「近づいたら」開始（IntersectionObserver rootMargin 1200px）
   ・未読込のコマは「読めている直近のコマ」で代用（歯抜けでも破綻しない）
   ・描画はobject-fit:cover相当＋devicePixelRatio対応（上限2） */
function setupSeqScrub(){
  /* タッチ端末（スマホ・タブレット・アプリ内ブラウザ）は連番スクラブを行わず、
     静止フォールバック画像を表示（61枚読込＋毎フレームcanvas描画はWebViewで重くガタつく） */
  if(A.REDUCED || A.MOBILE || A.TOUCH) return;
  document.querySelectorAll("[data-seq]").forEach(function(root){
    var base  = root.getAttribute("data-seq");
    var count = parseInt(root.getAttribute("data-seq-count"), 10);
    var canvas = root.querySelector(".seq-canvas");
    if(!canvas || !count) return;
    var ctx = canvas.getContext("2d");
    var frames = new Array(count);
    var current = -1;
    var pos = { f: 0 };
    function src(i){ return base + "-" + String(i + 1).padStart(3, "0") + ".webp"; }
    function draw(i){
      var img = frames[i];
      if(!img || !img.complete || !img.naturalWidth){
        for(var k = i; k >= 0; k--){
          if(frames[k] && frames[k].complete && frames[k].naturalWidth){ img = frames[k]; break; }
        }
        if(!img || !img.naturalWidth) return;
      }
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = root.clientWidth, h = root.clientHeight;
      if(!w || !h) return;
      if(canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)){
        canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      }
      var s = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
      var dw = img.naturalWidth * s, dh = img.naturalHeight * s;
      ctx.drawImage(img, (canvas.width - dw) / 2, (canvas.height - dh) / 2, dw, dh);
      if(current < 0){ root.classList.add("is-ready"); }
      current = i;
    }
    function load(){
      if(frames[0]) return;
      for(var i = 0; i < count; i++){
        (function(i){
          var img = new Image();
          img.onload = function(){
            if(i === Math.round(pos.f)) draw(i);
            else if(current < 0 && i === 0) draw(0);
          };
          img.src = src(i);
          frames[i] = img;
        })(i);
      }
    }
    if("IntersectionObserver" in window){
      var io = new IntersectionObserver(function(es){
        es.forEach(function(en){ if(en.isIntersecting){ load(); io.disconnect(); } });
      }, { rootMargin: "1200px 0px" });
      io.observe(root);
    }else{ load(); }
    var scopeSel = root.getAttribute("data-seq-scope");
    gsap.to(pos, {
      f: count - 1, ease: "none",
      scrollTrigger: {
        trigger: (scopeSel && root.closest(scopeSel)) || root,
        start: root.getAttribute("data-seq-start") || "top 80%",
        end:   root.getAttribute("data-seq-end")   || "bottom 12%",
        scrub: .5,
        onUpdate: function(){ var i = Math.round(pos.f); if(i !== current) draw(i); }
      }
    });
    ScrollTrigger.addEventListener("refresh", function(){ if(current >= 0) draw(current); });
  });
}

/* --- 物語インタールード: 乖離→合流を「文字の間合い」だけで語る ---
   図形や線は使わず、コピーの前半/後半の距離をスクロールに同期させる。
   CSSの標準状態が常に完成形（①=余白が開いた状態 ②=一行に揃った状態）なので、
   JS無効時・モーション低減時（initMotion冒頭でreturn済み）でも意味が正しく伝わる。
   yPercent＝行の高さ基準の移動量なので、画面サイズが変わっても間合いが崩れない。 */
function setupInterlude(){
  /* タッチ端末（スマホ・アプリ内ブラウザ）はCSS標準状態＝完成形（乖離＝開いた状態／合流＝一行に揃った状態）で
     静止させ、スクロール毎の再計算をなくす（WebViewでのガタつき対策。意味はCSSだけで通る） */
  if(A.TOUCH) return;
  /* ①乖離: 2つの語句が「ほぼ密着した1つの塊」から、スクロールで上下左右に離れていく。
     移動量は2語の間の実際の余白（CSSのmargin）を測って決めるので、
     開始時はほんの数pxの隙間＝寄り添った状態から、開き切った完成形（CSS標準状態）まで動く。
     横方向にも少し寄せておき、縦横同時に離れることで「差が開く」を強調する */
  var dv = document.querySelector(".interlude-diverge");
  if(dv){
    var a = dv.querySelector(".il-a"), b = dv.querySelector(".il-b");
    if(a && b){
      var gap = function(){ return b.offsetTop - (a.offsetTop + a.offsetHeight); }; /* 2語の間の余白(px) */
      var drift = function(){ return Math.min(window.innerWidth * .06, 72); };      /* 横の寄せ幅 */
      gsap.from(a, { y:function(){ return gap() * .44; },  x:function(){ return drift(); },  ease:"none",
        scrollTrigger:{ trigger:dv, start:"top 74%", end:"center 42%", scrub:.7, invalidateOnRefresh:true } });
      gsap.from(b, { y:function(){ return -gap() * .44; }, x:function(){ return -drift(); }, ease:"none",
        scrollTrigger:{ trigger:dv, start:"top 74%", end:"center 42%", scrub:.7, invalidateOnRefresh:true } });
    }
  }
  /* ②合流: 上下に割れていた語が、スクロールで一行に揃う（差が埋まる） */
  var mg = document.querySelector(".interlude-merge");
  if(mg){
    var fa = mg.querySelector(".frag-a"), fb = mg.querySelector(".frag-b");
    if(fa && fb){
      gsap.from(fa, { yPercent:-120, ease:"none",
        scrollTrigger:{ trigger:mg, start:"top 78%", end:"center 48%", scrub:.7 } });
      gsap.from(fb, { yPercent:120, ease:"none",
        scrollTrigger:{ trigger:mg, start:"top 78%", end:"center 48%", scrub:.7 } });
    }
  }
}

/* --- 支援の流れ: 1本の線が5つの結節点を通って満ちていく --- */
function setupFlowRail(){
  var rail = document.querySelector(".flow-steps");
  if(!rail) return;
  /* タッチ端末は満ちた完成形（--flow-p:1）で静止し、スクロール毎のscrub計算を避ける（WebViewのガタつき対策） */
  if(A.TOUCH){ rail.style.setProperty("--flow-p", 1); return; }
  rail.style.setProperty("--flow-p", 0); /* 開始値を明示（CSS変数の初期値をGSAPが読めるように） */
  gsap.to(rail, {
    "--flow-p": 1, ease:"none",
    scrollTrigger:{ trigger:".flow", start:"top 75%", end:"center 45%", scrub:.7 }
  });
}

/* =========================
   カーソル演出（マウス操作のPCのみ）
========================= */
A.initPointerFX = function(){
  if(!A.FINE || A.REDUCED) return;
  document.body.classList.add("js-fine");

  /* --- カスタムカーソル（点＋遅れてついてくる輪） --- */
  var dot = document.querySelector(".cursor-dot");
  var ring = document.querySelector(".cursor-ring");
  var mx=innerWidth/2, my=innerHeight/2, rx=mx, ry=my;
  window.addEventListener("mousemove", function(e){ mx=e.clientX; my=e.clientY; });
  gsap.ticker.add(function(){
    rx += (mx-rx)*.16; ry += (my-ry)*.16;
    dot.style.transform  = "translate("+mx+"px,"+my+"px) translate(-50%,-50%)";
    ring.style.transform = "translate("+rx+"px,"+ry+"px) translate(-50%,-50%)";
  });
  document.querySelectorAll("a, button, summary").forEach(function(el){
    el.addEventListener("mouseenter", function(){ ring.classList.add("is-hover"); });
    el.addEventListener("mouseleave", function(){ ring.classList.remove("is-hover"); });
  });

  /* --- マグネティックボタン（カーソルに吸い寄せられる） --- */
  document.querySelectorAll(".magnetic").forEach(function(el){
    var xTo = gsap.quickTo(el, "x", { duration:.4, ease:"power3" });
    var yTo = gsap.quickTo(el, "y", { duration:.4, ease:"power3" });
    el.addEventListener("mousemove", function(e){
      var b = el.getBoundingClientRect();
      xTo((e.clientX - (b.left+b.width/2)) * .32);
      yTo((e.clientY - (b.top+b.height/2)) * .32);
    });
    el.addEventListener("mouseleave", function(){
      gsap.to(el, { x:0, y:0, duration:.7, ease:"elastic.out(1,.45)" });
    });
  });

  /* --- カーソル多層視差: ヒーローの奥行き（cursor-depth-3dスキル） ---
     背景の墨は視点と逆へ、小さなラベル類は手前へ。本文と見出しは動かさない（可読性の鉄則） */
  var heroScene = document.querySelector(".hero");
  if(heroScene){
    var depthLayers = [
      { el: document.querySelector(".hero-tex"),    d: -10 },
      { el: document.querySelector(".hero-label"),  d: 5 },
      { el: document.querySelector(".hero-tagline"),d: 7 },
      { el: document.querySelector(".scroll-hint"), d: 9 }
    ].filter(function(L){ return L.el; }).map(function(L){
      return { d: L.d,
               x: gsap.quickTo(L.el, "x", { duration:.7, ease:"power3" }),
               y: gsap.quickTo(L.el, "y", { duration:.7, ease:"power3" }) };
    });
    heroScene.addEventListener("mousemove", function(e){
      var b = heroScene.getBoundingClientRect();
      var nx = (e.clientX - b.left) / b.width  - .5;
      var ny = (e.clientY - b.top)  / b.height - .5;
      depthLayers.forEach(function(L){ L.x(nx * L.d); L.y(ny * L.d * .7); });
    });
    heroScene.addEventListener("mouseleave", function(){
      depthLayers.forEach(function(L){ L.x(0); L.y(0); });
    });
  }

  /* --- カーソルチルト: サービス4枠がカーソルへ静かに会釈する（最大2.5度＝上質圏） --- */
  document.querySelectorAll(".svc-vin").forEach(function(el){
    gsap.set(el, { transformPerspective: 900 });
    var rx = gsap.quickTo(el, "rotationX", { duration:.5, ease:"power3" });
    var ry = gsap.quickTo(el, "rotationY", { duration:.5, ease:"power3" });
    el.addEventListener("mousemove", function(e){
      var b = el.getBoundingClientRect();
      var nx = (e.clientX - b.left) / b.width  - .5;
      var ny = (e.clientY - b.top)  / b.height - .5;
      ry(nx * 5);  /* ±2.5度 */
      rx(ny * -5);
    });
    el.addEventListener("mouseleave", function(){
      gsap.to(el, { rotationX:0, rotationY:0, duration:.9, ease:"elastic.out(1,.5)" });
    });
  });
};

})(window.ANOM);
