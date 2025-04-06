/**
 * シンプルなロギングユーティリティ
 * ログレベルに応じてコンソール出力を制御
 */

const LOG_LEVEL = process.env.LOG_LEVEL || 3;

/**
 * ログメッセージを出力
 * @param {string} message - ログメッセージ
 * @param {number} level - ログレベル（デフォルト: 2）
 */
export function log(message, level = 2) {
  const timestamp = new Date().toISOString();
  
  if (level <= LOG_LEVEL) {
    let prefix = '';
    
    switch (level) {
      case 0:
        prefix = '[ERROR]';
        console.error(`${timestamp} ${prefix} ${message}`);
        break;
      case 1:
        prefix = '[WARN]';
        console.warn(`${timestamp} ${prefix} ${message}`);
        break;
      case 2:
        prefix = '[INFO]';
        console.log(`${timestamp} ${prefix} ${message}`);
        break;
      case 3:
        prefix = '[DEBUG]';
        console.log(`${timestamp} ${prefix} ${message}`);
        break;
      default:
        console.log(`${timestamp} ${message}`);
    }
  }
}

export default { log };
