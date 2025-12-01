import React, { useState } from 'react';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react';
import { login as loginApi, LoginParams } from '../services/api';
import { LoginSuccessPayload } from '../types';

interface LoginProps {
  onLogin: (payload?: LoginSuccessPayload) => void;
  onNavigateRegister: () => void;
  onNavigateUserAgreement: () => void;
  onNavigatePrivacyPolicy: () => void;
  onNavigateForgotPassword: () => void;
}

const Login: React.FC<LoginProps> = ({
  onLogin,
  onNavigateRegister,
  onNavigateUserAgreement,
  onNavigatePrivacyPolicy,
  onNavigateForgotPassword,
}) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone || !password) {
      alert('请输入手机号和密码');
      return;
    }
    if (!agreed) {
      alert('请阅读并同意用户协议');
      return;
    }

    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      alert('请输入正确的手机号');
      return;
    }

    setLoading(true);
    try {
      const params: LoginParams = {
        mobile: phone,
        password,
      };
      const response = await loginApi(params);
      console.log('登录接口响应:', response);

      if (response.code === 1) {
        const token = response.data?.userInfo?.token;
        if (!token) {
          alert('登录成功，但未获取到 token，无法继续');
          return;
        }
        alert(response.msg || '登录成功');
        onLogin({
          token,
          userInfo: response.data?.userInfo || null,
        });
      } else {
        const errorMsg = response.msg || response.message || '登录失败，请稍后重试';
        alert(errorMsg);
      }
    } catch (error: any) {
      console.error('登录失败:', error);
      if (error.isCorsError) {
        alert(error.message);
      } else if (error.message) {
        alert(`登录失败: ${error.message}`);
      } else {
        alert('登录失败，请检查网络连接后重试');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col px-8 pt-12 pb-safe">
      {/* Header */}
      <div className="flex items-center mb-10 relative">
        <button className="absolute left-0 -ml-2 p-2">
          <ChevronLeft size={24} className="text-gray-800" />
        </button>
        <h1 className="text-lg font-bold text-gray-900 w-full text-center">登录</h1>
      </div>

      {/* Logo */}
      <div className="flex flex-col items-center mb-12">
        <div className="w-24 h-24 mb-6">
           {/* Custom SVG to mimic the red logo in the screenshot */}
           <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
              <rect x="10" y="10" width="80" height="80" rx="10" fill="none" stroke="#b91c1c" strokeWidth="6" />
              <path d="M30 30 L70 30 L70 40 L55 50 L70 60 L70 70 L30 70 L30 60 L45 50 L30 40 Z" fill="#b91c1c" />
              <path d="M30 30 L30 70 M70 30 L70 70" stroke="#b91c1c" strokeWidth="2" fill="none" />
           </svg>
        </div>
        <h2 className="text-lg font-bold text-gray-900 tracking-wide">欢迎登录数权中心</h2>
      </div>

      {/* Form */}
      <div className="space-y-6 mb-6">
        <div className="border-b border-gray-200 py-2">
          <input 
            type="tel" 
            placeholder="请输入手机号" 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full text-base outline-none placeholder-gray-400 py-2 bg-transparent"
          />
        </div>
        <div className="border-b border-gray-200 py-2 relative flex items-center">
          <input 
            type={showPassword ? "text" : "password"} 
            placeholder="请输入您的密码" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full text-base outline-none placeholder-gray-400 py-2 bg-transparent pr-8"
          />
          {password && (
             <button onClick={() => setShowPassword(!showPassword)} className="text-gray-400">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
             </button>
          )}
        </div>
      </div>

      {/* Options */}
      <div className="flex justify-between items-center mb-8 text-sm">
        <label className="flex items-center text-gray-500 gap-2 cursor-pointer">
           <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
           <span>记住账号</span>
        </label>
        <button
          type="button"
          className="text-blue-500"
          onClick={onNavigateForgotPassword}
        >
          忘记密码?
        </button>
      </div>

      {/* Login Button */}
      <button 
        onClick={handleLogin}
        disabled={loading}
        className="w-full bg-blue-500 text-white font-bold py-3.5 rounded-lg shadow-blue-200 shadow-lg active:scale-[0.99] transition-transform mb-6 text-base disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? '登录中...' : '登录'}
      </button>

      {/* Agreement */}
      <div className="flex items-start gap-2 text-xs text-gray-500 mb-12">
         <div 
            className={`w-4 h-4 rounded border flex-shrink-0 mt-0.5 flex items-center justify-center cursor-pointer transition-colors ${agreed ? 'bg-blue-500 border-blue-500' : 'border-gray-300 bg-white'}`}
            onClick={() => setAgreed(!agreed)}
         >
            {agreed && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
         </div>
         <div className="leading-5">
            阅读并同意{' '}
            <button
              type="button"
              className="text-blue-500 underline-offset-2"
              onClick={onNavigateUserAgreement}
            >
              《用户协议》
            </button>{' '}
            及{' '}
            <button
              type="button"
              className="text-blue-500 underline-offset-2"
              onClick={onNavigatePrivacyPolicy}
            >
              《隐私政策》
            </button>
         </div>
      </div>

      {/* Register Link */}
      <div className="mt-auto text-center pb-8">
        <span className="text-gray-400 text-sm">没有账号? </span>
        <button onClick={onNavigateRegister} className="text-blue-500 text-sm font-medium">点击注册</button>
      </div>
    </div>
  );
};

export default Login;