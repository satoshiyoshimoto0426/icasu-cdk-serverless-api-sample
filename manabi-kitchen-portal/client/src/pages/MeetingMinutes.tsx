import React, { useState, useEffect } from 'react';

/**
 * 議事録管理ページコンポーネント
 * 会議の議事録を記録・管理する
 */
function MeetingMinutes() {
  const [minutes, setMinutes] = useState([]);
  const [newMinute, setNewMinute] = useState({
    date: new Date().toISOString().split('T')[0],
    title: '',
    participants: '',
    content: '',
  });
  const [selectedMinute, setSelectedMinute] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        const response = await fetch('/api/meeting-minutes');
        if (!response.ok) {
          throw new Error('議事録の取得に失敗しました');
        }
        const data = await response.json();
        setMinutes(data);
        
        setIsLoading(false);
      } catch (err) {
        console.error('データ取得エラー:', err);
        setError('データの取得中にエラーが発生しました。');
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMinute({
      ...newMinute,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (!newMinute.title || !newMinute.participants || !newMinute.content) {
        setError('すべての項目を入力してください。');
        return;
      }
      
      const response = await fetch('/api/meeting-minutes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMinute),
      });
      
      if (!response.ok) {
        throw new Error('議事録の登録に失敗しました');
      }
      
      const createdMinute = await response.json();
      setMinutes([...minutes, createdMinute]);
      
      setNewMinute({
        date: new Date().toISOString().split('T')[0],
        title: '',
        participants: '',
        content: '',
      });
      
      setError('');
    } catch (err) {
      console.error('議事録登録エラー:', err);
      setError('議事録の登録中にエラーが発生しました。');
    }
  };

  const handleSelectMinute = (minute) => {
    setSelectedMinute(minute);
  };

  const handleCloseMinute = () => {
    setSelectedMinute(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-6">議事録管理</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* 新規議事録フォーム */}
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-6">
        <h2 className="text-xl font-semibold mb-4">新規議事録の登録</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
                日付
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="date"
                type="date"
                name="date"
                value={newMinute.date}
                onChange={handleInputChange}
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                タイトル
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="title"
                type="text"
                name="title"
                value={newMinute.title}
                onChange={handleInputChange}
                placeholder="例: 週次ミーティング"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="participants">
                参加者
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="participants"
                type="text"
                name="participants"
                value={newMinute.participants}
                onChange={handleInputChange}
                placeholder="例: 山田, 鈴木, 佐藤"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="content">
              議事内容
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="content"
              name="content"
              rows={6}
              value={newMinute.content}
              onChange={handleInputChange}
              placeholder="議事内容を入力してください..."
            ></textarea>
          </div>
          
          <div>
            <button
              className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              登録
            </button>
          </div>
        </form>
      </div>
      
      {/* 議事録リスト */}
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8">
        <h2 className="text-xl font-semibold mb-4">議事録一覧</h2>
        
        {minutes.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            議事録データがありません
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {minutes.map((minute) => (
              <div
                key={minute.id}
                className="border rounded p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => handleSelectMinute(minute)}
              >
                <div className="font-semibold text-lg mb-1">{minute.title}</div>
                <div className="text-sm text-gray-600 mb-2">
                  {new Date(minute.date).toLocaleDateString('ja-JP')}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  参加者: {minute.participants}
                </div>
                <div className="text-sm text-gray-800 line-clamp-3">
                  {minute.content.substring(0, 150)}
                  {minute.content.length > 150 ? '...' : ''}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* 議事録詳細モーダル */}
      {selectedMinute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">{selectedMinute.title}</h3>
                <button
                  onClick={handleCloseMinute}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-1">
                  日付: {new Date(selectedMinute.date).toLocaleDateString('ja-JP')}
                </div>
                <div className="text-sm text-gray-600">
                  参加者: {selectedMinute.participants}
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="whitespace-pre-wrap">
                  {selectedMinute.content}
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleCloseMinute}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MeetingMinutes;
