# 八字算命網站

一個基於網頁的八字算命服務，集成了 Dify AI 工作流來提供個人化的命理分析。

## 功能特點

- 用戶友好的表單界面
- 姓名、出生日期和時辰輸入
- 集成付款流程
- Dify AI 工作流集成
- 響應式設計

## 技術棧

- HTML5
- CSS3
- Vanilla JavaScript
- Dify API

## 環境配置

1. 複製 `.env.example` 為 `.env`
2. 在 `.env` 文件中設置您的 Dify API key：
   ```
   DIFY_API_KEY=your_actual_api_key_here
   DIFY_API_URL=https://pro.aifunbox.com/v1/workflows/run
   ```

## 部署

### Vercel 部署

1. 推送代碼到 GitHub
2. 在 Vercel 中連接 GitHub 倉庫
3. 在 Vercel 環境變量中設置：
   - `DIFY_API_KEY`: 您的 Dify API key
   - `DIFY_API_URL`: https://pro.aifunbox.com/v1/workflows/run
4. 點擊 Deploy

## 使用方法

1. 填寫姓名
2. 選擇出生日期
3. 選擇出生時辰
4. 點擊"接入付款"按鈕
5. 確認付款後獲得八字結果