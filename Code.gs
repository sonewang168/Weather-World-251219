/**
 * 🌍 世界天氣預報 - GAS 中繼站
 * LINE Messaging API（非已停止的 LINE Notify）
 * Token 儲存在 GAS Script Properties
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
<label>預設 User ID</label>
<input type="text" id="lineUserId" value="${cfg.lineUserId}">
<div class="hint">對 Bot 說 /myid 取得，網頁版推送用</div>
</div>
</div>

<div class="card">
<h2>☁️ 圖片上傳（選填）</h2>
<div class="field">
<label>ImgBB API Key</label>
<input type="password" id="imgbbKey" value="${cfg.imgbbKey}">
<div class="hint"><a href="https://api.imgbb.com/" target="_blank">取得</a> - 推送圖片用</div>
</div>
</div>

<button class="btn" onclick="save()">💾 儲存設定</button>
<div class="status" id="status"></div>

<div class="card" style="margin-top:16px">
<h2>📋 Webhook URL（給網頁版用）</h2>
<div class="webhook" id="url" onclick="copy()">載入中...</div>
<div class="hint" style="margin-top:6px">👆 點擊複製</div>
</div>

<div class="info">
<h3>✅ 使用 LINE Messaging API</h3>
<p>
本程式使用 <code>api.line.me/v2/bot/message/push</code><br><br>
⚠️ LINE Notify 已於 2025/3/31 停止服務<br><br>
📋 Webhook 指令：<br>
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
    if (!uid) {
      return ContentService.createTextOutput(JSON.stringify({ ok: false, err: '缺少 User ID' }));
    }
    if (!cfg.lineToken) {
      return ContentService.createTextOutput(JSON.stringify({ ok: false, err: 'GAS 未設定 LINE Token' }));
    }
    
    const now = Utilities.formatDate(new Date(), 'Asia/Taipei', 'yyyy/MM/dd HH:mm:ss');
    push(uid, '🌍 世界天氣預報\n\n✅ LINE 連線成功！\n\n🕐 ' + now, cfg.lineToken);
    return ContentService.createTextOutput(JSON.stringify({ ok: true }));
  }
  
  // 推送天氣
  if (data.action === 'pushWeather') {
    if (!uid) {
      return ContentService.createTextOutput(JSON.stringify({ ok: false, err: '缺少 User ID' }));
    }
    if (!cfg.lineToken) {
      return ContentService.createTextOutput(JSON.stringify({ ok: false, err: 'GAS 未設定 LINE Token' }));
    }
    
    try {
      let imageUrl = data.imageUrl;
      
      // 如果傳來 base64，由 GAS 上傳 ImgBB
      if (data.imageBase64 && cfg.imgbbKey) {
        imageUrl = uploadImgBB(data.imageBase64, cfg.imgbbKey);
      }
      
      const flex = buildWeatherFlex(data.weather, imageUrl);
      pushFlex(uid, flex, cfg.lineToken);
      return ContentService.createTextOutput(JSON.stringify({ ok: true }));
    } catch (err) {
      console.error(err);
      return ContentService.createTextOutput(JSON.stringify({ ok: false, err: err.message }));
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({ ok: true }));
}

// ========== LINE Webhook ==========
function handleLineMsg(ev, cfg) {
  const txt = ev.message.text.trim().toLowerCase();
  const uid = ev.source.userId;
  const token = ev.replyToken;
  
  if (txt === '/myid' || txt === '我的id' || txt === 'myid' || txt === 'id') {
    reply(token, '🆔 你的 User ID：\n\n' + uid + '\n\n📋 請複製到網頁版設定', cfg.lineToken);
    return;
  }
  
  if (txt === '/help' || txt === '說明' || txt === 'help') {
    reply(token, '🌍 世界天氣預報\n\n📝 在網頁版查詢天氣後推送到 LINE\n\n📋 指令：\n• /myid - 取得 User ID\n• /help - 顯示說明', cfg.lineToken);
    return;
  }
}

// ========== 建立天氣 Flex ==========
function buildWeatherFlex(w, imageUrl) {
  const bubble = {
    type: 'bubble',
    size: 'mega',
    header: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: '#4facfe',
      paddingAll: '20px',
      contents: [
        {
          type: 'box',
          layout: 'horizontal',
          alignItems: 'center',
          contents: [
            { type: 'text', text: w.icon || '🌤️', size: 'xxl', flex: 0 },
            {
              type: 'box',
              layout: 'vertical',
              margin: 'lg',
              contents: [
                { type: 'text', text: w.city, size: 'xl', weight: 'bold', color: '#fff' },
                { type: 'text', text: w.country || '', size: 'sm', color: '#ffffffcc' }
              ]
            }
          ]
        },
        { type: 'text', text: w.temp + '°C', size: '3xl', weight: 'bold', color: '#fff', margin: 'lg' },
        { type: 'text', text: w.description, size: 'md', color: '#ffffffcc' }
      ]
    },
    body: {
      type: 'box',
      layout: 'vertical',
      paddingAll: '20px',
      contents: [
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            { type: 'box', layout: 'vertical', flex: 1, contents: [
              { type: 'text', text: '體感', size: 'xs', color: '#8e8e93', align: 'center' },
              { type: 'text', text: w.feels + '°C', size: 'md', weight: 'bold', align: 'center' }
            ]},
            { type: 'box', layout: 'vertical', flex: 1, contents: [
              { type: 'text', text: '濕度', size: 'xs', color: '#8e8e93', align: 'center' },
              { type: 'text', text: w.humidity + '%', size: 'md', weight: 'bold', align: 'center' }
            ]},
            { type: 'box', layout: 'vertical', flex: 1, contents: [
              { type: 'text', text: '風速', size: 'xs', color: '#8e8e93', align: 'center' },
              { type: 'text', text: w.wind + 'm/s', size: 'md', weight: 'bold', align: 'center' }
            ]}
          ]
        },
        { type: 'separator', margin: 'lg' },
        {
          type: 'box',
          layout: 'vertical',
          margin: 'lg',
          contents: [
            { type: 'text', text: '🛰️ ' + (w.satellite && w.satellite.name ? w.satellite.name : '--'), size: 'sm', color: '#4facfe' },
            { type: 'text', text: '📍 ' + (w.lat ? w.lat.toFixed(4) : '--') + '°, ' + (w.lon ? w.lon.toFixed(4) : '--') + '°', size: 'xs', color: '#8e8e93', margin: 'sm' }
          ]
        }
      ]
    },
    footer: {
      type: 'box',
      layout: 'vertical',
      paddingAll: '12px',
      backgroundColor: '#f7f7f7',
      contents: [
        { type: 'text', text: '📡 ' + (w.apiSource || '') + ' | 🕐 ' + w.updateTime, size: 'xs', color: '#8e8e93', align: 'center' }
      ]
    }
  };
  
  if (imageUrl) {
    bubble.hero = {
      type: 'image',
      url: imageUrl,
      size: 'full',
      aspectRatio: '1200:630',
      aspectMode: 'cover'
    };
  }
  
  return {
    type: 'flex',
    altText: (w.icon || '🌤️') + ' ' + w.city + ' ' + w.temp + '°C',
    contents: bubble
  };
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
function reply(token, text, lineToken) {
  UrlFetchApp.fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'post',
    contentType: 'application/json',
    headers: { 'Authorization': 'Bearer ' + lineToken },
    payload: JSON.stringify({ replyToken: token, messages: [{ type: 'text', text: text }] })
  });
}

function push(uid, text, lineToken) {
  UrlFetchApp.fetch('https://api.line.me/v2/bot/message/push', {
    method: 'post',
    contentType: 'application/json',
    headers: { 'Authorization': 'Bearer ' + lineToken },
    payload: JSON.stringify({ to: uid, messages: [{ type: 'text', text: text }] })
  });
}

function pushFlex(uid, flex, lineToken) {
  UrlFetchApp.fetch('https://api.line.me/v2/bot/message/push', {
    method: 'post',
    contentType: 'application/json',
    headers: { 'Authorization': 'Bearer ' + lineToken },
    payload: JSON.stringify({ to: uid, messages: [flex] })
  });
}
