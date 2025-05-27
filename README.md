# Getting Started
此專案是作為 NUK GDG on Campus 的一個範例專案，原專案為 [google-gemini/live-api-web-console](https://github.com/google-gemini/live-api-web-console)。

## 目錄結構

```plaintext
src/
├── components/       # React 元件
│   ├── tools/        # 工具相關元件
│
├── App.tsx           # 主應用程式元件
├── .env              # 環境變數設定
```

## 環境變數設定
在專案根目錄下建立 `.env` 檔案，並加入以下內容：

```plaintext
# create your own API KEY at https://aistudio.google.com/apikey
REACT_APP_GEMINI_API_KEY=''
# create your own GoogleMaps API Key at https://developers.google.com/maps/documentation/javascript/get-api-key
REACT_APP_GOOGLE_MAPS_API_KEY=''
