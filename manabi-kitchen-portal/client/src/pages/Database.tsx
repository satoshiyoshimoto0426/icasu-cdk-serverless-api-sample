import React, { useState, useEffect } from 'react';
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

const mockUsers: User[] = [
  {
    id: 'user_1',
    name: '山田 太郎',
    email: 'yamada@example.com',
    role: '管理者',
    registeredAt: '2024-01-15T09:30:00Z',
    lastLogin: '2024-04-05T14:22:00Z',
    status: 'active'
  },
  {
    id: 'user_2',
    name: '佐藤 花子',
    email: 'sato@example.com',
    role: 'スタッフ',
    registeredAt: '2024-02-10T11:15:00Z',
    lastLogin: '2024-04-04T09:45:00Z',
    status: 'active'
  },
  {
    id: 'user_3',
    name: '鈴木 一郎',
    email: 'suzuki@example.com',
    role: 'ボランティア管理者',
    registeredAt: '2024-01-20T13:45:00Z',
    lastLogin: '2024-04-01T16:30:00Z',
    status: 'active'
  },
  {
    id: 'user_4',
    name: '高橋 実',
    email: 'takahashi@example.com',
    role: 'スタッフ',
    registeredAt: '2024-03-05T10:00:00Z',
    lastLogin: '2024-03-28T11:20:00Z',
    status: 'inactive'
  },
  {
    id: 'user_5',
    name: '田中 美咲',
    email: 'tanaka@example.com',
    role: 'スタッフ',
    registeredAt: '2024-03-15T14:30:00Z',
    lastLogin: '',
    status: 'pending'
  }
];

const mockRegistrations: Registration[] = [
  {
    id: 'reg_1',
    registrationType: 'child',
    fullName: '山田 悠太',
    furigana: 'やまだ ゆうた',
    email: 'parent1@example.com',
    phone: '090-1234-5678',
    address: '東京都新宿区1-2-3',
    createdAt: '2024-03-10T09:15:00Z',
    updatedAt: '2024-03-10T09:15:00Z'
  },
  {
    id: 'reg_2',
    registrationType: 'parent',
    fullName: '山田 美香',
    furigana: 'やまだ みか',
    email: 'parent1@example.com',
    phone: '090-1234-5678',
    address: '東京都新宿区1-2-3',
    createdAt: '2024-03-10T09:20:00Z',
    updatedAt: '2024-03-10T09:20:00Z'
  },
  {
    id: 'reg_3',
    registrationType: 'volunteer',
    fullName: '佐藤 健太',
    furigana: 'さとう けんた',
    email: 'volunteer1@example.com',
    phone: '080-9876-5432',
    address: '東京都渋谷区4-5-6',
    createdAt: '2024-02-15T14:30:00Z',
    updatedAt: '2024-02-15T14:30:00Z'
  },
  {
    id: 'reg_4',
    registrationType: 'supporter',
    fullName: '鈴木 企業',
    furigana: 'すずき きぎょう',
    email: 'company@example.com',
    phone: '03-1234-5678',
    address: '東京都千代田区7-8-9',
    createdAt: '2024-01-20T11:45:00Z',
    updatedAt: '2024-01-20T11:45:00Z'
  },
  {
    id: 'reg_5',
    registrationType: 'child',
    fullName: '田中 さくら',
    furigana: 'たなか さくら',
    email: 'parent2@example.com',
    phone: '090-8765-4321',
    address: '東京都目黒区10-11-12',
    createdAt: '2024-03-05T10:30:00Z',
    updatedAt: '2024-03-05T10:30:00Z'
  },
  {
    id: 'reg_6',
    registrationType: 'parent',
    fullName: '田中 誠',
    furigana: 'たなか まこと',
    email: 'parent2@example.com',
    phone: '090-8765-4321',
    address: '東京都目黒区10-11-12',
    createdAt: '2024-03-05T10:35:00Z',
    updatedAt: '2024-03-05T10:35:00Z'
  },
  {
    id: 'reg_7',
    registrationType: 'volunteer',
    fullName: '高橋 由美',
    furigana: 'たかはし ゆみ',
    email: 'volunteer2@example.com',
    phone: '080-1122-3344',
    address: '東京都世田谷区13-14-15',
    createdAt: '2024-02-28T16:20:00Z',
    updatedAt: '2024-02-28T16:20:00Z'
  },
  {
    id: 'reg_8',
    registrationType: 'supporter',
    fullName: '伊藤 NPO',
    furigana: 'いとう えぬぴーおー',
    email: 'npo@example.com',
    phone: '03-5566-7788',
    address: '東京都港区16-17-18',
    createdAt: '2024-02-10T13:10:00Z',
    updatedAt: '2024-02-10T13:10:00Z'
  },
  {
    id: 'reg_9',
    registrationType: 'feedback',
    fullName: '匿名',
    furigana: '',
    email: 'anonymous@example.com',
    phone: '',
    address: '',
    createdAt: '2024-03-15T09:45:00Z',
    updatedAt: '2024-03-15T09:45:00Z'
  },
  {
    id: 'reg_10',
    registrationType: 'child',
    fullName: '小林 健太',
    furigana: 'こばやし けんた',
    email: 'parent3@example.com',
    phone: '090-3344-5566',
    address: '東京都杉並区19-20-21',
    createdAt: '2024-03-12T11:25:00Z',
    updatedAt: '2024-03-12T11:25:00Z'
  }
];

/**
 * 登録者データベースページコンポーネント
 * 登録されたユーザーデータと利用者関係者登録データを保管・管理するシステム
 */
const Database: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'users' | 'registrations'>('registrations');
  const [usersData, setUsersData] = useState<User[]>([]);
  const [registrationsData, setRegistrationsData] = useState<Registration[]>([]);
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
        const jsonData = await response.json();
        return jsonData.data || [];
      } catch (error) {
        console.error('登録データ取得エラー:', error);
        return [];
      }
    },
  });
  
  useEffect(() => {
    if (usersError || (usersLoading === false && (!users || users.length === 0))) {
      setUsersData(mockUsers);
    } else if (users && users.length > 0) {
      setUsersData(users);
    }
    
    if (registrationsError || (registrationsLoading === false && (!registrations || registrations.length === 0))) {
      setRegistrationsData(mockRegistrations);
    } else if (registrations && registrations.length > 0) {
      setRegistrationsData(registrations);
    }
  }, [users, registrations, usersLoading, registrationsLoading, usersError, registrationsError]);
  
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
