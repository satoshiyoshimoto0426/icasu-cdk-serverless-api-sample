/**
 * 登録フォーム関連のAPIルート
 */
import { log } from '../utils/logger.js';
import { saveRegistration, getAllRegistrations, getRegistrationStats, getAnalyticsData } from '../models/Registration.js';

export const setupRegistrationRoutes = (app) => {
  app.post('/api/registration', async (req, res) => {
    try {
      const registrationData = req.body;
      
      if (!registrationData.registrationType) {
        return res.status(400).json({ 
          success: false, 
          message: '登録種別は必須です' 
        });
      }
      
      const savedData = saveRegistration(registrationData);
      
      log(`新規登録データを保存しました: ${savedData.id}`, 2);
      
      return res.status(201).json({
        success: true,
        message: '登録が完了しました',
        data: savedData
      });
    } catch (error) {
      log(`登録データの保存中にエラーが発生しました: ${error.message}`, 0);
      return res.status(500).json({
        success: false,
        message: '登録処理中にエラーが発生しました',
        error: error.message
      });
    }
  });
  
  app.get('/api/registrations', async (req, res) => {
    try {
      const filters = {
        registrationType: req.query.type,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };
      
      const registrations = getAllRegistrations(filters);
      
      return res.status(200).json({
        success: true,
        count: registrations.length,
        data: registrations
      });
    } catch (error) {
      log(`登録データの取得中にエラーが発生しました: ${error.message}`, 0);
      return res.status(500).json({
        success: false,
        message: 'データ取得中にエラーが発生しました',
        error: error.message
      });
    }
  });
  
  app.get('/api/registrations/stats', async (req, res) => {
    try {
      const stats = getRegistrationStats();
      
      return res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      log(`登録統計の取得中にエラーが発生しました: ${error.message}`, 0);
      return res.status(500).json({
        success: false,
        message: '統計データの取得中にエラーが発生しました',
        error: error.message
      });
    }
  });
  
  app.get('/api/registrations/analytics', async (req, res) => {
    try {
      const analyticsData = getAnalyticsData();
      
      return res.status(200).json({
        success: true,
        data: analyticsData
      });
    } catch (error) {
      log(`分析データの取得中にエラーが発生しました: ${error.message}`, 0);
      return res.status(500).json({
        success: false,
        message: '分析データの取得中にエラーが発生しました',
        error: error.message
      });
    }
  });
  
  log('登録フォームAPIルートを設定しました', 2);
};

export default setupRegistrationRoutes;
