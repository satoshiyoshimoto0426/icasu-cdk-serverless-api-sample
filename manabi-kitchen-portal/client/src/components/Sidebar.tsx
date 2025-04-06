import React from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Home, 
  CheckSquare, 
  BarChart2, 
  FileText, 
  MessageCircle, 
  Users, 
  Settings, 
  HelpCircle,
  Database,
  CreditCard,
  FolderOpen
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
}

/**
 * サイドバーコンポーネント
 * アプリケーションのナビゲーションを提供
 */
const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const [location] = useLocation();

  // ナビゲーションアイテムの定義
  const navItems = [
    { path: '/', label: 'ダッシュボード', icon: <Home size={20} /> },
    { path: '/tasks', label: 'タスク管理', icon: <CheckSquare size={20} /> },
    { path: '/accounting', label: '会計管理', icon: <CreditCard size={20} /> },
    { path: '/meeting-minutes', label: '議事録', icon: <FileText size={20} /> },
    { path: '/chatbot', label: 'AIチャット', icon: <MessageCircle size={20} /> },
    { path: '/members', label: '利用者関係者登録', icon: <Users size={20} /> },
    { path: '/data-analysis', label: 'データ分析', icon: <BarChart2 size={20} /> },
    { path: '/database', label: 'データベース', icon: <Database size={20} /> },
    { path: '/file-management', label: 'ファイル管理', icon: <FolderOpen size={20} /> },
  ];

  // ユーティリティナビゲーション
  const utilNavItems = [
    { path: '/settings', label: '設定', icon: <Settings size={20} /> },
    { path: '/help', label: 'ヘルプ', icon: <HelpCircle size={20} /> },
  ];

  // アクティブなナビゲーションアイテムのスタイル
  const isActive = (path: string) => {
    return location === path;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-gray-900 text-white transition-all duration-300 z-10">
      {/* ロゴ */}
      <div className="flex items-center justify-center h-16 border-b border-gray-800">
        <h1 className="text-xl font-bold">まなびキッチン</h1>
      </div>

      {/* メインナビゲーション */}
      <nav className="mt-6">
        <div className="px-4 mb-2 text-xs text-gray-400 uppercase">メインメニュー</div>
        {navItems.map((item) => (
          <Link key={item.path} href={item.path}>
            <a
              className={`flex items-center px-4 py-3 text-sm ${
                isActive(item.path)
                  ? 'bg-gray-800 text-white border-l-4 border-blue-500'
                  : 'text-gray-300 hover:bg-gray-800'
              } transition-colors duration-200`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </a>
          </Link>
        ))}
      </nav>

      {/* ユーティリティナビゲーション */}
      <div className="absolute bottom-0 w-full">
        <div className="px-4 mb-2 text-xs text-gray-400 uppercase">その他</div>
        {utilNavItems.map((item) => (
          <Link key={item.path} href={item.path}>
            <a
              className={`flex items-center px-4 py-3 text-sm ${
                isActive(item.path)
                  ? 'bg-gray-800 text-white border-l-4 border-blue-500'
                  : 'text-gray-300 hover:bg-gray-800'
              } transition-colors duration-200`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </a>
          </Link>
        ))}
        <div className="px-4 py-2 text-sm text-gray-400 border-t border-gray-800">
          バージョン: 1.0.0
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
