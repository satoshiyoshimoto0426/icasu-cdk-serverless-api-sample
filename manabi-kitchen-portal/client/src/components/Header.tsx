import React, { useState } from 'react';
import { Bell, Menu, User, LogOut, Settings, HelpCircle } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

interface HeaderProps {
  toggleSidebar: () => void;
  onLogout: () => void;
}

/**
 * ヘッダーコンポーネント
 * アプリケーションのトップバーとユーザーメニューを提供
 */
const Header: React.FC<HeaderProps> = ({ toggleSidebar, onLogout }) => {
  const { user } = useUser();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // 通知メニューの表示/非表示切り替え
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (showUserMenu) setShowUserMenu(false);
  };

  // ユーザーメニューの表示/非表示切り替え
  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
    if (showNotifications) setShowNotifications(false);
  };

  // モックの通知データ
  const notifications = [
    { id: 1, text: '新しいタスクが割り当てられました', time: '5分前', isRead: false },
    { id: 2, text: '明日の会議の準備をしてください', time: '1時間前', isRead: false },
    { id: 3, text: '月次レポートが提出されました', time: '3時間前', isRead: true },
  ];

  // 未読通知の数
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between h-16 px-6">
        {/* 左側: サイドバートグルとブレッドクラム */}
        <div className="flex items-center">
          <button 
            onClick={toggleSidebar}
            className="p-2 mr-4 text-gray-500 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-semibold text-gray-800">まなびキッチン社内ポータル</h1>
        </div>

        {/* 右側: 通知とユーザーメニュー */}
        <div className="flex items-center space-x-4">
          {/* 通知ベル */}
          <div className="relative">
            <button 
              onClick={toggleNotifications}
              className="p-2 text-gray-500 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* 通知ドロップダウン */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-200">
                <div className="px-4 py-2 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700">通知</h3>
                </div>
                {notifications.length > 0 ? (
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map(notification => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 hover:bg-gray-50 ${
                          !notification.isRead ? 'bg-blue-50' : ''
                        }`}
                      >
                        <p className="text-sm text-gray-800">{notification.text}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-6 text-center text-sm text-gray-500">
                    通知はありません
                  </div>
                )}
                <div className="px-4 py-2 border-t border-gray-200 text-center">
                  <button className="text-sm text-blue-600 hover:text-blue-800">
                    すべての通知を見る
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ユーザーアバター */}
          <div className="relative">
            <button 
              onClick={toggleUserMenu}
              className="flex items-center space-x-2 focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt="User avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={20} className="text-gray-600" />
                )}
              </div>
              <span className="text-sm font-medium text-gray-700 hidden md:block">
                {user?.name || 'ユーザー'}
              </span>
            </button>

            {/* ユーザーメニュードロップダウン */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-200">
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-800">{user?.name || 'ユーザー'}</p>
                  <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
                </div>
                <a
                  href="/profile"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <User size={16} className="mr-2" />
                  プロフィール
                </a>
                <a
                  href="/settings"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Settings size={16} className="mr-2" />
                  設定
                </a>
                <a
                  href="/help"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <HelpCircle size={16} className="mr-2" />
                  ヘルプ
                </a>
                <div className="border-t border-gray-200 mt-1"></div>
                <button
                  onClick={onLogout}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  <LogOut size={16} className="mr-2" />
                  ログアウト
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;