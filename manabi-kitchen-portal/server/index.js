import express from "express";
import session from "express-session";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import fs from "fs";
import { setupRoutes } from "./routes.js";
import { setupWebSocketServer } from "./wsserver.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.env.MANABI_PASSWORD = process.env.MANABI_PASSWORD || 'manabi2025';

function log(message) {
  console.log(`[server] ${message}`);
}

async function startServer() {
  try {
    const app = express();
    
    app.use(cors({ 
      origin: ['http://localhost:3000', 'http://localhost:5173', 'http://0.0.0.0:5173'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
      allowedHeaders: '*',
      exposedHeaders: '*',
      maxAge: 86400
    }));
    
    app.options('*', cors());
    
    app.use(session({
      secret: 'manabi-kitchen-secret',
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false }
    }));
    
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ extended: true, limit: '50mb' }));
    
    app.use(express.static('public'));
    
    app.get('/api/hello', (req, res) => {
      res.json({
        message: 'Hello from Manabi Kitchen API!',
        version: '1.0.0',
        timestamp: new Date().toISOString()
      });
    });
    
    const httpServer = createServer(app);
    
    setupWebSocketServer(httpServer);
    log("WebSocketサーバーの設定が完了しました");
    
    await setupRoutes(app);
    log("APIルートの登録が完了しました");
    
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
                <a href="/api/meeting-minutes" class="btn" target="_blank">議事録API</a>
              </div>
              
              <script>
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
                    resultDiv.innerHTML = '<div class="error">API接続エラー: ' + err.message + '</div>';
                    console.error('API Error:', err);
                  }
                });
              </script>
            </div>
          </body>
        </html>
      `);
    });
    
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api/') || req.path === '/system-status') {
        return;
      }
      
      const indexPath = path.join(__dirname, '../client/dist/index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Not found');
      }
    });
    
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

process.on('uncaughtException', (err) => {
  log(`未処理の例外: ${err.message}`);
});

process.on('unhandledRejection', (reason) => {
  log(`未処理のPromise拒否: ${String(reason)}`);
});

log('まなびキッチンサーバーを起動します...');
startServer();
