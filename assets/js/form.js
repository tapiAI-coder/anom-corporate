/* =========================================================
   form.js — お問い合わせフォーム（Web3Forms連携）
   ---------------------------------------------------------
   ■ 仕組み
     送信ボタン → このスクリプトが内容をWeb3Formsに送信
     → 設定したメールアドレスに問い合わせメールが届く。
     サーバーは不要。アクセスキーは assets/js/config.js で設定する。
   ■ スパム対策（2段構え）
     1. ハニーポット: 人間には見えないチェック欄（botcheck）。
        ボットが機械的に入力したら送信を中止する
     2. Web3Forms側のスパムフィルタ
   ■ 安全設計
     ・キー未設定の間は送信せず、メールでの連絡を案内
     ・送信失敗時もメールアドレスを案内（問い合わせを取りこぼさない）
========================================================= */
window.ANOM = window.ANOM || {};

(function(A){
"use strict";

A.initForm = function(){
  var form   = document.getElementById("contactForm");
  if(!form) return;
  var status = document.getElementById("formStatus");
  var btn    = form.querySelector('button[type="submit"]');
  var btnDefault = btn ? btn.innerHTML : "";
  var cfg = window.ANOM_CONFIG || {};

  /* 結果メッセージの表示（ok=緑 / ng=赤）。aria-liveで読み上げにも対応 */
  function show(type, msg){
    status.className = "form-status " + type;
    status.textContent = msg;
  }

  /* JSが動いている時はこのスクリプトが送信を担当するので、
     HTML側のaction属性は使わない（二重送信防止） */
  form.addEventListener("submit", function(e){
    e.preventDefault();

    /* --- ハニーポット判定: 見えない欄が操作されていたらボットとみなす --- */
    var hp = form.querySelector('input[name="botcheck"]');
    if(hp && hp.checked){ return; }

    /* --- キー未設定の間はフォーム送信を行わず案内を出す --- */
    if(!cfg.FORM_ACCESS_KEY){
      show("ng", "フォームは現在準備中です。お手数ですが " + (cfg.CONTACT_EMAIL || "メール") + " 宛に直接ご連絡ください。");
      return;
    }

    /* --- 送信データの組み立て --- */
    var data = new FormData(form);
    data.append("access_key", cfg.FORM_ACCESS_KEY);
    data.append("subject", cfg.FORM_SUBJECT || "サイトからのお問い合わせ");
    data.append("from_name", "ANOM コーポレートサイト");
    data.delete("botcheck"); /* ハニーポット欄は送らない */

    /* --- 送信（送信中はボタンを無効化して二重送信を防ぐ） --- */
    btn.disabled = true;
    btn.textContent = "送信中…";
    status.className = "form-status"; /* 前回の結果表示をリセット */

    fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: data,
      headers: { "Accept": "application/json" }
    })
    .then(function(res){ return res.json(); })
    .then(function(json){
      if(json.success){
        form.reset();
        show("ok", "送信しました。内容を確認のうえ、2営業日以内にご返信します。");
      }else{
        show("ng", "送信に失敗しました。お手数ですが " + (cfg.CONTACT_EMAIL || "メール") + " 宛に直接ご連絡ください。");
      }
    })
    .catch(function(){
      show("ng", "通信エラーが発生しました。お手数ですが " + (cfg.CONTACT_EMAIL || "メール") + " 宛に直接ご連絡ください。");
    })
    .finally(function(){
      btn.disabled = false;
      btn.innerHTML = btnDefault;
    });
  });
};

})(window.ANOM);
