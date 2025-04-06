/**
 * 登録データモデル
 * 利用者関係者登録フォームからのデータを保存するためのモデル
 */

const registrations = [];

/**
 * 登録データを保存
 * @param {Object} data - 登録フォームからのデータ
 * @returns {Object} 保存されたデータ（IDを含む）
 */
export const saveRegistration = (data) => {
  const timestamp = new Date().toISOString();
  const newRegistration = {
    id: `reg_${Date.now()}`,
    ...data,
    createdAt: timestamp,
    updatedAt: timestamp
  };
  
  registrations.push(newRegistration);
  return newRegistration;
};

/**
 * すべての登録データを取得
 * @param {Object} filters - フィルタリング条件
 * @returns {Array} 登録データの配列
 */
export const getAllRegistrations = (filters = {}) => {
  let result = [...registrations];
  
  if (filters.registrationType) {
    result = result.filter(reg => reg.registrationType === filters.registrationType);
  }
  
  if (filters.startDate) {
    const startDate = new Date(filters.startDate);
    result = result.filter(reg => new Date(reg.createdAt) >= startDate);
  }
  
  if (filters.endDate) {
    const endDate = new Date(filters.endDate);
    result = result.filter(reg => new Date(reg.createdAt) <= endDate);
  }
  
  return result;
};

/**
 * IDで登録データを取得
 * @param {string} id - 登録データのID
 * @returns {Object|null} 登録データまたはnull
 */
export const getRegistrationById = (id) => {
  return registrations.find(reg => reg.id === id) || null;
};

/**
 * 登録データの統計情報を取得
 * @returns {Object} 統計情報
 */
export const getRegistrationStats = () => {
  const stats = {
    total: registrations.length,
    byType: {},
    recentRegistrations: []
  };
  
  registrations.forEach(reg => {
    const type = reg.registrationType || 'unknown';
    if (!stats.byType[type]) {
      stats.byType[type] = 0;
    }
    stats.byType[type]++;
  });
  
  stats.recentRegistrations = [...registrations]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10);
  
  return stats;
};

/**
 * 分析用のデータを取得
 * @returns {Object} 分析データ
 */
export const getAnalyticsData = () => {
  const analytics = {
    registrationsByType: {},
    registrationsByMonth: {},
    registrationTrends: []
  };
  
  registrations.forEach(reg => {
    const type = reg.registrationType || 'unknown';
    if (!analytics.registrationsByType[type]) {
      analytics.registrationsByType[type] = 0;
    }
    analytics.registrationsByType[type]++;
    
    const date = new Date(reg.createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!analytics.registrationsByMonth[monthKey]) {
      analytics.registrationsByMonth[monthKey] = 0;
    }
    analytics.registrationsByMonth[monthKey]++;
  });
  
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    
    analytics.registrationTrends.unshift({
      month: monthKey,
      count: analytics.registrationsByMonth[monthKey] || 0
    });
  }
  
  return analytics;
};

export default {
  saveRegistration,
  getAllRegistrations,
  getRegistrationById,
  getRegistrationStats,
  getAnalyticsData
};
