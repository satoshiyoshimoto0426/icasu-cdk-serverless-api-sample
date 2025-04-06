import React, { createContext, useContext, useState, ReactNode } from 'react';

// ユーザータイプの定義
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  preferences?: Record<string, any>;
}

// コンテキストの型定義
interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  error: string | null;
}

// デフォルト値
const defaultContext: UserContextType = {
  user: null,
  setUser: () => {},
  isLoading: false,
  error: null,
};

// コンテキストの作成
const UserContext = createContext<UserContextType>(defaultContext);

// プロバイダーコンポーネントのプロップス
interface UserProviderProps {
  children: ReactNode;
}

/**
 * ユーザーコンテキストプロバイダー
 * アプリケーション全体でユーザー情報を共有
 */
export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 実際のアプリでは、ここでユーザー情報の取得や認証の処理を行う
  // 例: useEffectでトークンの有効性チェックやユーザー情報取得など

  const value = {
    user,
    setUser,
    isLoading,
    error,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

/**
 * ユーザーコンテキストを使用するためのカスタムフック
 */
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};