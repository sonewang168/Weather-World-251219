/**
 * 🌍 世界天氣預報 - GAS 中繼站
 * LINE Messaging API（非已停止的 LINE Notify）
 * 參考繁中生圖成功架構
 */

// ========== 設定管理 ==========
function getConfig() {
  const p = PropertiesService.getScriptProperties();
  return {
    lineToken: p.getProperty('lineToken') || '',
    lineUserId: p.getProperty('lineUserId') || '',
    imgbbKey: p.getProperty('imgbbKey') || ''
  };
}

function saveConfig(c) {
  if (!c.lineToken) return { ok: false, err: 'LINE Token 必填' };
  PropertiesService.getScriptProperties().setProperties(c);
  return { ok: true };
}

function getUrl() { return ScriptApp.getService().getUrl(); }

// ========== 設定頁面 ==========
function doGet() {
  const cfg = getConfig();
  return HtmlService.createHtmlOutput(`<!DOCTYPE html>
<html><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>🌍 天氣預報 GAS 設定</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,sans-serif;background:#0a0a0a;color:#fff;padding:20px}
.container{max-width:500px;margin:0 auto}
h1{text-align:center;font-size:20px;margin-bottom:20px;color:#64d2ff}
.card{background:#1c1c1e;border-radius:12px;padding:16px;margin-bottom:12px}
.card h2{font-size:13px;color:#8e8e93;margin-bottom:12px}
.field{margin-bottom:12px}
label{display:block;font-size:12px;color:#8e8e93;margin-bottom:4px}
.req{color:#ff375f;font-size:10px}
input{width:100%;padding:10px;background:#2c2c2e;border:1px solid #3a3a3c;border-radius:8px;color:#fff;font-size:14px}
input:focus{outline:none;border-color:#0a84ff}
.hint{font-size:10px;color:#636366;margin-top:4px}
.hint a{color:#0a84ff}
.btn{width:100%;padding:14px;background:#06c755;border:none;border-radius:10px;color:#fff;font-size:16px;font-weight:600;cursor:pointer}
.btn:disabled{opacity:0.5}
.status{text-align:center;padding:10px;border-radius:8px;margin-top:12px;font-size:13px;display:none}
.status.show{display:block}
.status.ok{background:rgba(48,209,88,0.2);color:#30d158}
.status.err{background:rgba(255,55,95,0.2);color:#ff375f}
.webhook{background:#2c2c2e;padding:10px;border-radius:8px;font-size:11px;color:#64d2ff;word-break:break-all;cursor:pointer;margin-top:8px}
.info{background:#1c1c1e;border-radius:12px;padding:16px;margin-top:16px;border:1px solid #30d158}
.info h3{font-size:13px;color:#30d158;margin-bottom:8px}
.info p{font-size:11px;color:#8e8e93;line-height:1.6}
.info code{background:#2c2c2e;padding:2px 6px;border-radius:4px;font-size:10px}
</style>
</head><body>
<div class="container">
<h1>🌍 世界天氣預報 GAS</h1>

<div class="card">
<h2>🔐 LINE Bot 認證</h2>
<div class="field">
<label>Channel Access Token <span class="req">*必填</span></label>
<input type="password" id="lineToken" value="${cfg.lineToken}">
<div class="hint"><a href="https://developers.line.biz/" target="_blank">LINE Developers</a> → Messaging API → Channel access token</div>
</div>
<div class="field">
<label>預設 User ID <span class="req">*必填</span></label>
<input type="text" id="lineUserId" value="${cfg.lineUserId}">
<div class="hint">對 Bot 說 /myid 取得</div>
</div>
</div>

<div class="card">
<h2>☁️ 圖片上傳</h2>
<div class="field">
<label>ImgBB API Key <span class="req">*推送圖片必填</span></label>
<input type="password" id="imgbbKey" value="${cfg.imgbbKey}">
<div class="hint"><a href="https://api.imgbb.com/" target="_blank">取得</a> - 免費圖床</div>
</div>
</div>

<button class="btn" onclick="save()">💾 儲存設定</button>
<div class="status" id="status"></div>

<div class="card" style="margin-top:16px">
<h2>📋 Webhook URL</h2>
<div class="webhook" id="url" onclick="copy()">載入中...</div>
<div class="hint" style="margin-top:6px">👆 點擊複製，貼到網頁版 GAS URL 欄位</div>
</div>

<div class="info">
<h3>📋 LINE Bot 指令</h3>
<p>
• <code>/myid</code> - 取得 User ID<br>
• <code>/help</code> - 顯示說明
</p>
</div>
</div>

<script>
google.script.run.withSuccessHandler(u=>document.getElementById('url').textContent=u).getUrl();
function copy(){
  const u=document.getElementById('url');
  navigator.clipboard.writeText(u.textContent);
  u.textContent='✅ 已複製';
  setTimeout(()=>google.script.run.withSuccessHandler(x=>u.textContent=x).getUrl(),1500);
}
function save(){
  const btn=document.querySelector('.btn'),st=document.getElementById('status');
  btn.disabled=true;btn.textContent='儲存中...';
  google.script.run.withSuccessHandler(r=>{
    btn.disabled=false;
    btn.textContent=r.ok?'✅ 已儲存':'💾 儲存設定';
    st.textContent=r.ok?'設定完成！':'❌ '+r.err;
    st.className='status show '+(r.ok?'ok':'err');
    if(r.ok)setTimeout(()=>btn.textContent='💾 儲存設定',2000);
  }).saveConfig({
    lineToken:document.getElementById('lineToken').value.trim(),
    lineUserId:document.getElementById('lineUserId').value.trim(),
    imgbbKey:document.getElementById('imgbbKey').value.trim()
  });
}
</script>
</body></html>`).setTitle('GAS 設定');
}

// ========== 接收請求 ==========
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // 網頁版請求
    if (data.action) {
      return handleWebRequest(data);
    }
    
    // LINE Webhook
    const cfg = getConfig();
    if (cfg.lineToken) {
      for (const ev of data.events) {
        if (ev.type === 'message' && ev.message.type === 'text') {
          handleLineMsg(ev, cfg);
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
  return ContentService.createTextOutput('OK');
}

// ========== 處理網頁請求 ==========
function handleWebRequest(data) {
  const cfg = getConfig();
  const uid = data.userId || cfg.lineUserId;
  
  // 測試連線
  if (data.action === 'testConnection') {
    if (!uid) return ContentService.createTextOutput('NO_USER_ID');
    if (!cfg.lineToken) return ContentService.createTextOutput('NO_TOKEN');
    
    push(uid, '🌍 世界天氣預報\n\n✅ LINE 連線成功！', cfg.lineToken);
    return ContentService.createTextOutput('OK');
  }
  
  // 推送天氣
  if (data.action === 'pushWeather') {
    if (!uid) return ContentService.createTextOutput('NO_USER_ID');
    if (!cfg.lineToken) return ContentService.createTextOutput('NO_TOKEN');
    
    try {
      const w = data.weather;
      const time = Utilities.formatDate(new Date(), 'Asia/Taipei', 'MM/dd HH:mm');
      
      // 組合文字訊息
      const text = `${w.icon || '🌤️'} ${w.city} 天氣預報

🌡️ 溫度：${w.temp}°C
🤒 體感：${w.feels}°C
💧 濕度：${w.humidity}%
💨 風速：${w.wind} m/s
☁️ 雲量：${w.clouds}%

📝 ${w.description}

🛰️ ${w.satellite && w.satellite.name ? w.satellite.name : '--'}
📍 ${w.lat ? w.lat.toFixed(4) : '--'}°, ${w.lon ? w.lon.toFixed(4) : '--'}°
📡 ${w.apiSource || ''}
🕐 ${time}`;

      // 如果有圖片，上傳 ImgBB 後發送
      if (data.imageBase64 && cfg.imgbbKey) {
        const imgUrl = uploadImgBB(data.imageBase64, cfg.imgbbKey);
        pushWithImage(uid, imgUrl, text, cfg.lineToken);
      } else {
        // 純文字
        push(uid, text, cfg.lineToken);
      }
      
      return ContentService.createTextOutput('OK');
    } catch (err) {
      console.error(err);
      return ContentService.createTextOutput('ERROR:' + err.message);
    }
  }
  
  return ContentService.createTextOutput('OK');
}

// ========== LINE Webhook ==========
function handleLineMsg(ev, cfg) {
  const txt = ev.message.text.trim().toLowerCase();
  const uid = ev.source.userId;
  const token = ev.replyToken;
  
  if (txt === '/myid' || txt === '我的id' || txt === 'myid' || txt === 'id') {
    reply(token, cfg.lineToken, '🆔 你的 User ID：\n\n' + uid + '\n\n📋 請複製到 GAS 設定頁面');
    return;
  }
  
  if (txt === '/help' || txt === '說明' || txt === 'help') {
    reply(token, cfg.lineToken, '🌍 世界天氣預報\n\n📝 在網頁版查詢天氣後推送到 LINE\n\n📋 指令：\n• /myid - 取得 User ID\n• /help - 顯示說明');
    return;
  }
}

// ========== ImgBB 上傳 ==========
function uploadImgBB(base64, key) {
  const imgData = base64.replace(/^data:image\/\w+;base64,/, '');
  const res = UrlFetchApp.fetch('https://api.imgbb.com/1/upload', {
    method: 'post',
    payload: { key: key, image: imgData },
    muteHttpExceptions: true
  });
  const data = JSON.parse(res.getContentText());
  if (data.success) return data.data.url;
  throw new Error('ImgBB 上傳失敗');
}

// ========== LINE API ==========
function reply(token, lineToken, text) {
  UrlFetchApp.fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'post',
    contentType: 'application/json',
    headers: { 'Authorization': 'Bearer ' + lineToken },
    payload: JSON.stringify({ replyToken: token, messages: [{ type: 'text', text }] })
  });
}

function push(uid, text, lineToken) {
  UrlFetchApp.fetch('https://api.line.me/v2/bot/message/push', {
    method: 'post',
    contentType: 'application/json',
    headers: { 'Authorization': 'Bearer ' + lineToken },
    payload: JSON.stringify({ to: uid, messages: [{ type: 'text', text }] })
  });
}

function pushWithImage(uid, imgUrl, text, lineToken) {
  UrlFetchApp.fetch('https://api.line.me/v2/bot/message/push', {
    method: 'post',
    contentType: 'application/json',
    headers: { 'Authorization': 'Bearer ' + lineToken },
    payload: JSON.stringify({
      to: uid,
      messages: [
        { type: 'image', originalContentUrl: imgUrl, previewImageUrl: imgUrl },
        { type: 'text', text: text }
      ]
    })
  });
}
