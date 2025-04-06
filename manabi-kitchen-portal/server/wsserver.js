import { WebSocketServer, WebSocket } from 'ws';
import { log } from './utils/logger.js';

const clients = new Map();

export function setupWebSocketServer(httpServer, path = '/ws') {
  const wss = new WebSocketServer({ 
    server: httpServer,
    path
  });
  
  wss.on('connection', (ws) => {
    const clientId = generateClientId();
    
    const client = {
      ws,
      id: clientId,
      isAlive: true
    };
    clients.set(clientId, client);
    
    log(`WebSocket接続: クライアントID ${clientId}`);
    
    sendToClient(client, {
      type: 'connection_established',
      payload: {
        clientId,
        message: 'WebSocket接続が確立されました'
      }
    });
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
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
    
    ws.on('pong', () => {
      client.isAlive = true;
    });
    
    ws.on('close', () => {
      log(`WebSocket切断: クライアントID ${clientId}`);
      clients.delete(clientId);
    });
    
    ws.on('error', (error) => {
      log(`WebSocketエラー: ${error.message}`);
    });
  });
  
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
  
  wss.on('close', () => {
    clearInterval(interval);
  });
  
  log('WebSocketサーバーが初期化されました');
  
  return {
    wss,
    broadcast: (message) => {
      clients.forEach((client) => {
        sendToClient(client, message);
      });
    },
    sendToUser: (userId, message) => {
      clients.forEach((client) => {
        if (client.userId === userId) {
          sendToClient(client, message);
        }
      });
    }
  };
}

function generateClientId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function sendToClient(client, message) {
  if (client.ws.readyState === WebSocket.OPEN) {
    client.ws.send(JSON.stringify(message));
  }
}

function handleMessage(client, message) {
  log(`メッセージ受信: ${message.type}`);
  
  switch (message.type) {
    case 'authenticate':
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
      sendToClient(client, {
        type: 'pong',
        payload: {
          timestamp: new Date().toISOString()
        }
      });
      break;
      
    default:
      log(`不明なメッセージタイプ: ${message.type}`);
      sendToClient(client, {
        type: 'error',
        payload: {
          message: `不明なメッセージタイプです: ${message.type}`
        }
      });
  }
}
