import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const registrationTypes = [
  { value: 'child', label: '子ども' },
  { value: 'parent', label: '保護者' },
  { value: 'volunteer', label: 'ボランティア' },
  { value: 'supporter', label: '支援者・協力者' },
  { value: 'feedback', label: 'ご意見・ご要望' }
];

const Registration = () => {
  const [formData, setFormData] = useState({
    registrationType: '',
    fullName: '',
    furigana: '',
    email: '',
    phone: '',
    address: '',
    privacyAgreed: false
  });
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, privacyAgreed: e.target.checked }));
  };
  
  const handleRegistrationTypeSelect = (value: string) => {
    setFormData(prev => ({ ...prev, registrationType: value }));
    setDropdownOpen(false);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.registrationType) {
      toast.error('登録種別を選択してください');
      return;
    }
    
    if (!formData.privacyAgreed) {
      toast.error('個人情報の取り扱いについて同意してください');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const response = await axios.post('/api/registration', formData);
      
      if (response.status === 200 || response.status === 201) {
        toast.success('登録が完了しました。ありがとうございます！');
        setFormData({
          registrationType: '',
          fullName: '',
          furigana: '',
          email: '',
          phone: '',
          address: '',
          privacyAgreed: false
        });
      }
    } catch (error) {
      console.error('登録エラー:', error);
      toast.error('登録中にエラーが発生しました。後でもう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderFormSection = () => {
    if (!formData.registrationType || formData.registrationType === '') {
      return null;
    }
    
    switch (formData.registrationType) {
      case 'child':
        return <ChildFormSection />;
      case 'parent':
        return <ParentFormSection />;
      case 'volunteer':
        return <VolunteerFormSection />;
      case 'supporter':
        return <SupporterFormSection />;
      case 'feedback':
        return <FeedbackFormSection />;
      default:
        return null;
    }
  };
  
  const ChildFormSection = () => (
    <div className="mt-4">
      <h3 className="text-lg font-medium mb-4">子ども情報</h3>
      {/* 子ども向けのフォームフィールド */}
    </div>
  );
  
  const ParentFormSection = () => (
    <div className="mt-4">
      <h3 className="text-lg font-medium mb-4">保護者情報</h3>
      {/* 保護者向けのフォームフィールド */}
    </div>
  );
  
  const VolunteerFormSection = () => (
    <div className="mt-4">
      <h3 className="text-lg font-medium mb-4">ボランティア情報</h3>
      {/* ボランティア向けのフォームフィールド */}
    </div>
  );
  
  const SupporterFormSection = () => (
    <div className="mt-4">
      <h3 className="text-lg font-medium mb-4">支援者・協力者情報</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">お名前 (任意)</label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">お名前（ふりがな） (任意)</label>
        <input
          type="text"
          name="furigana"
          value={formData.furigana}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">メールアドレス (任意)</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">電話番号 (任意)</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">住所 (任意)</label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded h-24"
        />
      </div>
    </div>
  );
  
  const FeedbackFormSection = () => (
    <div className="mt-4">
      <h3 className="text-lg font-medium mb-4">ご意見・ご要望</h3>
      {/* ご意見・ご要望向けのフォームフィールド */}
    </div>
  );
  
  return (
    <div className="min-h-screen bg-blue-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-center text-blue-600 mb-8">まなびキッチン登録フォーム</h1>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-medium mb-2">参加登録</h3>
            <p className="text-sm text-gray-600 mb-6">参加希望の方は、以下のフォームに必要事項を入力してください。</p>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1">
                  登録種別 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    className="w-full p-2 text-left border border-gray-300 rounded flex justify-between items-center"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    <span>
                      {formData.registrationType 
                        ? registrationTypes.find(type => type.value === formData.registrationType)?.label 
                        : '登録種別を選択'}
                    </span>
                    <svg 
                      className={`w-5 h-5 transition-transform ${dropdownOpen ? 'transform rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {dropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg">
                      {registrationTypes.map(type => (
                        <div
                          key={type.value}
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleRegistrationTypeSelect(type.value)}
                        >
                          {type.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">どのような形で参加を希望されるか選択してください</p>
              </div>
              
              {renderFormSection()}
              
              <div className="mt-6 mb-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="privacy"
                      name="privacy"
                      type="checkbox"
                      checked={formData.privacyAgreed}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3">
                    <label htmlFor="privacy" className="text-sm font-medium">
                      個人情報の取り扱いについて <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      お預かりした個人情報は、まなびキッチンの活動に関する連絡以外の目的で使用いたしません。
                      また、法令に基づく場合を除き、ご本人の同意なく第三者に提供することはありません。<br />
                      ※この事業は令和7年度東大阪市地域まちづくり活動助成金の交付を受けて実施しています。
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-150 ease-in-out disabled:opacity-50"
                >
                  {isSubmitting ? '送信中...' : '送信する'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registration;
