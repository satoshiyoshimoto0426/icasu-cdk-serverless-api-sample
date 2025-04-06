import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

interface Registration {
  id: string;
  registrationType: string;
  fullName: string;
  furigana: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  registeredAt: string;
  lastLogin: string;
  status: 'active' | 'inactive' | 'pending';
}

type DataItem = User | Registration;

/**
 * 登録者データベースページコンポーネント
 * 登録されたユーザーデータと利用者関係者登録データを保管・管理するシステム
 */
const Database: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'users' | 'registrations'>('registrations');
  const itemsPerPage = 10;
  
  const { data: users, isLoading: usersLoading, error: usersError } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/users');
        if (!response.ok) {
          throw new Error('ユーザーデータの取得に失敗しました');
        }
        return response.json();
      } catch (error) {
        console.error('ユーザーデータ取得エラー:', error);
        return [];
      }
    },
  });
  
  const { data: registrations, isLoading: registrationsLoading, error: registrationsError } = useQuery<Registration[]>({
    queryKey: ['registrations'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/registrations');
        if (!response.ok) {
          throw new Error('登録データの取得に失敗しました');
        }
        return response.json().then(res => res.data || []);
      } catch (error) {
        console.error('登録データ取得エラー:', error);
        return [];
      }
    },
  });
  
  const filteredUsers = users?.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = typeFilter === 'all' || user.status === typeFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  const filteredRegistrations = registrations?.filter(reg => {
    const matchesSearch = 
      (reg.fullName && reg.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (reg.email && reg.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (reg.phone && reg.phone.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = typeFilter === 'all' || reg.registrationType === typeFilter;
    
    return matchesSearch && matchesType;
  });
  
  const activeData = activeTab === 'users' ? filteredUsers : filteredRegistrations;
  
  const totalPages = activeData ? Math.ceil(activeData.length / itemsPerPage) : 0;
  const paginatedData = activeData?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'アクティブ';
      case 'inactive':
        return '非アクティブ';
      case 'pending':
        return '保留中';
      default:
        return status;
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">登録者データベース</h1>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
        >
          新規ユーザー登録
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="mb-6">
          <div className="flex space-x-4 mb-4">
            <button
              className={`px-4 py-2 rounded-md ${
                activeTab === 'registrations'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setActiveTab('registrations')}
            >
              利用者関係者登録
            </button>
            <button
              className={`px-4 py-2 rounded-md ${
                activeTab === 'users'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setActiveTab('users')}
            >
              システムユーザー
            </button>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="relative mb-4 md:mb-0 md:w-1/3">
              <input
                type="text"
                placeholder="名前、メール、電話番号で検索..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg
                className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </div>
            
            <div className="flex space-x-2">
              {activeTab === 'users' ? (
                <>
                  <button
                    className={`px-4 py-2 rounded-md ${
                      typeFilter === 'all'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    onClick={() => setTypeFilter('all')}
                  >
                    すべて
                  </button>
                  <button
                    className={`px-4 py-2 rounded-md ${
                      typeFilter === 'active'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    onClick={() => setTypeFilter('active')}
                  >
                    アクティブ
                  </button>
                  <button
                    className={`px-4 py-2 rounded-md ${
                      typeFilter === 'inactive'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    onClick={() => setTypeFilter('inactive')}
                  >
                    非アクティブ
                  </button>
                  <button
                    className={`px-4 py-2 rounded-md ${
                      typeFilter === 'pending'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    onClick={() => setTypeFilter('pending')}
                  >
                    保留中
                  </button>
                </>
              ) : (
                <>
                  <button
                    className={`px-4 py-2 rounded-md ${
                      typeFilter === 'all'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    onClick={() => setTypeFilter('all')}
                  >
                    すべて
                  </button>
                  <button
                    className={`px-4 py-2 rounded-md ${
                      typeFilter === 'child'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    onClick={() => setTypeFilter('child')}
                  >
                    子ども
                  </button>
                  <button
                    className={`px-4 py-2 rounded-md ${
                      typeFilter === 'parent'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    onClick={() => setTypeFilter('parent')}
                  >
                    保護者
                  </button>
                  <button
                    className={`px-4 py-2 rounded-md ${
                      typeFilter === 'volunteer'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    onClick={() => setTypeFilter('volunteer')}
                  >
                    ボランティア
                  </button>
                  <button
                    className={`px-4 py-2 rounded-md ${
                      typeFilter === 'supporter'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    onClick={() => setTypeFilter('supporter')}
                  >
                    支援者
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        
        {activeTab === 'users' ? (
          usersLoading ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-600">ユーザーデータを読み込み中...</p>
            </div>
          ) : usersError ? (
            <div className="text-center py-10">
              <p className="text-red-500">エラーが発生しました。再度お試しください。</p>
            </div>
          ) : paginatedData && paginatedData.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        名前
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        メールアドレス
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        役割
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        登録日
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        最終ログイン
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ステータス
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        アクション
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedData.map((item) => {
                      const user = item as User;
                      return (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.role}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(user.registeredAt).toLocaleDateString('ja-JP')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('ja-JP') : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                              user.status
                            )}`}
                          >
                            {getStatusText(user.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              編集
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              削除
                            </button>
                          </div>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">ユーザーが見つかりません</p>
            </div>
          )
        ) : (
          registrationsLoading ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-600">登録データを読み込み中...</p>
            </div>
          ) : registrationsError ? (
            <div className="text-center py-10">
              <p className="text-red-500">エラーが発生しました。再度お試しください。</p>
            </div>
          ) : paginatedData && paginatedData.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        登録種別
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        名前
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        メールアドレス
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        電話番号
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        登録日
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        アクション
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedData.map((item) => {
                      const reg = item as Registration;
                      return (
                      <tr key={reg.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {reg.registrationType === 'child' && '子ども'}
                            {reg.registrationType === 'parent' && '保護者'}
                            {reg.registrationType === 'volunteer' && 'ボランティア'}
                            {reg.registrationType === 'supporter' && '支援者・協力者'}
                            {reg.registrationType === 'feedback' && 'ご意見・ご要望'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{reg.fullName || '-'}</div>
                          {reg.furigana && <div className="text-xs text-gray-500">{reg.furigana}</div>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{reg.email || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{reg.phone || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(reg.createdAt).toLocaleDateString('ja-JP')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              詳細
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              削除
                            </button>
                          </div>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">登録データが見つかりません</p>
            </div>
          )
        )}
        
        {/* ページネーション */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-700">
              全 <span className="font-medium">{activeData?.length}</span> 件中{' '}
              <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> から{' '}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, activeData?.length || 0)}
              </span>{' '}
              件を表示
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                前へ
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === page
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                次へ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Database;
