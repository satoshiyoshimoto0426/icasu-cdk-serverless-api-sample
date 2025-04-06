import multer from "multer";
import * as path from "path";
import * as fs from "fs";
import { setupRegistrationRoutes } from "./routes/registration.js";

function log(message, level = 1) {
  const timestamp = new Date().toISOString();
  let prefix = '[INFO]';
  
  if (level === 2) {
    prefix = '[WARN]';
  } else if (level === 3) {
    prefix = '[ERROR]';
  }
  
  console.log(`${timestamp} ${prefix} ${message}`);
}

const storage = {
  getTasksByUserId: async (userId) => {
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
  
  getMeetingMinutesByUserId: async (userId) => {
    return [
      {
        id: 1,
        user_id: userId,
        title: "営業チームミーティング",
        date: new Date("2023-04-10"),
        participants: "田中太郎, 佐藤花子, 鈴木一郎",
        content: "4月の営業目標と戦略について議論しました。新規顧客獲得のためのキャンペーンを来週から開始する予定です。",
        created_at: new Date("2023-04-10"),
        updated_at: new Date("2023-04-11")
      },
      {
        id: 2,
        user_id: userId,
        title: "プロジェクト進捗会議",
        date: new Date("2023-04-15"),
        participants: "山田健太, 伊藤美咲, 高橋誠",
        content: "新規プロジェクトの進捗確認を行いました。開発は予定通り進んでおり、来月のリリースに向けて準備中です。",
        created_at: new Date("2023-04-15"),
        updated_at: new Date("2023-04-15")
      }
    ];
  }
};

const setupMulter = () => {
  const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
  
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  const uploadStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    },
  });

  return multer({ 
    storage: uploadStorage,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB制限
    }
  });
};

export async function setupRoutes(app) {
  const upload = setupMulter();

  app.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello from Manabi Kitchen API!' });
  });
  
  app.get('/api/tasks', async (req, res) => {
    try {
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
  
  app.post('/api/account-transactions', async (req, res) => {
    try {
      const { date, amount, description, category_id, type } = req.body;
      
      if (!date || !amount || !description || !category_id) {
        return res.status(400).json({
          message: '必須項目が不足しています'
        });
      }
      
      const newTransaction = {
        id: Math.floor(Math.random() * 1000) + 10,
        transaction_date: new Date(date),
        amount: Number(amount),
        description,
        type: type || 'expense',
        category_id: Number(category_id),
        payment_method: req.body.payment_method || '現金',
        created_at: new Date(),
        updated_at: new Date()
      };
      
      res.status(201).json(newTransaction);
    } catch (error) {
      log(`Error creating account transaction: ${error instanceof Error ? error.message : String(error)}`, 3);
      res.status(500).json({
        message: '会計取引の登録中にエラーが発生しました',
        error: error instanceof Error ? error.message : '不明なエラー'
      });
    }
  });
  
  app.get('/api/meeting-minutes', async (req, res) => {
    try {
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
  
  app.post('/api/meeting-minutes', async (req, res) => {
    try {
      const { date, title, participants, content } = req.body;
      
      if (!date || !title || !participants || !content) {
        return res.status(400).json({
          message: '必須項目が不足しています'
        });
      }
      
      const newMinute = {
        id: Math.floor(Math.random() * 1000) + 10,
        user_id: 1,
        title,
        date: new Date(date),
        participants,
        content,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      res.status(201).json(newMinute);
    } catch (error) {
      log(`Error creating meeting minute: ${error instanceof Error ? error.message : String(error)}`, 3);
      res.status(500).json({
        message: '議事録の登録中にエラーが発生しました',
        error: error instanceof Error ? error.message : '不明なエラー'
      });
    }
  });
  
  app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: '音声ファイルが提供されていません'
        });
      }
      
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
  
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, conversation_id } = req.body;
      
      if (!message) {
        return res.status(400).json({
          message: 'メッセージが提供されていません'
        });
      }
      
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
  
  app.get('/api/users', async (req, res) => {
    try {
      const users = [
        {
          id: "user1",
          name: "田中太郎",
          email: "tanaka@example.com",
          role: "管理者",
          registeredAt: "2024-01-15T09:30:00Z",
          lastLogin: "2025-04-05T14:22:10Z",
          status: "active"
        },
        {
          id: "user2",
          name: "佐藤花子",
          email: "sato@example.com",
          role: "スタッフ",
          registeredAt: "2024-02-20T11:15:00Z",
          lastLogin: "2025-04-04T09:45:30Z",
          status: "active"
        },
        {
          id: "user3",
          name: "鈴木一郎",
          email: "suzuki@example.com",
          role: "講師",
          registeredAt: "2024-03-10T14:00:00Z",
          lastLogin: "2025-04-01T16:20:15Z",
          status: "active"
        },
        {
          id: "user4",
          name: "高橋誠",
          email: "takahashi@example.com",
          role: "スタッフ",
          registeredAt: "2024-01-25T10:45:00Z",
          lastLogin: "2025-03-28T11:30:45Z",
          status: "inactive"
        },
        {
          id: "user5",
          name: "伊藤美咲",
          email: "ito@example.com",
          role: "講師",
          registeredAt: "2024-04-05T09:00:00Z",
          lastLogin: "2025-04-05T10:15:20Z",
          status: "active"
        },
        {
          id: "user6",
          name: "渡辺健太",
          email: "watanabe@example.com",
          role: "ボランティア",
          registeredAt: "2024-03-15T13:30:00Z",
          lastLogin: "2025-03-20T15:40:10Z",
          status: "inactive"
        },
        {
          id: "user7",
          name: "山田直樹",
          email: "yamada@example.com",
          role: "スタッフ",
          registeredAt: "2024-02-10T08:45:00Z",
          lastLogin: "2025-04-03T12:10:05Z",
          status: "active"
        },
        {
          id: "user8",
          name: "中村優子",
          email: "nakamura@example.com",
          role: "講師",
          registeredAt: "2024-01-30T15:20:00Z",
          lastLogin: "2025-04-02T09:25:30Z",
          status: "active"
        },
        {
          id: "user9",
          name: "小林健",
          email: "kobayashi@example.com",
          role: "ボランティア",
          registeredAt: "2024-04-01T11:00:00Z",
          lastLogin: null,
          status: "pending"
        },
        {
          id: "user10",
          name: "加藤裕子",
          email: "kato@example.com",
          role: "スタッフ",
          registeredAt: "2024-03-25T10:30:00Z",
          lastLogin: "2025-04-04T14:50:15Z",
          status: "active"
        },
        {
          id: "user11",
          name: "松本和也",
          email: "matsumoto@example.com",
          role: "講師",
          registeredAt: "2024-02-15T09:15:00Z",
          lastLogin: "2025-03-30T11:05:40Z",
          status: "active"
        },
        {
          id: "user12",
          name: "井上真理",
          email: "inoue@example.com",
          role: "ボランティア",
          registeredAt: "2024-01-20T14:45:00Z",
          lastLogin: null,
          status: "pending"
        }
      ];
      
      res.json(users);
    } catch (error) {
      log(`Error retrieving users: ${error instanceof Error ? error.message : String(error)}`, 3);
      res.status(500).json({
        message: 'ユーザーデータの取得中にエラーが発生しました',
        error: error instanceof Error ? error.message : '不明なエラー'
      });
    }
  });
  
  app.get('/api/files', async (req, res) => {
    try {
      const files = [
        {
          id: "file1",
          name: "2025年度事業計画書.pdf",
          type: "application/pdf",
          size: 2456789,
          category: "documents",
          uploadedBy: "田中太郎",
          uploadedAt: "2025-03-15T10:30:00Z",
          url: "/uploads/business_plan_2025.pdf"
        },
        {
          id: "file2",
          name: "料理教室チラシ.jpg",
          type: "image/jpeg",
          size: 1245678,
          category: "images",
          uploadedBy: "佐藤花子",
          uploadedAt: "2025-03-20T14:15:00Z",
          url: "/uploads/cooking_class_flyer.jpg"
        },
        {
          id: "file3",
          name: "予算計画2025.xlsx",
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          size: 987654,
          category: "spreadsheets",
          uploadedBy: "高橋誠",
          uploadedAt: "2025-03-10T09:45:00Z",
          url: "/uploads/budget_plan_2025.xlsx"
        },
        {
          id: "file4",
          name: "理事会議事録_2025-03.docx",
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          size: 567890,
          category: "documents",
          uploadedBy: "田中太郎",
          uploadedAt: "2025-04-01T11:20:00Z",
          url: "/uploads/board_minutes_2025-03.docx"
        },
        {
          id: "file5",
          name: "料理教室写真集.zip",
          type: "application/zip",
          size: 15678901,
          category: "images",
          uploadedBy: "鈴木一郎",
          uploadedAt: "2025-03-25T16:30:00Z",
          url: "/uploads/cooking_class_photos.zip"
        },
        {
          id: "file6",
          name: "新メニュー提案.pptx",
          type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          size: 3456789,
          category: "presentations",
          uploadedBy: "伊藤美咲",
          uploadedAt: "2025-03-18T13:10:00Z",
          url: "/uploads/new_menu_proposal.pptx"
        },
        {
          id: "file7",
          name: "会員アンケート結果.csv",
          type: "text/csv",
          size: 234567,
          category: "spreadsheets",
          uploadedBy: "山田直樹",
          uploadedAt: "2025-03-22T10:00:00Z",
          url: "/uploads/member_survey_results.csv"
        },
        {
          id: "file8",
          name: "施設利用マニュアル.pdf",
          type: "application/pdf",
          size: 1876543,
          category: "documents",
          uploadedBy: "中村優子",
          uploadedAt: "2025-03-05T15:45:00Z",
          url: "/uploads/facility_manual.pdf"
        }
      ];
      
      res.json(files);
    } catch (error) {
      log(`Error retrieving files: ${error instanceof Error ? error.message : String(error)}`, 3);
      res.status(500).json({
        message: 'ファイル一覧の取得中にエラーが発生しました',
        error: error instanceof Error ? error.message : '不明なエラー'
      });
    }
  });
  
  app.get('/api/analytics', async (req, res) => {
    try {
      const timeRange = req.query.timeRange || 'month';
      
      const analyticsData = {
        revenue: {
          monthly: [
            { month: '1月', amount: 850000 },
            { month: '2月', amount: 920000 },
            { month: '3月', amount: 880000 },
            { month: '4月', amount: 950000 },
            { month: '5月', amount: 1020000 },
            { month: '6月', amount: 980000 }
          ],
          yearly: [
            { year: '2022', amount: 9500000 },
            { year: '2023', amount: 10200000 },
            { year: '2024', amount: 11500000 },
            { year: '2025', amount: 6000000 }
          ]
        },
        members: {
          total: 120,
          active: 95,
          new: [
            { month: '1月', count: 8 },
            { month: '2月', count: 12 },
            { month: '3月', count: 10 },
            { month: '4月', count: 15 },
            { month: '5月', count: 9 },
            { month: '6月', count: 11 }
          ]
        },
        activities: {
          meetings: 24,
          tasks: { completed: 87, pending: 34, total: 121 },
          documents: 45
        }
      };
      
      res.json(analyticsData);
    } catch (error) {
      log(`Error retrieving analytics data: ${error instanceof Error ? error.message : String(error)}`, 3);
      res.status(500).json({
        message: '分析データの取得中にエラーが発生しました',
        error: error instanceof Error ? error.message : '不明なエラー'
      });
    }
  });
  
  setupRegistrationRoutes(app);
  
  log("APIルートの登録が完了しました");
}
