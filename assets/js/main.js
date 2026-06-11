/* =========================================================
   main.js — 起動と全体制御
   ---------------------------------------------------------
   ■ このファイルの役割
     1. 環境判定（モーション低減 / ポインタ種別 / 画面幅）
     2. 慣性スクロール（Lenis）の初期化
     3. ナビゲーション（メニュー開閉・スクロールで白背景化）
     4. 各機能の起動順の管理（フォント読込 → 粒子 → 演出 → フォーム）
   ■ 読み込み順（index.html の<script>の並び。変更しないこと）
     vendor 4本 → config.js → particles.js → animations.js
     → form.js → main.js（このファイルが最後）
========================================================= */
window.ANOM = window.ANOM || {};

(function(A){
"use strict";

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
}
burger.addEventListener("click", function(){
  var open = mobileMenu.classList.toggle("open");
  nav.classList.toggle("menu-open", open);
  burger.setAttribute("aria-expanded", String(open));
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
  A.three = A.initParticles();  /* WebGL粒子（不可ならnull＝静的表示） */
  A.initMotion();               /* スクロール演出 */
  A.initPointerFX();            /* カーソル演出 */
  A.initForm();                 /* お問い合わせフォーム */
  window.addEventListener("load", function(){ ScrollTrigger.refresh(); });
}

/* Interフォントの読込を待ってから起動する。
   （粒子が「ANOM」の文字形を正しくサンプリングできるように）
   読込が遅い場合も1.8秒で必ず起動する保険付き */
if(document.fonts && document.fonts.load){
  Promise.all([
    document.fonts.load("800 235px Inter"),
    document.fonts.load("700 40px 'Noto Sans JP'")
  ]).then(boot).catch(boot);
  setTimeout(boot, 1800);
}else{
  boot();
}

})(window.ANOM);
