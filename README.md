# 🌍 世界天氣預報 LINE BOT + AI 生圖

Apple Weather 風格天氣應用 + 3D 等軸視角 AI 天氣圖生成

## ⚠️ 重要說明

- ✅ 使用 **LINE Messaging API**（非已停止的 LINE Notify）
- ✅ 支援多種 **AI 生圖模型**（Ideogram、FLUX、Recraft 等）
- ✅ **內建城市地標資料庫** + **搜尋 API** 二合一

## ✨ 功能

- 🎨 Apple Weather 風格 + 玻璃擬態 UI
- 🌀 「天」字 3D 旋轉開機動畫
- 🔍 城市搜尋：快速選擇 + 全球 Geocoding
- 🛰️ 衛星資訊自動判斷
- 🎨 **AI 生成 3D 等軸視角天氣圖**
- 🏙️ **城市地標 + 美食** 自動加入圖片
- 💬 LINE 推送

## 🤖 支援 AI 模型

| 模型 | 特色 | API |
|------|------|-----|
| 💡 **Ideogram v2** | 中文字最佳 ⭐推薦 | Ideogram |
| 👑 **FLUX 1.1 Pro** | 高品質細節 | Replicate |
| ⚡ **FLUX Schnell** | 極速生成 | Replicate |
| 🧠 **Qwen/Together** | 免費額度 | Together AI |
| ✨ **Recraft V3** | 向量設計風 | Replicate |

## 📦 架構

| 檔案 | 功能 |
|------|------|
| **index.html** | 主程式 + 天氣查詢 + 本地圖片預覽 |
| **Code.gs** | GAS 中繼站 + AI 生圖 + LINE 推送 |

## 🚀 部署

### 1️⃣ GAS 部署
1. script.google.com → 新專案
2. 貼上 Code.gs
3. 部署 → 網頁應用程式 → 任何人
4. 開啟部署網址設定 API Keys

### 2️⃣ GAS 設定頁面填入
```
├── LINE Channel Access Token *必填
├── 預設 User ID *必填
├── ImgBB API Key *必填
├── AI 生圖 API（至少一個）
│   ├── Ideogram Key（推薦）
│   ├── Replicate Token
│   └── Together Key
└── SerpAPI Key（選填，搜尋未知城市）
```

### 3️⃣ 網頁版設定
```
├── GAS 部署 URL
└── User ID
```

### 4️⃣ LINE Developers 設定
- Webhook URL = GAS 部署網址
- Use webhook = 開啟

## 🎨 3D 天氣圖生成流程

```
網頁查詢天氣 → 點「AI 生圖推送」
                    ↓
GAS 收到天氣資料
                    ↓
查詢城市地標（內建資料庫 or 搜尋 API）
                    ↓
組合 Prompt（城市 + 地標 + 美食 + 天氣）
                    ↓
呼叫 AI 生圖 API（Ideogram/FLUX/Recraft）
                    ↓
上傳 ImgBB 取得公開網址
                    ↓
推送 LINE（圖片 + 文字）
```

## 🏙️ 內建城市資料庫

台灣：台北、高雄、台中、台南、花蓮、新北、桃園、新竹、嘉義、屏東、宜蘭、南投、台東、澎湖、金門、馬祖

國際：東京、大阪、京都、首爾、香港、新加坡、曼谷、紐約、倫敦、巴黎、雪梨、杜拜...

**未在資料庫的城市**：自動用 SerpAPI 搜尋地標（需設定 SerpAPI Key）

## 📋 LINE Bot 指令

| 指令 | 功能 |
|------|------|
| `/myid` | 取得 User ID |
| `/help` | 顯示說明 |
| `/models` | 模型列表 |
| `/model 名稱` | 切換模型 |

## 🔗 API 申請連結

- [LINE Developers](https://developers.line.biz/) - Messaging API
- [ImgBB](https://api.imgbb.com/) - 免費圖床
- [Ideogram](https://ideogram.ai/api) - AI 生圖（推薦）
- [Replicate](https://replicate.com/account/api-tokens) - FLUX/Recraft
- [Together AI](https://api.together.xyz/) - 免費 FLUX
- [SerpAPI](https://serpapi.com/) - 搜尋 API（選填）

## 作者

Sone Wang
