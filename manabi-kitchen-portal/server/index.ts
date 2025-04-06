import express from "express";
import session from "express-session";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import fs from "fs";
import { setupRoutes } from "./routes";
import { setupWebSocketServer } from "./wsserver";

// ES Modulesで__dirnameを取得するための設定
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 環境変数の設定
process.env.MANABI_PASSWORD = process.env.MANABI_PASSWORD || 'manabi2025';

// シンプルなロガー
function log(message: string) {
  console.log(`[server] ${message}`);
}

// サーバー起動関数
async function startServer() {
  try {
    // Expressアプリケーション作成
    const app = express();
    
    // CORS設定
    app.use(cors({ 
      origin: ['http://localhost:3000', 'http://localhost:5000', 'http://0.0.0.0:5000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
      allowedHeaders: '*',
      exposedHeaders: '*',
      maxAge: 86400
    }));
    
    // プリフライトリクエストの明示的な処理
    app.options('*', cors());
    
    // セッション設定
    app.use(session({
      secret: 'manabi-kitchen-secret',
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false }
    }));
    
    // JSONとURLエンコードリクエストの処理
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ extended: true, limit: '50mb' }));
    
    // 静的ファイルを提供
    app.use(express.static('public'));
    
    // テスト用APIエンドポイントの直接登録
    app.get('/api/hello', (req, res) => {
      res.json({
        message: 'Hello from Manabi Kitchen API!',
        version: '1.0.0',
        timestamp: new Date().toISOString()
      });
    });
    
    // HTTPサーバー作成
    const httpServer = createServer(app);
    
    // WebSocketサーバーのセットアップ
    setupWebSocketServer(httpServer);
    log("WebSocketサーバーの設定が完了しました");
    
    // APIルート登録
    await setupRoutes(app);
    log("APIルートの登録が完了しました");
    
    // システムステータスページ
    app.get('/system-status', (req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html lang="ja">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>まなびキッチン - システム状態確認</title>
            <style>
              body {
                font-family: 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 20px;
                background-color: #f5f5f5;
                color: #333;
              }
              .container {
                max-width: 800px;
                margin: 0 auto;
                background-color: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              h1 {
                color: #2563eb;
                border-bottom: 2px solid #e5e7eb;
                padding-bottom: 10px;
              }
              .btn {
                display: inline-block;
                background-color: #2563eb;
                color: white;
                padding: 8px 16px;
                border-radius: 4px;
                text-decoration: none;
                margin-right: 10px;
                margin-bottom: 10px;
              }
              .btn:hover {
                background-color: #1d4ed8;
              }
              .error {
                color: #ef4444;
                background-color: #fee2e2;
                padding: 10px;
                border-radius: 4px;
                margin-bottom: 20px;
              }
              .success {
                color: #10b981;
                background-color: #d1fae5;
                padding: 10px;
                border-radius: 4px;
                margin-bottom: 20px;
              }
              code {
                font-family: monospace;
                background-color: #f1f5f9;
                padding: 2px 4px;
                border-radius: 4px;
              }
              pre {
                background-color: #f1f5f9;
                padding: 10px;
                border-radius: 4px;
                overflow-x: auto;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>まなびキッチン - システム状態確認</h1>
              
              <div class="success">
                サーバーは正常に動作しています
              </div>
              
              <h2>API動作確認</h2>
              <button class="btn" id="testApi">APIをテスト</button>
              <div id="apiResult"></div>
              
              <h2>実際のアプリケーション</h2>
              <p>
                <a href="/" class="btn">メインアプリケーションを表示</a>
              </p>
              
              <h2>利用可能なAPI</h2>
              <div>
                <a href="/api/hello" class="btn" target="_blank">API Hello</a>
                <a href="/api/tasks" class="btn" target="_blank">タスク一覧API</a>
                <a href="/api/account-categories" class="btn" target="_blank">会計カテゴリAPI</a>
                <a href="/api/account-transactions" class="btn" target="_blank">会計取引API</a>
              </div>
              
              <script>
                // API動作テスト
                document.getElementById('testApi').addEventListener('click', async () => {
                  const resultDiv = document.getElementById('apiResult');
                  resultDiv.innerHTML = 'APIリクエスト送信中...';
                  
                  try {
                    const response = await fetch('/api/hello');
                    if (!response.ok) {
                      throw new Error('APIエラー: ' + response.status);
                    }
                    
                    const data = await response.json();
                    
                    const pre = document.createElement('pre');
                    pre.textContent = JSON.stringify(data, null, 2);
                    
                    resultDiv.innerHTML = '<div class="success">API接続成功!</div>';
                    resultDiv.appendChild(pre);
                  } catch (err) {
                    resultDiv.innerHTML = \`<div class="error">API接続エラー: \${err.message}</div>\`;
                    console.error('API Error:', err);
                  }
                });
              </script>
            </div>
          </body>
        </html>
      `);
    });
    
    // フォールバックルート - SPAのルーティング用
    app.get('*', (req, res) => {
      // API呼び出しとシステムステータスページはスキップ
      if (req.path.startsWith('/api/') || req.path === '/system-status') {
        return;
      }
      
      // クライアントサイドのindex.htmlを提供
      const indexPath = path.join(__dirname, '../client/index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        // 開発中はViteのミドルウェアが処理するため、404を返す
        res.status(404).send('Not found');
      }
    });
    
    // サーバー起動
    const port = process.env.PORT || 3000;
    httpServer.listen(Number(port), '0.0.0.0', () => {
      log(`まなびキッチンサーバーが起動しました: http://0.0.0.0:${port}`);
    });
    
    return httpServer;
  } catch (error) {
    log(`起動エラー: ${error instanceof Error ? error.message : String(error)}`);
    console.error(error);
    return null;
  }
}

// エラーハンドリング
process.on('uncaughtException', (err) => {
  log(`未処理の例外: ${err.message}`);
});

process.on('unhandledRejection', (reason) => {
  log(`未処理のPromise拒否: ${String(reason)}`);
});

// サーバー起動
log('まなびキッチンサーバーを起動します...');
startServer();