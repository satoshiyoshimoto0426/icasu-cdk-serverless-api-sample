import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { log } from './utils/logger';

// WebSocketクライアント管理
interface Client {
  ws: WebSocket;
  id: string;
  userId?: number;
  isAlive: boolean;
}

// メッセージの型定義
interface WsMessage {
  type: string;
  payload: any;
}

export function setupWebSocketServer(httpServer: HttpServer, path: string = '/ws') {
  // WebSocketサーバーの作成
  const wss = new WebSocketServer({ 
    server: httpServer,
    path
  });
  
  // クライアント管理
  const clients = new Map<string, Client>();
  
  // 接続イベント
  wss.on('connection', (ws: WebSocket) => {
    // クライアントIDの生成
    const clientId = generateClientId();
    
    // クライアント情報の保存
    const client: Client = {
      ws,
      id: clientId,
      isAlive: true
    };
    clients.set(clientId, client);
    
    log(`WebSocket接続: クライアントID ${clientId}`);
    
    // 接続確認メッセージの送信
    sendToClient(client, {
      type: 'connection_established',
      payload: {
        clientId,
        message: 'WebSocket接続が確立されました'
      }
    });
    
    // メッセージ受信イベント
    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message.toString()) as WsMessage;
        handleMessage(client, data);
      } catch (error) {
        log(`メッセージ解析エラー: ${error instanceof Error ? error.message : String(error)}`);
        sendToClient(client, {
          type: 'error',
          payload: {
            message: 'メッセージの形式が不正です'
          }
        });
      }
    });
    
    // Pingに応答するためのPongイベント
    ws.on('pong', () => {
      client.isAlive = true;
    });
    
    // 切断イベント
    ws.on('close', () => {
      log(`WebSocket切断: クライアントID ${clientId}`);
      clients.delete(clientId);
    });
    
    // エラーイベント
    ws.on('error', (error) => {
      log(`WebSocketエラー: ${error.message}`);
    });
  });
  
  // 定期的なPingの送信（接続維持確認）
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      const client = Array.from(clients.values()).find((c) => c.ws === ws);
      if (!client) return;
      
      if (client.isAlive === false) {
        log(`Ping失敗によるWebSocket切断: クライアントID ${client.id}`);
        clients.delete(client.id);
        return ws.terminate();
      }
      
      client.isAlive = false;
      ws.ping();
    });
  }, 30000);
  
  // サーバーのクローズイベント
  wss.on('close', () => {
    clearInterval(interval);
  });
  
  log('WebSocketサーバーが初期化されました');
  
  return {
    wss,
    broadcast: (message: WsMessage) => {
      clients.forEach((client) => {
        sendToClient(client, message);
      });
    },
    sendToUser: (userId: number, message: WsMessage) => {
      clients.forEach((client) => {
        if (client.userId === userId) {
          sendToClient(client, message);
        }
      });
    }
  };
}

// クライアントIDの生成
function generateClientId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// クライアントへのメッセージ送信
function sendToClient(client: Client, message: WsMessage) {
  if (client.ws.readyState === WebSocket.OPEN) {
    client.ws.send(JSON.stringify(message));
  }
}

// メッセージハンドラー
function handleMessage(client: Client, message: WsMessage) {
  log(`メッセージ受信: ${message.type}`);
  
  switch (message.type) {
    case 'authenticate':
      // ユーザー認証
      if (message.payload && message.payload.userId) {
        client.userId = message.payload.userId;
        log(`クライアント認証: クライアントID ${client.id}, ユーザーID ${client.userId}`);
        sendToClient(client, {
          type: 'authenticated',
          payload: {
            userId: client.userId,
            message: '認証に成功しました'
          }
        });
      }
      break;
      
    case 'ping':
      // Pingメッセージへの応答
      sendToClient(client, {
        type: 'pong',
        payload: {
          timestamp: new Date().toISOString()
        }
      });
      break;
      
    default:
      // 不明なメッセージタイプ
      log(`不明なメッセージタイプ: ${message.type}`);
      sendToClient(client, {
        type: 'error',
        payload: {
          message: `不明なメッセージタイプです: ${message.type}`
        }
      });
  }
}