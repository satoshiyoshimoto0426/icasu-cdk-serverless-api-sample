import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, Clock, Users, CreditCard, FileText, CheckSquare, TrendingUp, Activity } from 'lucide-react';

// モックデータ
const salesData = [
  { name: '1月', 収入: 400000, 支出: 240000 },
  { name: '2月', 収入: 300000, 支出: 290000 },
  { name: '3月', 収入: 550000, 支出: 300000 },
  { name: '4月', 収入: 480000, 支出: 320000 },
  { name: '5月', 収入: 590000, 支出: 350000 },
  { name: '6月', 収入: 620000, 支出: 380000 },
];

const taskStatusData = [
  { name: '完了', value: 12 },
  { name: '進行中', value: 8 },
  { name: '未着手', value: 5 },
];

/**
 * ダッシュボードページ
 * 重要な情報やデータの概要を表示
 */
const Dashboard: React.FC = () => {
  // 現在の日時
  const now = new Date();
  const formattedDate = now.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">ダッシュボード</h1>
        <div className="flex items-center mt-4 md:mt-0">
          <Calendar className="text-gray-500 mr-2" size={20} />
          <span className="text-gray-600">{formattedDate}</span>
          <Clock className="text-gray-500 ml-4 mr-2" size={20} />
          <span className="text-gray-600">
            {now.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* 概要カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="rounded-full bg-blue-100 p-3 mr-4">
            <Users className="text-blue-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">会員数</p>
            <p className="text-2xl font-bold text-gray-800">128</p>
            <p className="text-xs text-green-600">
              <TrendingUp size={12} className="inline mr-1" /> 先月比 +12%
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="rounded-full bg-green-100 p-3 mr-4">
            <CreditCard className="text-green-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">今月の収入</p>
            <p className="text-2xl font-bold text-gray-800">¥620,000</p>
            <p className="text-xs text-green-600">
              <TrendingUp size={12} className="inline mr-1" /> 先月比 +5%
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="rounded-full bg-purple-100 p-3 mr-4">
            <FileText className="text-purple-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">議事録</p>
            <p className="text-2xl font-bold text-gray-800">24</p>
            <p className="text-xs text-gray-500">今月作成: 5件</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="rounded-full bg-yellow-100 p-3 mr-4">
            <CheckSquare className="text-yellow-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">タスク</p>
            <p className="text-2xl font-bold text-gray-800">25</p>
            <p className="text-xs text-red-500">未完了: 13件</p>
          </div>
        </div>
      </div>

      {/* チャートと情報 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* 収支グラフ */}
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">収支推移</h2>
            <div className="flex items-center">
              <span className="text-xs text-gray-500 mr-4">表示期間: 直近6ヶ月</span>
              <select className="text-sm border rounded p-1">
                <option value="6">6ヶ月</option>
                <option value="12">12ヶ月</option>
              </select>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `¥${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="収入" fill="#4f46e5" />
                <Bar dataKey="支出" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* タスク状況 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">タスク状況</h2>
          <div className="space-y-4">
            {taskStatusData.map((status, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-600">{status.name}</span>
                  <span className="text-sm font-medium text-gray-900">{status.value}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${
                      index === 0 ? 'bg-green-600' : index === 1 ? 'bg-blue-600' : 'bg-yellow-600'
                    }`}
                    style={{ width: `${(status.value / taskStatusData.reduce((acc, curr) => acc + curr.value, 0)) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-lg font-semibold text-gray-800 mt-8 mb-4">最近のアクティビティ</h2>
          <div className="space-y-4">
            <div className="flex">
              <div className="flex-shrink-0 mr-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Activity size={16} className="text-blue-600" />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-800">新しいタスクが追加されました</p>
                <p className="text-xs text-gray-500">30分前</p>
              </div>
            </div>
            <div className="flex">
              <div className="flex-shrink-0 mr-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <FileText size={16} className="text-green-600" />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-800">議事録が更新されました</p>
                <p className="text-xs text-gray-500">2時間前</p>
              </div>
            </div>
            <div className="flex">
              <div className="flex-shrink-0 mr-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <Users size={16} className="text-purple-600" />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-800">新しい会員が登録されました</p>
                <p className="text-xs text-gray-500">昨日</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 重要なお知らせ */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">重要なお知らせ</h2>
        <div className="border-l-4 border-yellow-500 bg-yellow-50 p-4 rounded-r-md">
          <h3 className="text-md font-medium text-yellow-800">システムメンテナンスのお知らせ</h3>
          <p className="text-sm text-yellow-700 mt-1">
            5月15日（土）午前2時から午前5時までシステムメンテナンスを実施します。
            この間はシステムにアクセスできなくなりますので、ご注意ください。
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;