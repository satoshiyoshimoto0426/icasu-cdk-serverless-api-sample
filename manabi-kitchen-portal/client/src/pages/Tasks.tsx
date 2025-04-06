import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MoreHorizontal,
  Calendar
} from 'lucide-react';

// タスクの型定義
interface Task {
  id: number;
  title: string;
  description?: string;
  due_date?: Date;
  priority?: string;
  status: string;
  assignee?: string;
  created_at: Date;
  updated_at: Date;
}

// タスク取得関数
const fetchTasks = async (): Promise<Task[]> => {
  const response = await fetch('/api/tasks');
  if (!response.ok) {
    throw new Error('タスクの取得に失敗しました');
  }
  return response.json();
};

/**
 * タスク管理ページ
 * Trello風のカンバンボードでタスクを管理
 */
const Tasks: React.FC = () => {
  // タスクデータの取得
  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
  });

  // 検索フィルター
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  // タスクをステータスでグループ化
  const groupedTasks = tasks?.reduce((acc, task) => {
    const status = task.status;
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(task);
    return acc;
  }, {} as Record<string, Task[]>) || {};

  // ステータスのラベルとスタイル
  const statusConfig = {
    pending: {
      label: '未着手',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      borderColor: 'border-yellow-300',
    },
    in_progress: {
      label: '進行中',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      borderColor: 'border-blue-300',
    },
    completed: {
      label: '完了',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      borderColor: 'border-green-300',
    },
    cancelled: {
      label: 'キャンセル',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800',
      borderColor: 'border-gray-300',
    },
  };

  // 優先度のラベルとスタイル
  const priorityConfig = {
    high: {
      label: '高',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
    },
    medium: {
      label: '中',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-800',
    },
    low: {
      label: '低',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
    },
  };

  // タスクカードコンポーネント
  const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
    const dueDate = task.due_date ? new Date(task.due_date) : null;
    const isOverdue = dueDate && dueDate < new Date() && task.status !== 'completed';

    return (
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-3 cursor-pointer hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-gray-800">{task.title}</h3>
          <button className="text-gray-400 hover:text-gray-600">
            <MoreHorizontal size={16} />
          </button>
        </div>
        
        {task.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
        )}
        
        <div className="flex flex-wrap gap-2 mb-3">
          {task.priority && (
            <span className={`text-xs px-2 py-1 rounded-full ${priorityConfig[task.priority as keyof typeof priorityConfig].bgColor} ${priorityConfig[task.priority as keyof typeof priorityConfig].textColor}`}>
              {priorityConfig[task.priority as keyof typeof priorityConfig].label}
            </span>
          )}
          
          {dueDate && (
            <span className={`text-xs px-2 py-1 rounded-full flex items-center ${isOverdue ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
              <Calendar size={12} className="mr-1" />
              {dueDate.toLocaleDateString('ja-JP')}
            </span>
          )}
        </div>
        
        <div className="flex justify-between items-center mt-2">
          {task.assignee ? (
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-600">
                {task.assignee.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs text-gray-600 ml-1">{task.assignee}</span>
            </div>
          ) : (
            <span className="text-xs text-gray-400">未割り当て</span>
          )}
          
          {task.status === 'completed' ? (
            <span className="text-xs flex items-center text-green-600">
              <CheckCircle2 size={12} className="mr-1" />
              完了
            </span>
          ) : isOverdue ? (
            <span className="text-xs flex items-center text-red-600">
              <AlertCircle size={12} className="mr-1" />
              期限超過
            </span>
          ) : (
            <span className="text-xs flex items-center text-gray-500">
              <Clock size={12} className="mr-1" />
              進行中
            </span>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">エラー: </strong>
        <span className="block sm:inline">タスクの読み込みに失敗しました。</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">タスク管理</h1>
        
        <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0 w-full md:w-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="タスクを検索..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
          
          <div className="relative">
            <select
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="">優先度: すべて</option>
              <option value="high">優先度: 高</option>
              <option value="medium">優先度: 中</option>
              <option value="low">優先度: 低</option>
            </select>
            <Filter className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
          
          <button
            className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
            onClick={() => setShowAddTaskModal(true)}
          >
            <Plus size={18} className="mr-1" />
            新規タスク
          </button>
        </div>
      </div>

      {/* カンバンボード */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Object.entries(statusConfig).map(([status, config]) => (
          <div key={status} className={`bg-gray-50 rounded-lg p-4 ${config.borderColor} border-t-4`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`font-semibold ${config.textColor}`}>{config.label}</h2>
              <span className="text-sm bg-white rounded-full px-2 py-1 text-gray-600">
                {groupedTasks[status]?.length || 0}
              </span>
            </div>
            
            <div className="h-full overflow-y-auto pb-4">
              {groupedTasks[status]?.length ? (
                groupedTasks[status].map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))
              ) : (
                <div className="bg-white rounded-lg border border-dashed border-gray-300 p-4 text-center">
                  <p className="text-sm text-gray-500">タスクがありません</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* タスク追加モーダル (実装は省略) */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">新規タスク</h2>
            <p className="text-gray-600 mb-4">
              このモーダルでは新しいタスクを作成できます。実装は省略しています。
            </p>
            <div className="flex justify-end">
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-lg mr-2"
                onClick={() => setShowAddTaskModal(false)}
              >
                キャンセル
              </button>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
                onClick={() => setShowAddTaskModal(false)}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;