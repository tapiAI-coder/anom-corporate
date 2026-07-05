/* =========================================================
   main.js — 起動と全体制御
   ---------------------------------------------------------
   ■ このファイルの役割
     1. 環境判定（モーション低減 / ポインタ種別 / 画面幅）
     2. 慣性スクロール（Lenis）の初期化
     3. ナビゲーション（メニュー開閉・スクロールで白背景化）
     4. 各機能の起動順の管理（演出 → フォーム。旧WebGL粒子はv6で停止）
   ■ 読み込み順（index.html の<script>の並び。変更しないこと）
     vendor 3本（gsap / ScrollTrigger / lenis） → config.js
     → animations.js → form.js → main.js（このファイルが最後）
========================================================= */
window.ANOM = window.ANOM || {};

(function(A){
"use strict";

/* ---- 環境判定 ---- */
A.REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches; /* 視覚効果を減らす設定 */
A.FINE    = window.matchMedia("(pointer: fine)").matches;                  /* マウス等の精密ポインタ */
A.MOBILE  = window.innerWidth < 768;
/* タッチ主体の端末か（スマホ・タブレット・Instagram/LINE等のアプリ内ブラウザ＝WebView）。
   これらは端末側のネイティブスクロールとツールバー伸縮が独特で、慣性スクロールや
   毎フレームのスクロール連動演出と競合してガタつく。該当端末はネイティブ挙動に任せる。 */
A.TOUCH   = window.matchMedia("(hover: none), (pointer: coarse)").matches;
A.heroVisible = true;                  /* ヒーローが画面内にあるか（粒子の省電力用） */
A.pageVisible = !document.hidden;      /* タブが表示中か */

/* タブが裏に回ったら粒子の描画を止める（バッテリー・発熱対策） */
document.addEventListener("visibilitychange", function(){
  A.pageVisible = !document.hidden;
});

gsap.registerPlugin(ScrollTrigger);
/* モバイルでアドレスバーの伸縮（画面の高さ変化）によるスクロール再計算を無視し、
   スクロール中のガタつきを防ぐ。横幅の変化（回転など）では従来どおり再計算する */
ScrollTrigger.config({ ignoreMobileResize:true });

/* ---- 慣性スクロール（Lenis）。マウス操作のPCだけで使う ----
   モーション低減設定・タッチ端末（スマホ／アプリ内ブラウザ）では使わない。
   Lenisは毎フレームRAFでスクロールを駆動しScrollTriggerを更新するため、
   WebView（Instagram/LINE等）のネイティブスクロール＋ツールバー伸縮と競合し、
   「下→上に戻るとガタつく」原因になる。タッチ端末はネイティブスクロールに任せ、
   GSAPのlagSmoothing（フレーム落ちの平滑化）も既定のまま残して安定させる。 */
A.lenis = null;
if(!A.REDUCED && !A.TOUCH && typeof Lenis !== "undefined"){
  A.lenis = new Lenis({ duration:1.15, smoothWheel:true });
  A.lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(function(t){ A.lenis.raf(t*1000); });
  gsap.ticker.lagSmoothing(0);
}

/* ---- ページ内リンク（data-scroll属性）のスムーズスクロール ---- */
document.querySelectorAll("[data-scroll]").forEach(function(a){
  a.addEventListener("click", function(e){
    var href = a.getAttribute("href");
    if(!href || href.charAt(0) !== "#") return;
    var target = document.querySelector(href);
    if(!target) return;
    e.preventDefault();
    closeMenu();
    if(A.lenis){ A.lenis.scrollTo(target, { offset:-64 }); }
    else{ target.scrollIntoView({ behavior:"smooth" }); }
  });
});

/* ---- モバイルメニューの開閉 ---- */
var burger = document.getElementById("burger");
var mobileMenu = document.getElementById("mobileMenu");
var nav = document.getElementById("nav");
function closeMenu(){
  nav.classList.remove("menu-open");
  mobileMenu.classList.remove("open");
  burger.setAttribute("aria-expanded","false");
  burger.setAttribute("aria-label","メニューを開く");
}
burger.addEventListener("click", function(){
  var open = mobileMenu.classList.toggle("open");
  nav.classList.toggle("menu-open", open);
  burger.setAttribute("aria-expanded", String(open));
  /* 開いている時は×（閉じる）ボタンとして読み上げさせる */
  burger.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
});
/* Escキーでも閉じられるように（キーボード操作への配慮） */
document.addEventListener("keydown", function(e){
  if(e.key === "Escape"){ closeMenu(); }
});

/* ---- ナビの状態切替（ヒーローを抜けたら白背景に） ---- */
ScrollTrigger.create({
  trigger:"#about", start:"top 80px",
  onEnter:function(){ nav.classList.add("scrolled"); },
  onLeaveBack:function(){ nav.classList.remove("scrolled"); }
});

/* =========================
   起動シーケンス
========================= */
var booted = false;
function boot(){
  if(booted) return; /* 二重起動の防止 */
  booted = true;
  /* v6（タイポ主役エディトリアル）ではヒーローの粒子canvasを常時非表示にしたため、
     initParticles()は呼ばない（呼ぶと見えないWebGLシーンと7000粒子の生成が走り、
     起動を無駄に遅らせるだけになる）。particles.jsのファイル自体は将来の
     再検討用に残してある。 */
  A.initMotion();               /* スクロール演出 */
  A.initPointerFX();            /* カーソル演出 */
  A.initForm();                 /* お問い合わせフォーム */
  window.addEventListener("load", function(){ ScrollTrigger.refresh(); });
  /* 日本語Webフォントは読込を待たず先に表示している（display:swap）ため、
     回線が遅い環境ではページのload完了後にフォントが差し替わり、行の高さや
     文字幅が変わって各演出の発火位置がずれることがある（スクロール中の
     ガタつき・位置ズレの一因）。フォント確定後にもう一度測り直して合わせる */
  if(document.fonts && document.fonts.ready){
    document.fonts.ready.then(function(){ ScrollTrigger.refresh(); });
  }
}

/* v6: 粒子のワードマーク・サンプリング用だったInter待ちは不要になったため撤去。
   本文は 'display:swap' 済みのWebフォントなので、読込を待たず即起動する。 */
boot();

})(window.ANOM);
