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

/* ---- ビューポート高さの固定（アプリ内ブラウザのガタつき対策） ----
   iOS Safari/Chromeは vh を固定するのでスクロールしても余白は動かないが、
   Instagram/LINE等のアプリ内ブラウザ（WebView）はツールバーの出し入れで
   表示領域が変わり vh が再計算される→縦余白を使う全セクションが一斉にずれ、
   「ページ全体がどこでもガタつく」。対策として、縦方向の余白はCSSで vh の代わりに
   この --vhpx（＝読み込み時の画面高さの1%）を使う。**高さだけの変化（ツールバー
   伸縮）では更新せず、幅が変わった時（画面回転）だけ測り直す**のが肝。 */
function lockViewportHeight(){
  document.documentElement.style.setProperty("--vhpx", (window.innerHeight * 0.01) + "px");
}
lockViewportHeight();
var vhLastWidth = window.innerWidth;
window.addEventListener("resize", function(){
  /* 幅が変わった時（回転など）だけ測り直す。高さだけの変化は無視＝ツールバー伸縮で動かさない */
  if(window.innerWidth !== vhLastWidth){ vhLastWidth = window.innerWidth; lockViewportHeight(); }
});

/* ---- 環境判定 ---- */
A.REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches; /* 視覚効果を減らす設定 */
A.FINE    = window.matchMedia("(pointer: fine)").matches;                  /* マウス等の精密ポインタ */
A.MOBILE  = window.innerWidth < 768;
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

/* ---- 慣性スクロール（Lenis）。モーション低減設定の人には使わない ---- */
A.lenis = null;
if(!A.REDUCED && typeof Lenis !== "undefined"){
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
}

/* v6: 粒子のワードマーク・サンプリング用だったInter待ちは不要になったため撤去。
   本文は 'display:swap' 済みのWebフォントなので、読込を待たず即起動する。 */
boot();

})(window.ANOM);
