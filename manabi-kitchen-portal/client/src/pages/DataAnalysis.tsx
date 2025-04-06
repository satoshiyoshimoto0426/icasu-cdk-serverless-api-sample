import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

interface AnalyticsData {
  revenue: {
    monthly: { month: string; amount: number }[];
    yearly: { year: string; amount: number }[];
  };
  members: {
    total: number;
    active: number;
    new: { month: string; count: number }[];
  };
  activities: {
    meetings: number;
    tasks: { completed: number; pending: number; total: number };
    documents: number;
  };
}

/**
 * データ分析ページコンポーネント
 * 登録情報の分析と統計データを視覚的に表示するダッシュボード
 */
const DataAnalysis: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('month');
  const [chartType, setChartType] = useState<'revenue' | 'members' | 'activities'>('revenue');
  
  const { data: analyticsData, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: ['analytics', timeRange],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/analytics?timeRange=${timeRange}`);
        if (!response.ok) {
          throw new Error('分析データの取得に失敗しました');
        }
        return response.json();
      } catch (error) {
        console.error('分析データ取得エラー:', error);
        return {
          revenue: {
            monthly: [],
            yearly: [],
          },
          members: {
            total: 0,
            active: 0,
            new: [],
          },
          activities: {
            meetings: 0,
            tasks: { completed: 0, pending: 0, total: 0 },
            documents: 0,
          },
        };
      }
    },
  });
  
  const getMaxRevenue = () => {
    if (!analyticsData?.revenue.monthly.length) return 1000000;
    return Math.max(...analyticsData.revenue.monthly.map(item => item.amount)) * 1.2;
  };
  
  const getMaxMembers = () => {
    if (!analyticsData?.members.new.length) return 50;
    return Math.max(...analyticsData.members.new.map(item => item.count)) * 1.2;
  };
  
  const renderRevenueChart = () => {
    if (!analyticsData?.revenue.monthly.length) return null;
    
    const maxValue = getMaxRevenue();
    const barWidth = 100 / analyticsData.revenue.monthly.length;
    
    return (
      <div className="h-64 mt-6">
        <div className="flex h-full items-end">
          {analyticsData.revenue.monthly.map((item, index) => {
            const height = (item.amount / maxValue) * 100;
            return (
              <div
                key={index}
                className="flex flex-col items-center"
                style={{ width: `${barWidth}%` }}
              >
                <div className="w-full px-1">
                  <div
                    className="bg-blue-500 rounded-t"
                    style={{ height: `${height}%` }}
                  ></div>
                </div>
                <div className="text-xs mt-2 text-gray-600">{item.month}</div>
                <div className="text-xs font-medium">
                  {item.amount.toLocaleString('ja-JP')}円
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  const renderMembersChart = () => {
    if (!analyticsData?.members.new.length) return null;
    
    const maxValue = getMaxMembers();
    const barWidth = 100 / analyticsData.members.new.length;
    
    return (
      <div className="h-64 mt-6">
        <div className="flex h-full items-end">
          {analyticsData.members.new.map((item, index) => {
            const height = (item.count / maxValue) * 100;
            return (
              <div
                key={index}
                className="flex flex-col items-center"
                style={{ width: `${barWidth}%` }}
              >
                <div className="w-full px-1">
                  <div
                    className="bg-green-500 rounded-t"
                    style={{ height: `${height}%` }}
                  ></div>
                </div>
                <div className="text-xs mt-2 text-gray-600">{item.month}</div>
                <div className="text-xs font-medium">{item.count}人</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  const renderActivitiesChart = () => {
    if (!analyticsData?.activities) return null;
    
    const { tasks } = analyticsData.activities;
    const total = tasks.total || 1; // ゼロ除算を防ぐ
    
    return (
      <div className="mt-6">
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">タスク完了率</h3>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500"
              style={{ width: `${(tasks.completed / total) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-600">
            <span>{Math.round((tasks.completed / total) * 100)}%</span>
            <span>{tasks.completed} / {total}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-xl font-bold text-blue-600">
              {analyticsData.activities.meetings}
            </div>
            <div className="text-sm text-gray-600">会議数</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-xl font-bold text-green-600">
              {analyticsData.activities.tasks.completed}
            </div>
            <div className="text-sm text-gray-600">完了タスク</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-xl font-bold text-yellow-600">
              {analyticsData.activities.documents}
            </div>
            <div className="text-sm text-gray-600">ドキュメント</div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">データ分析</h1>
        <div className="flex space-x-2">
          <button
            className={`px-4 py-2 rounded-md ${
              timeRange === 'month'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setTimeRange('month')}
          >
            月次
          </button>
          <button
            className={`px-4 py-2 rounded-md ${
              timeRange === 'quarter'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setTimeRange('quarter')}
          >
            四半期
          </button>
          <button
            className={`px-4 py-2 rounded-md ${
              timeRange === 'year'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setTimeRange('year')}
          >
            年次
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">収益</h2>
            <span className="text-sm text-gray-500">前年比 +12%</span>
          </div>
          <div className="mt-2">
            <div className="text-3xl font-bold text-gray-900">
              {analyticsData?.revenue.monthly
                .reduce((sum, item) => sum + item.amount, 0)
                .toLocaleString('ja-JP')}円
            </div>
            <div className="text-sm text-green-500">+5% 前月比</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">会員数</h2>
            <span className="text-sm text-gray-500">前年比 +8%</span>
          </div>
          <div className="mt-2">
            <div className="text-3xl font-bold text-gray-900">
              {analyticsData?.members.total.toLocaleString('ja-JP')}人
            </div>
            <div className="text-sm text-green-500">
              アクティブ: {analyticsData?.members.active.toLocaleString('ja-JP')}人
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">活動</h2>
            <span className="text-sm text-gray-500">前月比 +15%</span>
          </div>
          <div className="mt-2">
            <div className="text-3xl font-bold text-gray-900">
              {analyticsData?.activities.tasks.total.toLocaleString('ja-JP')}
            </div>
            <div className="text-sm text-green-500">
              完了: {analyticsData?.activities.tasks.completed.toLocaleString('ja-JP')}
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">詳細分析</h2>
          <div className="flex space-x-2">
            <button
              className={`px-4 py-2 rounded-md ${
                chartType === 'revenue'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setChartType('revenue')}
            >
              収益
            </button>
            <button
              className={`px-4 py-2 rounded-md ${
                chartType === 'members'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setChartType('members')}
            >
              会員
            </button>
            <button
              className={`px-4 py-2 rounded-md ${
                chartType === 'activities'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setChartType('activities')}
            >
              活動
            </button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">データを読み込み中...</p>
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-red-500">エラーが発生しました。再度お試しください。</p>
          </div>
        ) : (
          <>
            {chartType === 'revenue' && renderRevenueChart()}
            {chartType === 'members' && renderMembersChart()}
            {chartType === 'activities' && renderActivitiesChart()}
          </>
        )}
      </div>
      
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">レポート</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center">
              <svg
                className="h-6 w-6 text-blue-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                ></path>
              </svg>
              <div>
                <div className="font-medium">月次収益レポート</div>
                <div className="text-sm text-gray-500">2025年3月</div>
              </div>
            </div>
          </div>
          <div className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center">
              <svg
                className="h-6 w-6 text-green-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                ></path>
              </svg>
              <div>
                <div className="font-medium">会員動向分析</div>
                <div className="text-sm text-gray-500">2025年第1四半期</div>
              </div>
            </div>
          </div>
          <div className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center">
              <svg
                className="h-6 w-6 text-yellow-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                ></path>
              </svg>
              <div>
                <div className="font-medium">活動サマリー</div>
                <div className="text-sm text-gray-500">2025年3月</div>
              </div>
            </div>
          </div>
          <div className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center">
              <svg
                className="h-6 w-6 text-purple-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                ></path>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                ></path>
              </svg>
              <div>
                <div className="font-medium">年間予測分析</div>
                <div className="text-sm text-gray-500">2025年度</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataAnalysis;
