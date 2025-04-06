import React, { useState } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Accounting from './pages/Accounting';
import MeetingMinutes from './pages/MeetingMinutes';
import ChatBot from './pages/ChatBot';
import Login from './pages/Login';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { UserProvider } from './contexts/UserContext';

/**
 * アプリケーションのメインコンポーネント
 * ルーティングとレイアウトを管理
 */
function App() {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 認証状態の切り替え関数
  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  // サイドバーの表示/非表示切り替え
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // ログインページのみの場合は特別なレイアウト
  if (location === '/login' || !isAuthenticated) {
    return (
      <UserProvider>
        <Login onLogin={handleLogin} />
      </UserProvider>
    );
  }

  return (
    <UserProvider>
      <div className="flex h-screen bg-gray-100">
        {/* サイドバー */}
        <Sidebar isOpen={sidebarOpen} />

        {/* メインコンテンツ */}
        <div className={`flex-1 flex flex-col overflow-hidden ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
          {/* ヘッダー */}
          <Header toggleSidebar={toggleSidebar} onLogout={handleLogout} />

          {/* メインコンテンツエリア */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/tasks" component={Tasks} />
              <Route path="/accounting" component={Accounting} />
              <Route path="/meeting-minutes" component={MeetingMinutes} />
              <Route path="/chatbot" component={ChatBot} />
              <Route>
                <div className="text-center py-10">
                  <h1 className="text-2xl font-bold text-gray-800">404 - ページが見つかりません</h1>
                  <p className="mt-2 text-gray-600">
                    お探しのページは存在しないか、移動された可能性があります。
                  </p>
                </div>
              </Route>
            </Switch>
          </main>
        </div>
      </div>
    </UserProvider>
  );
}

export default App;