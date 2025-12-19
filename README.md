# 🌍 世界天氣預報 LINE BOT

Apple Weather 風格天氣應用，4 種 API + 全球城市搜尋 + LINE Flex 推送

## ⚠️ 重要說明

本程式使用 **LINE Messaging API**（非已停止的 LINE Notify）

- ✅ 使用 `api.line.me/v2/bot/message/push` - LINE Messaging API
- ❌ 不使用 `notify-api.line.me` - LINE Notify（已於 2025/3/31 停止服務）

## ✨ 功能

- 🎨 Apple Weather 風格 + 玻璃擬態
- 🌀 「天」字 3D 旋轉開機動畫
- 🔍 城市二合一：快速選擇 + 全球 Geocoding
- 🛰️ 衛星資訊自動判斷
- 🖼️ Canvas 生成精美天氣圖片
- 💬 LINE Flex Message 推送（含圖片）

## 📦 架構

| 檔案 | 功能 |
|------|------|
| **index.html** | 主程式 + 完整認證設定 + 圖片生成 |
| **Code.gs** | GAS 中繼站 + LINE Messaging API |

## 🔐 主程式設定面板（7 區塊）

| # | 認證 | 獨立按鈕 |
|---|------|----------|
| 1 | 🤖 LINE Bot 認證 | |
|   | - GAS 部署 URL | 💾儲存 🗑️清除 |
|   | - Channel Access Token | 💾儲存 🗑️清除 |
|   | - User ID | 💾儲存 🗑️清除 |
|   | - 📤 發送檢測回報到 LINE | 測試按鈕 |
| 2 | 🌐 Open-Meteo | ✅ 免費免Key |
| 3 | 🇹🇼 台灣氣象署 CWA | 💾儲存 🗑️清除 |
| 4 | ⚡ WeatherAPI | 💾儲存 🗑️清除 |
| 5 | 🌤️ OpenWeatherMap | 💾儲存 🗑️清除 |
| 6 | 🖼️ ImgBB 圖床 | 💾儲存 🗑️清除 |

## 📡 4 種天氣 API

| API | 費用 |
|-----|------|
| Open-Meteo | 免費免Key |
| 台灣氣象署 | 免費 |
| WeatherAPI | 100萬/月 |
| OpenWeatherMap | 1000/日 |

## 🛰️ 氣象衛星

| 經度 | 衛星 |
|------|------|
| 120°~150°E | 向日葵9號 |
| 70°~120°E | 風雲四號B |
| -20°~70°E | Meteosat-11 |
| -180°~-100° | GOES-18 |
| -100°~-20° | GOES-16 |

## 🚀 部署

### GAS
1. script.google.com → 新專案
2. 貼上 Code.gs
3. 部署 → 網頁應用程式
4. （選填）在 GAS 設定頁面儲存 LINE Token，讓 Bot 能回覆 /myid 指令

### GitHub Pages
上傳 index.html → Settings → Pages

### LINE Bot
1. LINE Developers → 建立 Messaging API Channel
2. 取得 Channel Access Token
3. Webhook URL 填入 GAS 部署網址
4. 開啟 Use webhook

### 取得 User ID
1. 在 GAS 設定頁面儲存 LINE Token
2. 對 Bot 傳送 `/myid`
3. Bot 會回覆你的 User ID

## 📋 LINE Messaging API 指令

| 指令 | 功能 |
|------|------|
| `/myid` | 取得你的 User ID |
| `/help` | 顯示說明 |
