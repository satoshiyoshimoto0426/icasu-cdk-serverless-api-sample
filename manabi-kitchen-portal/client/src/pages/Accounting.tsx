import React, { useState, useEffect } from 'react';

/**
 * 会計管理ページコンポーネント
 * 収支の記録と管理を行う
 */
function Accounting() {
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [newTransaction, setNewTransaction] = useState({
    date: new Date().toISOString().split('T')[0],
    categoryId: '',
    amount: '',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        const categoriesResponse = await fetch('/api/account-categories');
        if (!categoriesResponse.ok) {
          throw new Error('カテゴリの取得に失敗しました');
        }
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
        
        const transactionsResponse = await fetch('/api/account-transactions');
        if (!transactionsResponse.ok) {
          throw new Error('取引履歴の取得に失敗しました');
        }
        const transactionsData = await transactionsResponse.json();
        setTransactions(transactionsData);
        
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
    setNewTransaction({
      ...newTransaction,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (!newTransaction.categoryId || !newTransaction.amount || !newTransaction.description) {
        setError('すべての項目を入力してください。');
        return;
      }
      
      const response = await fetch('/api/account-transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTransaction),
      });
      
      if (!response.ok) {
        throw new Error('取引の登録に失敗しました');
      }
      
      const createdTransaction = await response.json();
      setTransactions([...transactions, createdTransaction]);
      
      setNewTransaction({
        date: new Date().toISOString().split('T')[0],
        categoryId: '',
        amount: '',
        description: '',
      });
      
      setError('');
    } catch (err) {
      console.error('取引登録エラー:', err);
      setError('取引の登録中にエラーが発生しました。');
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : '不明なカテゴリ';
  };

  const calculateTotal = () => {
    return transactions.reduce((total, transaction) => {
      return total + parseFloat(transaction.amount);
    }, 0).toLocaleString();
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
      <h1 className="text-2xl font-bold mb-6">会計管理</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* 新規取引フォーム */}
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-6">
        <h2 className="text-xl font-semibold mb-4">新規取引の登録</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
                日付
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="date"
                type="date"
                name="date"
                value={newTransaction.date}
                onChange={handleInputChange}
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="categoryId">
                カテゴリ
              </label>
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="categoryId"
                name="categoryId"
                value={newTransaction.categoryId}
                onChange={handleInputChange}
              >
                <option value="">カテゴリを選択</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="amount">
                金額 (円)
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="amount"
                type="number"
                name="amount"
                value={newTransaction.amount}
                onChange={handleInputChange}
                placeholder="例: 1000"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                説明
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="description"
                type="text"
                name="description"
                value={newTransaction.description}
                onChange={handleInputChange}
                placeholder="例: オフィス用品購入"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <button
              className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              登録
            </button>
          </div>
        </form>
      </div>
      
      {/* 取引履歴 */}
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">取引履歴</h2>
          <div className="text-lg font-bold">
            合計: {calculateTotal()} 円
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  日付
                </th>
                <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  カテゴリ
                </th>
                <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  説明
                </th>
                <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  金額 (円)
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-4 px-4 border-b border-gray-200 text-center text-gray-500">
                    取引データがありません
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="py-2 px-4 border-b border-gray-200">
                      {new Date(transaction.date).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-200">
                      {getCategoryName(transaction.categoryId)}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-200">
                      {transaction.description}
                    </td>
                    <td className="py-2 px-4 border-b border-gray-200 text-right">
                      {parseFloat(transaction.amount).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Accounting;
