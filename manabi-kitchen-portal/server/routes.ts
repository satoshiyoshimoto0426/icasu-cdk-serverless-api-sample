import type { Express } from "express";
import multer from "multer";
import * as path from "path";
import * as fs from "fs";
import { log } from "./utils/logger";

// ストレージサービス（モック）
const storage = {
  // タスク関連
  getTasksByUserId: async (userId: number) => {
    return [
      {
        id: 1,
        user_id: userId,
        title: "議事録作成",
        description: "5月の営業会議の議事録を作成する",
        due_date: new Date("2023-05-15"),
        priority: "high",
        status: "pending",
        created_at: new Date("2023-05-01"),
        updated_at: new Date("2023-05-01")
      },
      {
        id: 2,
        user_id: userId,
        title: "資料準備",
        description: "新規プロジェクトの提案資料を準備する",
        due_date: new Date("2023-05-20"),
        priority: "medium",
        status: "in_progress",
        created_at: new Date("2023-05-05"),
        updated_at: new Date("2023-05-10")
      },
      {
        id: 3,
        user_id: userId,
        title: "クライアントミーティング",
        description: "ABCクライアントとの定例ミーティング",
        due_date: new Date("2023-05-12"),
        priority: "high",
        status: "completed",
        created_at: new Date("2023-05-02"),
        updated_at: new Date("2023-05-12")
      }
    ];
  },
  
  // 会計カテゴリー関連
  getAllAccountCategories: async () => {
    return [
      {
        id: 1,
        name: "売上",
        type: "income",
        parent_id: null,
        description: "事業からの売上",
        created_at: new Date("2023-01-01"),
        updated_at: new Date("2023-01-01")
      },
      {
        id: 2,
        name: "コンサルティング",
        type: "income",
        parent_id: 1,
        description: "コンサルティングサービスからの売上",
        created_at: new Date("2023-01-01"),
        updated_at: new Date("2023-01-01")
      },
      {
        id: 3,
        name: "研修",
        type: "income",
        parent_id: 1,
        description: "研修サービスからの売上",
        created_at: new Date("2023-01-01"),
        updated_at: new Date("2023-01-01")
      },
      {
        id: 4,
        name: "経費",
        type: "expense",
        parent_id: null,
        description: "事業運営に関わる経費",
        created_at: new Date("2023-01-01"),
        updated_at: new Date("2023-01-01")
      },
      {
        id: 5,
        name: "オフィス賃料",
        type: "expense",
        parent_id: 4,
        description: "オフィスの賃料",
        created_at: new Date("2023-01-01"),
        updated_at: new Date("2023-01-01")
      },
      {
        id: 6,
        name: "通信費",
        type: "expense",
        parent_id: 4,
        description: "インターネット、電話などの通信費",
        created_at: new Date("2023-01-01"),
        updated_at: new Date("2023-01-01")
      }
    ];
  },
  
  // 会計取引関連
  getAllAccountTransactions: async () => {
    return [
      {
        id: 1,
        transaction_date: new Date("2023-04-15"),
        amount: 150000,
        description: "コンサルティング料",
        type: "income",
        category_id: 2,
        payment_method: "銀行振込",
        created_at: new Date("2023-04-15"),
        updated_at: new Date("2023-04-15")
      },
      {
        id: 2,
        transaction_date: new Date("2023-04-20"),
        amount: 200000,
        description: "研修サービス",
        type: "income",
        category_id: 3,
        payment_method: "銀行振込",
        created_at: new Date("2023-04-20"),
        updated_at: new Date("2023-04-20")
      },
      {
        id: 3,
        transaction_date: new Date("2023-04-25"),
        amount: 80000,
        description: "オフィス賃料 4月分",
        type: "expense",
        category_id: 5,
        payment_method: "口座引き落とし",
        created_at: new Date("2023-04-25"),
        updated_at: new Date("2023-04-25")
      },
      {
        id: 4,
        transaction_date: new Date("2023-04-28"),
        amount: 12000,
        description: "インターネット・電話料金",
        type: "expense",
        category_id: 6,
        payment_method: "クレジットカード",
        created_at: new Date("2023-04-28"),
        updated_at: new Date("2023-04-28")
      }
    ];
  },
  
  // 議事録関連
  getMeetingMinutesByUserId: async (userId: number) => {
    return [
      {
        id: 1,
        user_id: userId,
        title: "営業チームミーティング",
        meeting_date: new Date("2023-04-10"),
        description: "4月の営業目標と戦略について",
        participants: [
          { name: "田中太郎", role: "営業部長" },
          { name: "佐藤花子", role: "営業担当" },
          { name: "鈴木一郎", role: "マーケティング担当" }
        ],
        status: "published",
        created_at: new Date("2023-04-10"),
        updated_at: new Date("2023-04-11")
      },
      {
        id: 2,
        user_id: userId,
        title: "プロジェクト進捗会議",
        meeting_date: new Date("2023-04-15"),
        description: "新規プロジェクトの進捗確認",
        participants: [
          { name: "山田健太", role: "プロジェクトマネージャー" },
          { name: "伊藤美咲", role: "開発リーダー" },
          { name: "高橋誠", role: "クライアント担当" }
        ],
        status: "draft",
        created_at: new Date("2023-04-15"),
        updated_at: new Date("2023-04-15")
      }
    ];
  }
};

// ファイルアップロードの設定
const setupMulter = () => {
  const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
  
  // アップロードディレクトリが存在しない場合は作成
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  // Multerストレージの設定
  const uploadStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
      // ファイル名が重複しないように、タイムスタンプを追加
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    },
  });

  // Multerのアップロード設定
  return multer({ 
    storage: uploadStorage,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB制限
    }
  });
};

export async function setupRoutes(app: Express): Promise<void> {
  const upload = setupMulter();

  // テスト用APIエンドポイント
  app.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello from Manabi Kitchen API!' });
  });
  
  // タスク関連API
  app.get('/api/tasks', async (req, res) => {
    try {
      // すべてのユーザーのタスクを返す（単純化した実装）
      const userId = 1; // デフォルトユーザーID
      const tasks = await storage.getTasksByUserId(userId);
      res.json(tasks);
    } catch (error) {
      log(`Error retrieving tasks: ${error instanceof Error ? error.message : String(error)}`, 3);
      res.status(500).json({
        message: 'タスクの取得中にエラーが発生しました',
        error: error instanceof Error ? error.message : '不明なエラー'
      });
    }
  });
  
  // 会計カテゴリー関連API
  app.get('/api/account-categories', async (req, res) => {
    try {
      const categories = await storage.getAllAccountCategories();
      res.json(categories);
    } catch (error) {
      log(`Error retrieving account categories: ${error instanceof Error ? error.message : String(error)}`, 3);
      res.status(500).json({
        message: '会計カテゴリーの取得中にエラーが発生しました',
        error: error instanceof Error ? error.message : '不明なエラー'
      });
    }
  });
  
  // 会計取引関連API
  app.get('/api/account-transactions', async (req, res) => {
    try {
      const transactions = await storage.getAllAccountTransactions();
      res.json(transactions);
    } catch (error) {
      log(`Error retrieving account transactions: ${error instanceof Error ? error.message : String(error)}`, 3);
      res.status(500).json({
        message: '会計取引の取得中にエラーが発生しました',
        error: error instanceof Error ? error.message : '不明なエラー'
      });
    }
  });
  
  // 議事録関連API
  app.get('/api/meeting-minutes', async (req, res) => {
    try {
      // すべてのユーザーの議事録を返す（単純化した実装）
      const userId = 1; // デフォルトユーザーID
      const minutes = await storage.getMeetingMinutesByUserId(userId);
      res.json(minutes);
    } catch (error) {
      log(`Error retrieving meeting minutes: ${error instanceof Error ? error.message : String(error)}`, 3);
      res.status(500).json({
        message: '議事録の取得中にエラーが発生しました',
        error: error instanceof Error ? error.message : '不明なエラー'
      });
    }
  });
  
  // 音声文字起こしAPI
  app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: '音声ファイルが提供されていません'
        });
      }
      
      // 実際には音声認識APIを使用するが、ここではモックデータを返す
      setTimeout(() => {
        res.json({
          message: '文字起こし完了',
          data: { 
            text: "これはモックの文字起こし結果です。実際のAPIでは音声内容を文字に変換します。会議の内容として、今月の売上目標は前月比10%増の1,100万円です。新規顧客獲得のためのキャンペーンを来週から開始する予定です。" 
          }
        });
      }, 2000); // 2秒の遅延を模擬
      
    } catch (error) {
      log(`Transcription error: ${error instanceof Error ? error.message : String(error)}`, 3);
      res.status(500).json({
        message: '文字起こし処理中にエラーが発生しました',
        error: error instanceof Error ? error.message : '不明なエラー'
      });
    }
  });
  
  // AIチャットボットAPI
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, conversation_id } = req.body;
      
      if (!message) {
        return res.status(400).json({
          message: 'メッセージが提供されていません'
        });
      }
      
      // 実際にはAI APIを使用するが、ここではモックデータを返す
      setTimeout(() => {
        res.json({
          message: 'チャット応答完了',
          data: { 
            response: `これはモックの応答です。実際のAPIでは「${message}」に対する適切な回答を生成します。まなびキッチンのAIアシスタントをご利用いただきありがとうございます。`,
            conversation_id: conversation_id || 'new_' + Date.now()
          }
        });
      }, 1000); // 1秒の遅延を模擬
      
    } catch (error) {
      log(`Chat API error: ${error instanceof Error ? error.message : String(error)}`, 3);
      res.status(500).json({
        message: 'チャット処理中にエラーが発生しました',
        error: error instanceof Error ? error.message : '不明なエラー'
      });
    }
  });
  
  app.post('/api/chatbot', async (req, res) => {
    try {
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({
          message: 'メッセージが提供されていません'
        });
      }
      
      // 実際にはAI APIを使用するが、ここではモックデータを返す
      setTimeout(() => {
        res.json({
          response: `これはモックの応答です。実際のAPIでは「${message}」に対する適切な回答を生成します。まなびキッチンのAIアシスタントをご利用いただきありがとうございます。`
        });
      }, 1000); // 1秒の遅延を模擬
      
    } catch (error) {
      log(`Chatbot API error: ${error instanceof Error ? error.message : String(error)}`, 3);
      res.status(500).json({
        message: 'チャットボット処理中にエラーが発生しました',
        error: error instanceof Error ? error.message : '不明なエラー'
      });
    }
  });
  
  log("APIルートの登録が完了しました");
}
