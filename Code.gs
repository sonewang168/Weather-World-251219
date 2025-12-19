/**
 * 🌍 世界天氣預報 - GAS 中繼站
 * AI 生圖 + 城市地標（內建 + 搜尋）二合一
 * LINE Messaging API 推送
 */

// ========== AI 模型設定 ==========
const MODELS = {
  'qwen-image': { name: 'Qwen-Image', icon: '🧠', api: 'together', model: 'Qwen/Qwen-Image', desc: '通義千問中文強' },
  'ideogram': { name: 'Ideogram v2', icon: '💡', api: 'ideogram', desc: '最佳中文字' },
  'flux-pro': { name: 'FLUX 1.1 Pro', icon: '👑', api: 'replicate', model: 'black-forest-labs/flux-1.1-pro', desc: '高品質' },
  'flux-schnell': { name: 'FLUX Schnell', icon: '⚡', api: 'replicate', model: 'black-forest-labs/flux-schnell', desc: '極速' },
  'flux-free': { name: 'FLUX Free', icon: '🆓', api: 'together', model: 'black-forest-labs/FLUX.1-schnell-Free', desc: '免費' },
  'recraft': { name: 'Recraft V3', icon: '✨', api: 'replicate', model: 'recraft-ai/recraft-v3', desc: '向量設計風' },
};

// ========== 內建城市地標資料庫 ==========
const CITY_DB = {
  // 台灣
  '台北': { en: 'Taipei', landmarks: '台北101, 中正紀念堂, 西門町, 龍山寺', food: '小籠包, 牛肉麵, 珍珠奶茶', style: 'modern metropolis' },
  '台北市': { en: 'Taipei', landmarks: '台北101, 中正紀念堂, 西門町, 龍山寺', food: '小籠包, 牛肉麵, 珍珠奶茶', style: 'modern metropolis' },
  'Taipei': { en: 'Taipei', landmarks: 'Taipei 101, CKS Memorial Hall, Ximending', food: 'xiaolongbao, beef noodles, bubble tea', style: 'modern metropolis' },
  '高雄': { en: 'Kaohsiung', landmarks: '85大樓, 駁二藝術特區, 蓮池潭, 旗津', food: '海鮮, 木瓜牛奶', style: 'harbor city' },
  '高雄市': { en: 'Kaohsiung', landmarks: '85大樓, 駁二藝術特區, 蓮池潭, 旗津', food: '海鮮, 木瓜牛奶', style: 'harbor city' },
  'Kaohsiung': { en: 'Kaohsiung', landmarks: '85 Sky Tower, Pier-2, Lotus Pond, Cijin', food: 'seafood, papaya milk', style: 'harbor city' },
  '台中': { en: 'Taichung', landmarks: '台中歌劇院, 彩虹眷村, 高美濕地, 逢甲夜市', food: '太陽餅, 珍珠奶茶', style: 'creative city' },
  '台中市': { en: 'Taichung', landmarks: '台中歌劇院, 彩虹眷村, 高美濕地, 逢甲夜市', food: '太陽餅, 珍珠奶茶', style: 'creative city' },
  '台南': { en: 'Tainan', landmarks: '赤崁樓, 安平古堡, 神農街, 孔廟', food: '棺材板, 擔仔麵, 牛肉湯', style: 'historic ancient city' },
  '台南市': { en: 'Tainan', landmarks: '赤崁樓, 安平古堡, 神農街, 孔廟', food: '棺材板, 擔仔麵, 牛肉湯', style: 'historic ancient city' },
  '花蓮': { en: 'Hualien', landmarks: '太魯閣, 七星潭, 清水斷崖, 東大門夜市', food: '扁食, 公正包子, 炸彈蔥油餅', style: 'mountain ocean paradise' },
  '花蓮市': { en: 'Hualien', landmarks: '太魯閣, 七星潭, 清水斷崖, 東大門夜市', food: '扁食, 公正包子', style: 'mountain ocean paradise' },
  '新北': { en: 'New Taipei', landmarks: '九份老街, 十分瀑布, 淡水老街, 野柳', food: '芋圓, 阿給, 鐵蛋', style: 'diverse attractions' },
  '新北市': { en: 'New Taipei', landmarks: '九份老街, 十分瀑布, 淡水老街, 野柳', food: '芋圓, 阿給, 鐵蛋', style: 'diverse attractions' },
  '桃園': { en: 'Taoyuan', landmarks: '大溪老街, 石門水庫, 拉拉山, 桃園機場', food: '豆干, 花生糖', style: 'gateway city' },
  '桃園市': { en: 'Taoyuan', landmarks: '大溪老街, 石門水庫, 拉拉山, 桃園機場', food: '豆干, 花生糖', style: 'gateway city' },
  '新竹': { en: 'Hsinchu', landmarks: '城隍廟, 內灣老街, 南寮漁港, 科學園區', food: '貢丸, 米粉, 肉圓', style: 'tech science city' },
  '新竹市': { en: 'Hsinchu', landmarks: '城隍廟, 內灣老街, 南寮漁港, 科學園區', food: '貢丸, 米粉, 肉圓', style: 'tech science city' },
  '嘉義': { en: 'Chiayi', landmarks: '阿里山, 檜意森活村, 文化路夜市', food: '雞肉飯, 方塊酥, 砂鍋魚頭', style: 'alishan gateway' },
  '嘉義市': { en: 'Chiayi', landmarks: '阿里山, 檜意森活村, 文化路夜市', food: '雞肉飯, 方塊酥', style: 'alishan gateway' },
  '屏東': { en: 'Pingtung', landmarks: '墾丁, 恆春古城, 海生館, 大鵬灣', food: '萬巒豬腳, 綠豆蒜', style: 'tropical paradise' },
  '屏東縣': { en: 'Pingtung', landmarks: '墾丁, 恆春古城, 海生館, 大鵬灣', food: '萬巒豬腳, 綠豆蒜', style: 'tropical paradise' },
  '宜蘭': { en: 'Yilan', landmarks: '礁溪溫泉, 羅東夜市, 太平山, 蘭陽博物館', food: '蔥油餅, 鴨賞, 牛舌餅', style: 'hot spring countryside' },
  '宜蘭縣': { en: 'Yilan', landmarks: '礁溪溫泉, 羅東夜市, 太平山, 蘭陽博物館', food: '蔥油餅, 鴨賞', style: 'hot spring countryside' },
  '南投': { en: 'Nantou', landmarks: '日月潭, 清境農場, 合歡山, 溪頭', food: '紹興酒蛋, 竹筒飯', style: 'mountain lake scenery' },
  '南投縣': { en: 'Nantou', landmarks: '日月潭, 清境農場, 合歡山, 溪頭', food: '紹興酒蛋, 竹筒飯', style: 'mountain lake scenery' },
  '台東': { en: 'Taitung', landmarks: '三仙台, 鹿野高台, 知本溫泉, 蘭嶼', food: '米苔目, 釋迦', style: 'east coast paradise' },
  '台東縣': { en: 'Taitung', landmarks: '三仙台, 鹿野高台, 知本溫泉, 蘭嶼', food: '米苔目, 釋迦', style: 'east coast paradise' },
  '澎湖': { en: 'Penghu', landmarks: '雙心石滬, 天后宮, 跨海大橋, 藍洞', food: '仙人掌冰, 海鮮', style: 'island archipelago' },
  '澎湖縣': { en: 'Penghu', landmarks: '雙心石滬, 天后宮, 跨海大橋, 藍洞', food: '仙人掌冰, 海鮮', style: 'island archipelago' },
  '金門': { en: 'Kinmen', landmarks: '莒光樓, 翟山坑道, 古寧頭, 水頭聚落', food: '貢糖, 高粱酒, 廣東粥', style: 'historic military island' },
  '金門縣': { en: 'Kinmen', landmarks: '莒光樓, 翟山坑道, 古寧頭, 水頭聚落', food: '貢糖, 高粱酒', style: 'historic military island' },
  '馬祖': { en: 'Matsu', landmarks: '北海坑道, 芹壁聚落, 藍眼淚, 媽祖巨神像', food: '繼光餅, 老酒麵線', style: 'blue tears island' },
  
  // 國際城市
  'Tokyo': { en: 'Tokyo', landmarks: 'Tokyo Tower, Shibuya Crossing, Senso-ji Temple, Skytree', food: 'sushi, ramen, tempura', style: 'neon metropolis' },
  '東京': { en: 'Tokyo', landmarks: '東京鐵塔, 淺草寺, 涉谷十字路口, 晴空塔', food: '壽司, 拉麵, 天婦羅', style: 'neon metropolis' },
  'Osaka': { en: 'Osaka', landmarks: 'Osaka Castle, Dotonbori, Tsutenkaku, Universal Studios', food: 'takoyaki, okonomiyaki', style: 'foodie entertainment city' },
  '大阪': { en: 'Osaka', landmarks: '大阪城, 道頓堀, 通天閣', food: '章魚燒, 大阪燒', style: 'foodie entertainment city' },
  'Kyoto': { en: 'Kyoto', landmarks: 'Kinkaku-ji, Fushimi Inari, Arashiyama, Gion', food: 'kaiseki, matcha', style: 'ancient imperial capital' },
  '京都': { en: 'Kyoto', landmarks: '金閣寺, 伏見稻荷, 嵐山, 祇園', food: '懷石料理, 抹茶', style: 'ancient imperial capital' },
  'Seoul': { en: 'Seoul', landmarks: 'Gyeongbokgung, N Seoul Tower, Myeongdong, Bukchon', food: 'Korean BBQ, bibimbap, kimchi', style: 'K-pop modern capital' },
  '首爾': { en: 'Seoul', landmarks: '景福宮, 南山塔, 明洞, 北村韓屋', food: '韓式烤肉, 拌飯, 泡菜', style: 'K-pop modern capital' },
  'Hong Kong': { en: 'Hong Kong', landmarks: 'Victoria Peak, Victoria Harbour, Temple Street, Big Buddha', food: 'dim sum, egg tart, milk tea', style: 'harbor skyscraper city' },
  '香港': { en: 'Hong Kong', landmarks: '太平山, 維多利亞港, 廟街, 天壇大佛', food: '港式點心, 蛋塔, 奶茶', style: 'harbor skyscraper city' },
  'Singapore': { en: 'Singapore', landmarks: 'Marina Bay Sands, Merlion, Gardens by the Bay, Sentosa', food: 'chili crab, laksa, chicken rice', style: 'futuristic garden city' },
  '新加坡': { en: 'Singapore', landmarks: '濱海灣金沙, 魚尾獅, 濱海灣花園', food: '辣椒螃蟹, 叻沙, 海南雞飯', style: 'futuristic garden city' },
  'Bangkok': { en: 'Bangkok', landmarks: 'Grand Palace, Wat Arun, Chatuchak Market, Khao San Road', food: 'pad thai, tom yum, mango sticky rice', style: 'golden temple city' },
  '曼谷': { en: 'Bangkok', landmarks: '大皇宮, 黎明寺, 恰圖恰市集', food: '泰式炒河粉, 冬蔭功', style: 'golden temple city' },
  'New York': { en: 'New York', landmarks: 'Statue of Liberty, Times Square, Central Park, Empire State', food: 'pizza, bagel, hot dog', style: 'iconic skyline metropolis' },
  '紐約': { en: 'New York', landmarks: '自由女神, 時代廣場, 中央公園, 帝國大廈', food: '披薩, 貝果, 熱狗', style: 'iconic skyline metropolis' },
  'London': { en: 'London', landmarks: 'Big Ben, Tower Bridge, London Eye, Buckingham Palace', food: 'fish and chips, afternoon tea', style: 'royal historic capital' },
  '倫敦': { en: 'London', landmarks: '大笨鐘, 倫敦塔橋, 倫敦眼, 白金漢宮', food: '炸魚薯條, 下午茶', style: 'royal historic capital' },
  'Paris': { en: 'Paris', landmarks: 'Eiffel Tower, Louvre, Arc de Triomphe, Notre-Dame', food: 'croissant, macaron, wine', style: 'romantic art capital' },
  '巴黎': { en: 'Paris', landmarks: '艾菲爾鐵塔, 羅浮宮, 凱旋門, 聖母院', food: '可頌, 馬卡龍, 紅酒', style: 'romantic art capital' },
  'Sydney': { en: 'Sydney', landmarks: 'Opera House, Harbour Bridge, Bondi Beach, Darling Harbour', food: 'meat pie, barramundi', style: 'harbor opera city' },
  '雪梨': { en: 'Sydney', landmarks: '雪梨歌劇院, 港灣大橋, 邦代海灘', food: '肉派, 澳洲鱸魚', style: 'harbor opera city' },
  'Dubai': { en: 'Dubai', landmarks: 'Burj Khalifa, Palm Jumeirah, Dubai Mall, Burj Al Arab', food: 'shawarma, hummus, dates', style: 'luxury desert oasis' },
  '杜拜': { en: 'Dubai', landmarks: '哈里發塔, 棕櫚島, 杜拜購物中心', food: '沙威瑪, 鷹嘴豆泥', style: 'luxury desert oasis' },
};

// ========== 設定管理 ==========
function getConfig() {
  const p = PropertiesService.getScriptProperties();
  return {
    lineToken: p.getProperty('lineToken') || '',
    lineUserId: p.getProperty('lineUserId') || '',
    imgbbKey: p.getProperty('imgbbKey') || '',
    ideogramKey: p.getProperty('ideogramKey') || '',
    repToken: p.getProperty('repToken') || '',
    togetherKey: p.getProperty('togetherKey') || '',
    serpApiKey: p.getProperty('serpApiKey') || '',
    defaultModel: p.getProperty('defaultModel') || 'qwen-image',
  };
}

function saveConfig(c) {
  if (!c.lineToken) return { ok: false, err: 'LINE Token 必填' };
  if (!c.imgbbKey) return { ok: false, err: 'ImgBB Key 必填' };
  if (!c.ideogramKey && !c.repToken && !c.togetherKey) {
    return { ok: false, err: '請至少設定一個 AI API' };
  }
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
<title>🌍 天氣預報 AI 生圖</title>
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
.rec{color:#30d158;font-size:10px}
input,select{width:100%;padding:10px;background:#2c2c2e;border:1px solid #3a3a3c;border-radius:8px;color:#fff;font-size:14px}
input:focus,select:focus{outline:none;border-color:#0a84ff}
.hint{font-size:10px;color:#636366;margin-top:4px}
.hint a{color:#0a84ff}
.btn{width:100%;padding:14px;background:#06c755;border:none;border-radius:10px;color:#fff;font-size:16px;font-weight:600;cursor:pointer}
.btn:disabled{opacity:0.5}
.status{text-align:center;padding:10px;border-radius:8px;margin-top:12px;font-size:13px;display:none}
.status.show{display:block}
.status.ok{background:rgba(48,209,88,0.2);color:#30d158}
.status.err{background:rgba(255,55,95,0.2);color:#ff375f}
.webhook{background:#2c2c2e;padding:10px;border-radius:8px;font-size:11px;color:#64d2ff;word-break:break-all;cursor:pointer;margin-top:8px}
.models{display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin-top:12px}
.model{background:#2c2c2e;padding:8px;border-radius:6px;font-size:11px}
.model b{color:#64d2ff}
</style>
</head><body>
<div class="container">
<h1>🌍 世界天氣預報 AI 生圖</h1>

<div class="card">
<h2>🔐 LINE Bot 認證</h2>
<div class="field">
<label>Channel Access Token <span class="req">*必填</span></label>
<input type="password" id="lineToken" value="${cfg.lineToken}">
<div class="hint"><a href="https://developers.line.biz/" target="_blank">LINE Developers</a> → Messaging API</div>
</div>
<div class="field">
<label>預設 User ID <span class="req">*必填</span></label>
<input type="text" id="lineUserId" value="${cfg.lineUserId}">
<div class="hint">對 Bot 說 /myid 取得</div>
</div>
</div>

<div class="card">
<h2>🤖 AI 生圖 API（至少填一個）</h2>
<div class="field">
<label>Ideogram API Key <span class="rec">⭐推薦</span></label>
<input type="password" id="ideogramKey" value="${cfg.ideogramKey}">
<div class="hint"><a href="https://ideogram.ai/api" target="_blank">取得</a> - 最佳中文字</div>
</div>
<div class="field">
<label>Replicate Token</label>
<input type="password" id="repToken" value="${cfg.repToken}">
<div class="hint"><a href="https://replicate.com/account/api-tokens" target="_blank">取得</a> - FLUX Pro / Schnell / Recraft</div>
</div>
<div class="field">
<label>Together AI Key</label>
<input type="password" id="togetherKey" value="${cfg.togetherKey}">
<div class="hint"><a href="https://api.together.xyz/" target="_blank">取得</a> - 免費 FLUX</div>
</div>
<div class="field">
<label>預設模型</label>
<select id="defaultModel">
<option value="qwen-image" ${cfg.defaultModel==='qwen-image'?'selected':''}>🧠 Qwen-Image（通義千問中文強）</option>
<option value="ideogram" ${cfg.defaultModel==='ideogram'?'selected':''}>💡 Ideogram v2（中文字最佳）</option>
<option value="flux-pro" ${cfg.defaultModel==='flux-pro'?'selected':''}>👑 FLUX 1.1 Pro（高品質）</option>
<option value="flux-schnell" ${cfg.defaultModel==='flux-schnell'?'selected':''}>⚡ FLUX Schnell（快速）</option>
<option value="flux-free" ${cfg.defaultModel==='flux-free'?'selected':''}>🆓 FLUX Free（免費）</option>
<option value="recraft" ${cfg.defaultModel==='recraft'?'selected':''}>✨ Recraft V3（向量風）</option>
</select>
</div>
</div>

<div class="card">
<h2>☁️ 圖片上傳 & 搜尋</h2>
<div class="field">
<label>ImgBB Key <span class="req">*必填</span></label>
<input type="password" id="imgbbKey" value="${cfg.imgbbKey}">
<div class="hint"><a href="https://api.imgbb.com/" target="_blank">取得</a> - 免費圖床</div>
</div>
<div class="field">
<label>SerpAPI Key（選填，搜尋城市地標）</label>
<input type="password" id="serpApiKey" value="${cfg.serpApiKey}">
<div class="hint"><a href="https://serpapi.com/" target="_blank">取得</a> - 自動搜尋未知城市地標</div>
</div>
</div>

<button class="btn" onclick="save()">💾 儲存設定</button>
<div class="status" id="status"></div>

<div class="card" style="margin-top:16px">
<h2>📋 Webhook URL</h2>
<div class="webhook" id="url" onclick="copy()">載入中...</div>
<div class="hint" style="margin-top:6px">👆 點擊複製，貼到網頁版 GAS URL</div>
</div>

<div class="card">
<h2>🎨 AI 模型說明</h2>
<div class="models">
<div class="model"><b>🧠 qwen-image</b> 通義千問中文強</div>
<div class="model"><b>💡 ideogram</b> 中文字最佳</div>
<div class="model"><b>👑 flux-pro</b> 高品質細節</div>
<div class="model"><b>⚡ flux-schnell</b> 極速生成</div>
<div class="model"><b>🆓 flux-free</b> 免費額度</div>
<div class="model"><b>✨ recraft</b> 向量設計風</div>
</div>
</div>

<div class="card">
<h2>📋 LINE Bot 指令</h2>
<div class="hint" style="font-size:12px;line-height:1.8">
/myid - 取得 User ID<br>
/help - 顯示說明<br>
/model 名稱 - 切換模型<br>
/models - 模型列表
</div>
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
    imgbbKey:document.getElementById('imgbbKey').value.trim(),
    ideogramKey:document.getElementById('ideogramKey').value.trim(),
    repToken:document.getElementById('repToken').value.trim(),
    togetherKey:document.getElementById('togetherKey').value.trim(),
    serpApiKey:document.getElementById('serpApiKey').value.trim(),
    defaultModel:document.getElementById('defaultModel').value
  });
}
</script>
</body></html>`).setTitle('GAS 設定');
}

// ========== 接收請求 ==========
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    if (data.action) {
      return handleWebRequest(data);
    }
    
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
  
  if (data.action === 'testConnection') {
    if (!uid) return ContentService.createTextOutput('NO_USER_ID');
    if (!cfg.lineToken) return ContentService.createTextOutput('NO_TOKEN');
    push(uid, '🌍 世界天氣預報 AI 生圖\n\n✅ LINE 連線成功！\n\n🎨 天氣圖片將以 3D 等軸視角呈現', cfg.lineToken);
    return ContentService.createTextOutput('OK');
  }
  
  if (data.action === 'pushWeather') {
    if (!uid) return ContentService.createTextOutput('NO_USER_ID');
    if (!cfg.lineToken) return ContentService.createTextOutput('NO_TOKEN');
    
    try {
      const w = data.weather;
      const modelId = data.model || cfg.defaultModel || 'ideogram';
      
      // 先回覆生成中
      push(uid, `🎨 AI 生成天氣圖中...\n\n🏙️ ${w.city}\n🌡️ ${w.temp}°C ${w.description}\n🤖 ${MODELS[modelId]?.icon || '🎨'} ${MODELS[modelId]?.name || modelId}\n\n⏳ 完成後推送給您`, cfg.lineToken);
      
      // 取得城市資訊（內建 + 搜尋 二合一）
      const cityInfo = getCityInfo(w.city, cfg.serpApiKey);
      
      // 組合 Prompt
      const prompt = buildWeatherPrompt(w, cityInfo);
      console.log('Prompt:', prompt);
      
      // AI 生圖
      const imgUrl = generateImage(prompt, modelId, cfg);
      console.log('AI 圖片:', imgUrl);
      
      // 上傳 ImgBB
      const pubUrl = uploadImgBB(imgUrl, cfg.imgbbKey);
      console.log('ImgBB:', pubUrl);
      
      // 推送結果
      const time = Utilities.formatDate(new Date(), 'Asia/Taipei', 'MM/dd HH:mm');
      const sat = w.satellite || {};
      const text = `✅ ${w.city} 天氣圖生成完成！

━━━━━━ 🌡️ 天氣資訊 ━━━━━━
🌡️ 溫度：${w.temp}°C
🤒 體感：${w.feels}°C
💧 濕度：${w.humidity}%
💨 風速：${w.wind} m/s
👁️ 能見度：${w.visibility || '--'}
☁️ 雲量：${w.clouds != null ? w.clouds + '%' : '--'}
📝 天氣：${w.description}
${w.sunrise ? '🌅 日出：' + w.sunrise : ''}
${w.sunset ? '🌇 日落：' + w.sunset : ''}

━━━━━━ 🏙️ 城市特色 ━━━━━━
🏛️ ${cityInfo.landmarks || ''}
🍜 ${cityInfo.food || ''}

━━━━━━ 🛰️ 衛星資訊 ━━━━━━
📡 衛星：${sat.name || '氣象衛星'}
🏢 機構：${sat.op || '--'}
📍 位置：${sat.pos || '--'}
🌐 軌道：${sat.type || '--'}
🧭 經緯：${w.lat?.toFixed(4) || '--'}°, ${w.lon?.toFixed(4) || '--'}°

━━━━━━━━━━━━━━━━━━━━
🤖 ${MODELS[modelId]?.icon || ''} ${MODELS[modelId]?.name || modelId}
📊 ${w.apiSource || 'Weather API'}
🕐 ${time}`;

      pushWithImage(uid, pubUrl, text, cfg.lineToken);
      return ContentService.createTextOutput('OK');
      
    } catch (err) {
      console.error(err);
      push(uid, '❌ 生成失敗\n' + err.message + '\n\n💡 請檢查 API Key 或更換模型', cfg.lineToken);
      return ContentService.createTextOutput('ERROR:' + err.message);
    }
  }
  
  // 只生成圖片（網頁版預覽用，不推送 LINE）
  if (data.action === 'generateImage') {
    try {
      const w = data.weather;
      const modelId = data.model || cfg.defaultModel || 'qwen-image';
      
      // 取得城市資訊
      const cityInfo = getCityInfo(w.city, cfg.serpApiKey);
      
      // 組合 Prompt
      const prompt = buildWeatherPrompt(w, cityInfo);
      console.log('generateImage Prompt:', prompt);
      
      // AI 生圖
      const imgUrl = generateImage(prompt, modelId, cfg);
      console.log('AI 圖片:', imgUrl);
      
      // 上傳 ImgBB
      const pubUrl = uploadImgBB(imgUrl, cfg.imgbbKey);
      console.log('ImgBB:', pubUrl);
      
      // 返回 JSON
      return ContentService.createTextOutput(JSON.stringify({
        ok: true,
        imageUrl: pubUrl,
        model: MODELS[modelId]?.name || modelId,
        cityInfo: cityInfo
      })).setMimeType(ContentService.MimeType.JSON);
      
    } catch (err) {
      console.error(err);
      return ContentService.createTextOutput(JSON.stringify({
        ok: false,
        err: err.message
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  // 推送已有的圖片到 LINE（不重新生成）
  if (data.action === 'pushExistingImage') {
    if (!uid) return ContentService.createTextOutput('NO_USER_ID');
    if (!cfg.lineToken) return ContentService.createTextOutput('NO_TOKEN');
    
    try {
      const w = data.weather;
      const imgUrl = data.imageUrl;
      const time = Utilities.formatDate(new Date(), 'Asia/Taipei', 'MM/dd HH:mm');
      const sat = w.satellite || {};
      
      const text = `🌍 ${w.city} 天氣預報

━━━━━━ 🌡️ 天氣資訊 ━━━━━━
🌡️ 溫度：${w.temp}°C
🤒 體感：${w.feels}°C
💧 濕度：${w.humidity}%
💨 風速：${w.wind} m/s
👁️ 能見度：${w.visibility || '--'}
☁️ 雲量：${w.clouds != null ? w.clouds + '%' : '--'}
📝 天氣：${w.description}
${w.sunrise ? '🌅 日出：' + w.sunrise : ''}
${w.sunset ? '🌇 日落：' + w.sunset : ''}

━━━━━━ 🛰️ 衛星資訊 ━━━━━━
📡 衛星：${sat.name || '氣象衛星'}
🏢 機構：${sat.op || '--'}
📍 位置：${sat.pos || '--'}
🌐 軌道：${sat.type || '--'}
🧭 經緯：${w.lat?.toFixed(4) || '--'}°, ${w.lon?.toFixed(4) || '--'}°

━━━━━━━━━━━━━━━━━━━━
📊 ${w.apiSource || 'Weather API'}
🕐 ${time}`;

      pushWithImage(uid, imgUrl, text, cfg.lineToken);
      return ContentService.createTextOutput('OK');
      
    } catch (err) {
      console.error(err);
      return ContentService.createTextOutput('ERROR:' + err.message);
    }
  }
  
  return ContentService.createTextOutput('OK');
}

// ========== 城市資訊（內建 + 搜尋 二合一）==========
function getCityInfo(cityName, serpApiKey) {
  // 1. 先查內建資料庫
  if (CITY_DB[cityName]) {
    console.log('內建資料庫找到:', cityName);
    return CITY_DB[cityName];
  }
  
  // 2. 沒有的話用搜尋 API
  if (serpApiKey) {
    console.log('搜尋城市地標:', cityName);
    try {
      return searchCityInfo(cityName, serpApiKey);
    } catch (e) {
      console.error('搜尋失敗:', e.message);
    }
  }
  
  // 3. 都沒有就用通用描述
  return {
    en: cityName,
    landmarks: 'city center, main street, landmark buildings',
    food: 'local cuisine',
    style: 'urban cityscape'
  };
}

function searchCityInfo(cityName, serpApiKey) {
  // 使用 Google Maps API 搜尋景點
  const landmarkRes = UrlFetchApp.fetch(
    `https://serpapi.com/search.json?engine=google_maps&q=${encodeURIComponent(cityName + ' 景點 tourist attractions')}&api_key=${serpApiKey}&hl=zh-TW`,
    { muteHttpExceptions: true }
  );
  const landmarkData = JSON.parse(landmarkRes.getContentText());
  
  // 搜尋美食餐廳
  const foodRes = UrlFetchApp.fetch(
    `https://serpapi.com/search.json?engine=google_maps&q=${encodeURIComponent(cityName + ' 美食 famous food')}&api_key=${serpApiKey}&hl=zh-TW`,
    { muteHttpExceptions: true }
  );
  const foodData = JSON.parse(foodRes.getContentText());
  
  // 解析景點結果
  let landmarks = [];
  if (landmarkData.local_results) {
    landmarks = landmarkData.local_results.slice(0, 5).map(r => r.title);
  } else if (landmarkData.place_results) {
    landmarks = [landmarkData.place_results.title];
  }
  
  // 解析美食結果
  let foods = [];
  if (foodData.local_results) {
    foods = foodData.local_results.slice(0, 4).map(r => r.title);
  }
  
  console.log('Google Maps 搜尋結果 - 景點:', landmarks.join(', '));
  console.log('Google Maps 搜尋結果 - 美食:', foods.join(', '));
  
  return {
    en: cityName,
    landmarks: landmarks.join(', ') || 'city landmarks',
    food: foods.join(', ') || 'local cuisine',
    style: 'cityscape'
  };
}

// ========== 組合天氣圖 Prompt ==========
function buildWeatherPrompt(w, cityInfo) {
  // 天氣狀態對應視覺元素
  const weatherStyle = getWeatherStyle(w.description);
  
  return `3D isometric cyberpunk weather infographic illustration for ${cityInfo.en || w.city},
temperature ${w.temp}°C, ${w.description}, ${weatherStyle.effects},
featuring famous landmarks: ${cityInfo.landmarks},
local food stalls showing: ${cityInfo.food},
${cityInfo.style || 'modern city'},
two satellites on top corners sending holographic signals to center weather panel,
the weather panel displays: city name "${w.city}", date, temperature "${w.temp}°C", weather icon,
neon blue and purple cyberpunk color scheme,
glowing circuit board pattern background,
${weatherStyle.sky},
high detail, professional infographic style,
--no text errors, --no watermark`;
}

function getWeatherStyle(description) {
  const desc = (description || '').toLowerCase();
  
  if (desc.includes('rain') || desc.includes('雨') || desc.includes('drizzle')) {
    return { effects: 'rain drops falling, wet reflections', sky: 'dark cloudy sky with rain' };
  }
  if (desc.includes('snow') || desc.includes('雪')) {
    return { effects: 'snowflakes falling, white frost', sky: 'grey winter sky with snow' };
  }
  if (desc.includes('cloud') || desc.includes('雲') || desc.includes('陰')) {
    return { effects: 'fluffy clouds floating', sky: 'partly cloudy sky' };
  }
  if (desc.includes('thunder') || desc.includes('雷')) {
    return { effects: 'lightning bolts, storm clouds', sky: 'dramatic stormy sky with lightning' };
  }
  if (desc.includes('fog') || desc.includes('霧')) {
    return { effects: 'misty fog, soft glow', sky: 'foggy mysterious atmosphere' };
  }
  if (desc.includes('clear') || desc.includes('晴') || desc.includes('sunny')) {
    return { effects: 'sun rays, lens flare', sky: 'clear blue sky with bright sun' };
  }
  
  return { effects: 'atmospheric lighting', sky: 'beautiful sky' };
}

// ========== AI 生圖 API ==========
function generateImage(prompt, modelId, cfg) {
  const m = MODELS[modelId] || MODELS['ideogram'];
  const size = { w: 1024, h: 768 }; // 4:3 橫幅
  
  switch (m.api) {
    case 'ideogram':
      if (!cfg.ideogramKey) throw new Error('未設定 Ideogram Key');
      return apiIdeogram(prompt, cfg.ideogramKey);
    case 'replicate':
      if (!cfg.repToken) throw new Error('未設定 Replicate Token');
      return apiReplicate(prompt, size, cfg.repToken, m);
    case 'together':
      if (!cfg.togetherKey) throw new Error('未設定 Together Key');
      return apiTogether(prompt, size, cfg.togetherKey, m.model);
    default:
      throw new Error('不支援的模型: ' + modelId);
  }
}

function apiIdeogram(prompt, key) {
  const res = UrlFetchApp.fetch('https://api.ideogram.ai/generate', {
    method: 'post',
    contentType: 'application/json',
    headers: { 'Api-Key': key },
    payload: JSON.stringify({
      image_request: {
        prompt: prompt,
        aspect_ratio: 'ASPECT_16_9',
        model: 'V_2',
        magic_prompt_option: 'AUTO'
      }
    }),
    muteHttpExceptions: true
  });
  const data = JSON.parse(res.getContentText());
  if (data.data && data.data[0]) return data.data[0].url;
  throw new Error('Ideogram: ' + (data.error?.message || JSON.stringify(data)));
}

function apiReplicate(prompt, size, token, modelInfo) {
  const modelPath = modelInfo.model;
  const res = UrlFetchApp.fetch('https://api.replicate.com/v1/models/' + modelPath + '/predictions', {
    method: 'post',
    contentType: 'application/json',
    headers: { 'Authorization': 'Bearer ' + token },
    payload: JSON.stringify({
      input: {
        prompt: prompt,
        width: size.w,
        height: size.h,
        num_outputs: 1
      }
    }),
    muteHttpExceptions: true
  });
  let r = JSON.parse(res.getContentText());
  if (r.error) throw new Error('Replicate: ' + r.error);
  
  // 等待完成
  for (let i = 0; i < 60 && r.status !== 'succeeded' && r.status !== 'failed'; i++) {
    Utilities.sleep(2000);
    r = JSON.parse(UrlFetchApp.fetch('https://api.replicate.com/v1/predictions/' + r.id, {
      headers: { 'Authorization': 'Bearer ' + token }
    }).getContentText());
  }
  if (r.status === 'failed') throw new Error('Replicate 生成失敗: ' + (r.error || ''));
  return Array.isArray(r.output) ? r.output[0] : r.output;
}

function apiTogether(prompt, size, key, modelName) {
  const res = UrlFetchApp.fetch('https://api.together.xyz/v1/images/generations', {
    method: 'post',
    contentType: 'application/json',
    headers: { 'Authorization': 'Bearer ' + key },
    payload: JSON.stringify({
      model: modelName || 'black-forest-labs/FLUX.1-schnell-Free',
      prompt: prompt,
      width: size.w,
      height: size.h,
      steps: modelName === 'Qwen/Qwen-Image' ? 28 : 4,
      n: 1
    }),
    muteHttpExceptions: true
  });
  const data = JSON.parse(res.getContentText());
  if (data.data && data.data[0]) {
    return data.data[0].url || 'data:image/png;base64,' + data.data[0].b64_json;
  }
  throw new Error('Together: ' + (data.error?.message || JSON.stringify(data)));
}

// ========== ImgBB 上傳 ==========
function uploadImgBB(imgUrl, key) {
  let b64;
  if (imgUrl.startsWith('data:')) {
    b64 = imgUrl.split(',')[1];
  } else {
    b64 = Utilities.base64Encode(UrlFetchApp.fetch(imgUrl).getBlob().getBytes());
  }
  
  const res = UrlFetchApp.fetch('https://api.imgbb.com/1/upload', {
    method: 'post',
    payload: { key: key, image: b64 },
    muteHttpExceptions: true
  });
  const data = JSON.parse(res.getContentText());
  if (data.success) return data.data.url;
  throw new Error('ImgBB: ' + (data.error?.message || '上傳失敗'));
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
    reply(token, cfg.lineToken, `🌍 世界天氣預報 AI 生圖

📝 使用方式：
在網頁版查詢天氣 → 推送到 LINE
將自動生成 3D 等軸視角城市天氣圖！

⚙️ 指令：
/myid - 取得 User ID
/models - 模型列表
/model 名稱 - 切換模型
/help - 說明`);
    return;
  }
  
  if (txt === '/models' || txt === '模型') {
    reply(token, cfg.lineToken, `🤖 可用 AI 模型

🧠 qwen-image - 通義千問中文強 ⭐
💡 ideogram - 中文字最佳
👑 flux-pro - 高品質細節
⚡ flux-schnell - 極速生成
🆓 flux-free - Together 免費
✨ recraft - 向量設計風

切換：/model 名稱
例如：/model qwen-image`);
    return;
  }
  
  if (txt.startsWith('/model ')) {
    const modelName = txt.replace('/model ', '').trim();
    if (MODELS[modelName]) {
      setPref(uid, 'model', modelName);
      const m = MODELS[modelName];
      reply(token, cfg.lineToken, `✅ 已切換模型\n\n${m.icon} ${m.name}\n${m.desc}`);
    } else {
      reply(token, cfg.lineToken, '❌ 找不到模型: ' + modelName + '\n\n輸入 /models 查看可用模型');
    }
    return;
  }
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

// ========== 偏好設定 ==========
function getPref(uid, key) {
  return PropertiesService.getScriptProperties().getProperty(key + '_' + uid);
}

function setPref(uid, key, val) {
  PropertiesService.getScriptProperties().setProperty(key + '_' + uid, val);
}
