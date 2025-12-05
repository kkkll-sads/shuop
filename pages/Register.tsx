import React, { useState, useEffect } from 'react';
import { ChevronLeft, XCircle, User, Lock, Smartphone, CreditCard, ShieldCheck, Check } from 'lucide-react';
import { register, RegisterParams } from '../services/api';

interface RegisterProps {
  onBack: () => void;
  onRegisterSuccess: () => void;
  onNavigateUserAgreement: () => void;
  onNavigatePrivacyPolicy: () => void;
}

const Register: React.FC<RegisterProps> = ({
  onBack,
  onRegisterSuccess,
  onNavigateUserAgreement,
  onNavigatePrivacyPolicy,
}) => {
  // 从URL参数中获取邀请码
  const getInviteCodeFromUrl = () => {
    if (typeof window === 'undefined') return '';
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('invite_code') || '';
  };

  const [inviteCode, setInviteCode] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [payPassword, setPayPassword] = useState('');
  const [verifyCode, setVerifyCode] = useState('888888');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  // 组件加载时，从URL参数中读取邀请码并自动填充
  useEffect(() => {
    const urlInviteCode = getInviteCodeFromUrl();
    if (urlInviteCode) {
      setInviteCode(urlInviteCode);
    }
  }, []);

  const handleRegister = async () => {
    if (!phone || !password || !payPassword || !verifyCode) {
      alert('请填写完整信息');
      return;
    }
    if (!agreed) {
      alert('请阅读并同意用户协议');
      return;
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      alert('请输入正确的手机号');
      return;
    }

    setLoading(true);
    try {
      const params: RegisterParams = {
        mobile: phone,
        password: password,
        pay_password: payPassword,
        invite_code: inviteCode,
      };

      const response = await register(params);

      // 打印完整响应用于调试
      console.log('注册接口响应:', response);
      console.log('响应 code:', response.code);
      console.log('响应 msg:', response.msg);
      console.log('响应 data:', response.data);

      // 判断注册是否成功
      // 根据 API 响应：code === 1 表示成功，code === 0 表示失败
      const isSuccess = response.code === 1;

      if (isSuccess) {
        alert('注册成功！');
        onRegisterSuccess();
      } else {
        // 显示服务器返回的错误消息
        const errorMsg = response.msg || response.message || '注册失败，请稍后重试';
        alert(errorMsg);
      }
    } catch (error: any) {
      console.error('注册失败:', error);
      // 显示更详细的错误信息
      if (error.isCorsError) {
        alert(error.message);
      } else if (error.message) {
        alert(`注册失败: ${error.message}`);
      } else {
        alert('注册失败，请检查网络连接后重试');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-6 pt-8 pb-safe bg-gradient-to-br from-[#FFD6A5] via-[#FFC3A0] to-[#FFDEE9]">
      {/* Header */}
      <div className="flex items-center mb-8 relative">
        <button onClick={onBack} className="absolute left-0 -ml-2 p-2">
          <ChevronLeft size={24} className="text-gray-800" />
        </button>
        <h1 className="text-lg font-bold text-gray-900 w-full text-center">注册</h1>
      </div>

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Hello!</h2>
        <h3 className="text-xl font-bold text-gray-700">欢迎注册树交所</h3>
      </div>

      <div className="space-y-4 mb-8">
        {/* Invite Code */}
        <div className="bg-white rounded-lg flex items-center px-4 py-3 shadow-sm">
          <User className="text-gray-500 mr-3" size={20} />
          <input
            type="text"
            value={inviteCode}
            placeholder="请输入邀请码"
            onChange={(e) => setInviteCode(e.target.value)}
            className="flex-1 text-base outline-none placeholder-gray-400 bg-transparent text-gray-800"
          />
          {inviteCode && (
            <button onClick={() => setInviteCode('')} className="text-gray-300 ml-2">
              <XCircle size={18} fill="#9ca3af" className="text-white" />
            </button>
          )}
        </div>

        {/* Phone */}
        <div className="bg-white rounded-lg flex items-center px-4 py-3 shadow-sm">
          <Smartphone className="text-gray-500 mr-3" size={20} />
          <input
            type="tel"
            placeholder="请输入手机号"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="flex-1 text-base outline-none placeholder-gray-400 bg-transparent text-gray-800"
          />
        </div>

        {/* Password */}
        <div className="bg-white rounded-lg flex items-center px-4 py-3 shadow-sm">
          <Lock className="text-gray-500 mr-3" size={20} />
          <input
            type="password"
            placeholder="设置登录密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="flex-1 text-base outline-none placeholder-gray-400 bg-transparent text-gray-800"
          />
        </div>

        {/* Payment Password */}
        <div className="bg-white rounded-lg flex items-center px-4 py-3 shadow-sm">
          <CreditCard className="text-gray-500 mr-3" size={20} />
          <input
            type="password"
            placeholder="设置支付密码"
            value={payPassword}
            onChange={(e) => setPayPassword(e.target.value)}
            className="flex-1 text-base outline-none placeholder-gray-400 bg-transparent text-gray-800"
          />
        </div>

        {/* Verification Code */}
        <div className="bg-white rounded-lg flex items-center px-4 py-3 shadow-sm">
          <ShieldCheck className="text-gray-500 mr-3" size={20} />
          <input
            type="text"
            placeholder="请输入验证码"
            value={verifyCode}
            onChange={(e) => setVerifyCode(e.target.value)}
            className="flex-1 text-base outline-none placeholder-gray-400 bg-transparent text-gray-800"
          />
          <button className="text-orange-500 text-sm font-medium whitespace-nowrap pl-3 border-l border-gray-200">
            获取验证码
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <div className="mb-6">
        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#FF9966] to-[#FF5E62] text-white font-bold py-3.5 rounded-full shadow-lg shadow-orange-200 active:scale-[0.98] transition-all text-lg tracking-wide disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? '注册中...' : '完成并登录'}
        </button>
      </div>

      {/* Agreement */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-600 mb-8">
        <div
          className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center cursor-pointer transition-colors ${agreed ? 'bg-orange-500 border-orange-500' : 'border-gray-400 bg-transparent'}`}
          onClick={() => setAgreed(!agreed)}
        >
          {agreed && <Check size={12} className="text-white" />}
        </div>
        <div className="leading-none flex items-center flex-wrap">
          <span>阅读并同意</span>
          <button
            type="button"
            className="text-orange-500 mx-0.5"
            onClick={onNavigateUserAgreement}
          >
            《用户协议》
          </button>
          <span>及</span>
          <button
            type="button"
            className="text-orange-500 mx-0.5"
            onClick={onNavigatePrivacyPolicy}
          >
            《隐私政策》
          </button>
        </div>
      </div>

      {/* Download App Link */}
      <div className="text-center pb-4 mt-auto">
        <button className="text-orange-600 text-sm font-medium">点击下载APP</button>
      </div>
    </div>
  );
};

export default Register;
