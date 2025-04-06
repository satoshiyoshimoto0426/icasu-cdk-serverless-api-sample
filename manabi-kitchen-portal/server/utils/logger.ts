/**
 * シンプルなロガーモジュール
 */

// ログレベルの定義
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

// 現在のログレベル（環境変数から取得、デフォルトはINFO）
const currentLogLevel = process.env.LOG_LEVEL 
  ? (LogLevel[process.env.LOG_LEVEL as keyof typeof LogLevel] ?? LogLevel.INFO)
  : LogLevel.INFO;

/**
 * タイムスタンプ付きのログメッセージを出力
 * @param message ログメッセージ
 * @param level ログレベル
 */
export function log(message: string, level: LogLevel = LogLevel.INFO): void {
  // 現在のログレベルよりも低いレベルのログは出力しない
  if (level < currentLogLevel) return;
  
  const timestamp = new Date().toISOString();
  const levelName = LogLevel[level];
  
  // ログレベルに応じた出力先と色を設定
  switch (level) {
    case LogLevel.DEBUG:
      console.debug(`[${timestamp}] [${levelName}] ${message}`);
      break;
    case LogLevel.INFO:
      console.info(`[${timestamp}] [${levelName}] ${message}`);
      break;
    case LogLevel.WARN:
      console.warn(`[${timestamp}] [${levelName}] ${message}`);
      break;
    case LogLevel.ERROR:
      console.error(`[${timestamp}] [${levelName}] ${message}`);
      break;
    default:
      console.log(`[${timestamp}] [UNKNOWN] ${message}`);
  }
}

/**
 * デバッグレベルのログを出力
 * @param message ログメッセージ
 */
export function debug(message: string): void {
  log(message, LogLevel.DEBUG);
}

/**
 * 情報レベルのログを出力
 * @param message ログメッセージ
 */
export function info(message: string): void {
  log(message, LogLevel.INFO);
}

/**
 * 警告レベルのログを出力
 * @param message ログメッセージ
 */
export function warn(message: string): void {
  log(message, LogLevel.WARN);
}

/**
 * エラーレベルのログを出力
 * @param message ログメッセージ
 */
export function error(message: string): void {
  log(message, LogLevel.ERROR);
}

/**
 * エラーオブジェクトのログを出力
 * @param err エラーオブジェクト
 * @param context 追加のコンテキスト情報
 */
export function logError(err: Error | unknown, context?: string): void {
  if (err instanceof Error) {
    error(`${context ? `[${context}] ` : ''}${err.message}`);
    if (err.stack) {
      debug(err.stack);
    }
  } else {
    error(`${context ? `[${context}] ` : ''}Unknown error: ${String(err)}`);
  }
}