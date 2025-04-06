import React, { useState, useEffect, useRef } from 'react';

/**
 * チャットボットページコンポーネント
 * AIアシスタントとの対話を提供
 */
function ChatBot() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'こんにちは！まなびキッチンのAIアシスタントです。何かお手伝いできることはありますか？',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;
    
    try {
      setIsSending(true);
      
      const userMessage = { role: 'user', content: inputMessage };
      setMessages((prev) => [...prev, userMessage]);
      setInputMessage('');
      
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
        }),
      });
      
      if (!response.ok) {
        throw new Error('チャットボットからの応答の取得に失敗しました');
      }
      
      const data = await response.json();
      
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);
      setIsSending(false);
    } catch (err) {
      console.error('チャットボットエラー:', err);
      setError('チャットボットとの通信中にエラーが発生しました。');
      setIsSending(false);
      
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'すみません、エラーが発生しました。しばらく経ってからもう一度お試しください。',
        },
      ]);
    }
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
  };

  const handleSampleQuery = (query) => {
    setInputMessage(query);
  };

  return (
    <div className="container mx-auto px-4 h-full flex flex-col">
      <h1 className="text-2xl font-bold mb-6">AIアシスタント</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* サンプルクエリ */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">よくある質問:</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleSampleQuery('今週の予定を教えて')}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded text-sm"
          >
            今週の予定を教えて
          </button>
          <button
            onClick={() => handleSampleQuery('経費精算の方法は？')}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded text-sm"
          >
            経費精算の方法は？
          </button>
          <button
            onClick={() => handleSampleQuery('新しいレシピのアイデアが欲しい')}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded text-sm"
          >
            新しいレシピのアイデアが欲しい
          </button>
          <button
            onClick={() => handleSampleQuery('社内イベントの予定は？')}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded text-sm"
          >
            社内イベントの予定は？
          </button>
        </div>
      </div>
      
      {/* チャットメッセージ表示エリア */}
      <div className="bg-white shadow-md rounded-lg p-4 flex-1 overflow-y-auto mb-4 max-h-[60vh]">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* 入力フォーム */}
      <div className="bg-white shadow-md rounded-lg p-4">
        <form onSubmit={handleSendMessage} className="flex items-center">
          <input
            type="text"
            value={inputMessage}
            onChange={handleInputChange}
            placeholder="メッセージを入力..."
            className="flex-1 border rounded-l-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={isSending}
          />
          <button
            type="submit"
            className={`bg-indigo-500 text-white rounded-r-lg px-4 py-2 ${
              isSending
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-indigo-600'
            }`}
            disabled={isSending}
          >
            {isSending ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              '送信'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatBot;
