/* =========================================================
   animations.js — スクロール演出・カーソル演出（GSAP）
   ---------------------------------------------------------
   ■ 何をしているか
     1. イントロ: 粒子の形成と同期して、コピーが文字単位で立ち上がる
     2. トンネル: ヒーローを固定し、スクロールで粒子の中へ潜る転換演出
     3. 各セクションのスクロール出現（.reveal / .reveal-group / .split）
     4. カスタムカーソル / ボタンの吸着 / カードの3Dチルト
   ■ 仕組みのメモ
     ・HTML側のクラスが合図になる:
         .reveal       … ふわっと出現
         .reveal-group … 子要素が順番に出現
         .split        … 見出しを1文字ずつ出現
         .magnetic     … カーソルに吸着するボタン
         .tilt         … ホバーで奥行きが出るカード
     ・「視覚効果を減らす」設定の人には演出を行わない（全て即時表示）
========================================================= */
window.ANOM = window.ANOM || {};

(function(A){
"use strict";

/* --- 文字分割: 見出しのテキストを1文字ずつ<span>に分ける --- */
function splitChars(el){
  var chars = [];
  var nodes = Array.prototype.slice.call(el.childNodes);
  el.innerHTML = "";
  nodes.forEach(function(node){
    if(node.nodeType === 3){ /* テキスト → 1文字ずつspan化 */
      Array.prototype.forEach.call(node.textContent, function(c){
        var s = document.createElement("span");
        s.className = "ch";
        s.textContent = c;
        el.appendChild(s);
        chars.push(s);
      });
    }else{
      el.appendChild(node); /* <br>などのタグはそのまま残す */
    }
  });
  return chars;
}

/* =========================
   スクロール・イントロ演出
========================= */
A.initMotion = function(){
  var heroCopy = document.getElementById("heroCopy");
  var heroChars = heroCopy ? splitChars(heroCopy) : [];

  if(A.REDUCED){
    /* モーション低減: 全て即時表示で終了（アニメなし） */
    gsap.set(".reveal-hero, .reveal, .reveal-group > *, .band-copy .line > span", { opacity:1 });
    return;
  }

  /* --- イントロ: 粒子形成 → コピーが文字単位で立ち上がる --- */
  if(A.three){
    /* 【調整】形成スピード: duration（秒）を変える */
    gsap.to(A.three.uniforms.uProgress, { value:1, duration:2.6, ease:"power2.inOut", delay:.35 });
  }
  gsap.set(heroChars, { opacity:0, y:26, filter:"blur(10px)" });
  gsap.set(".reveal-hero", { opacity:0, y:20 });
  gsap.to(heroChars, {
    opacity:1, y:0, filter:"blur(0px)",
    duration:.9, ease:"power3.out", stagger:.035, delay:1.5
  });
  gsap.to(".reveal-hero", { opacity:1, y:0, duration:1, ease:"power3.out", stagger:.12, delay:2.2 });

  /* --- トンネル: ヒーローを固定し、組織の内側へ潜る（1回だけの見せ場） --- */
  var tunnel = gsap.timeline({
    scrollTrigger:{
      trigger:".hero", start:"top top",
      end: A.MOBILE ? "+=80%" : "+=130%",
      pin:true, scrub:.8,
      onLeave:function(){ A.heroVisible = false; },   /* 通過後は粒子の描画を止める */
      onEnterBack:function(){ A.heroVisible = true; }
    }
  });
  if(A.three){
    tunnel
      .to(A.three.camera.position, { z:3.2, ease:"power1.in" }, 0)
      .to(A.three.uniforms.uScatter, { value:1, ease:"power1.in" }, 0)
      .to(A.three.uniforms.uFade, { value:0, ease:"power1.in" }, .45);
  }
  tunnel
    .to(".hero-inner", { y:-90, opacity:0, filter:"blur(6px)", ease:"power1.in" }, 0)
    .to(".hero-tagline, .scroll-hint", { opacity:0, ease:"power1.in" }, 0);

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

  /* --- 自己言及バンド: 行マスクのスライドアップ --- */
  gsap.from(".band-copy .line > span", {
    yPercent:110, duration:1.1, ease:"power4.out", stagger:.14,
    scrollTrigger:{ trigger:".band", start:"top 75%" }
  });

  /* --- ブロブ（背景の有機形状）のスクロール連動パララックス --- */
  gsap.to(".blob-1", { yPercent:36, scrollTrigger:{ trigger:"#about", start:"top bottom", end:"bottom top", scrub:1.2 }});
  gsap.to(".blob-2", { yPercent:-30, scrollTrigger:{ trigger:"#usecases", start:"top bottom", end:"bottom top", scrub:1.2 }});
};

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
  document.querySelectorAll("a, button, .tilt, summary").forEach(function(el){
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

  /* --- カードの微3Dチルト（ホバーで少しだけ傾く） --- */
  document.querySelectorAll(".tilt").forEach(function(card){
    var rX = gsap.quickTo(card, "rotationX", { duration:.5, ease:"power2" });
    var rY = gsap.quickTo(card, "rotationY", { duration:.5, ease:"power2" });
    card.addEventListener("mousemove", function(e){
      var b = card.getBoundingClientRect();
      var px = (e.clientX-b.left)/b.width - .5;
      var py = (e.clientY-b.top)/b.height - .5;
      rX(-py*7); rY(px*7);
    });
    card.addEventListener("mouseleave", function(){ rX(0); rY(0); });
  });
};

})(window.ANOM);
