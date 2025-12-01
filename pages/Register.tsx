
import React, { useState } from 'react';
import { ChevronLeft, XCircle } from 'lucide-react';
import { register, RegisterParams } from '../services/api';

interface RegisterProps {
  onBack: () => void;
  onRegisterSuccess: () => void;
}

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
  const [inviteCode, setInviteCode] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [payPassword, setPayPassword] = useState('');
  const [verifyCode, setVerifyCode] = useState('888888');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen bg-gray-50 flex flex-col pb-safe">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center sticky top-0 z-10">
        <button onClick={onBack} className="absolute left-4 p-1">
          <ChevronLeft size={24} className="text-gray-800" />
        </button>
        <h1 className="text-lg font-bold text-gray-900 w-full text-center">注册</h1>
      </div>

      <div className="p-4 m-4 bg-white rounded-xl shadow-sm mt-4">
        {/* Invite Code */}
        <div className="py-3 border-b border-gray-100">
            <div className="text-sm text-gray-800 font-medium mb-2">邀请码</div>
            <div className="flex items-center justify-between">
                <input 
                    type="text" 
                    value={inviteCode}
                    placeholder="请输入邀请码"
                    onChange={(e) => setInviteCode(e.target.value)}
                    className="w-full outline-none text-gray-800 placeholder-gray-400"
                />
                {inviteCode && (
                    <button onClick={() => setInviteCode('')} className="text-gray-400">
                        <XCircle size={18} fill="#9ca3af" className="text-white" />
                    </button>
                )}
            </div>
        </div>

        {/* Phone */}
        <div className="py-3 border-b border-gray-100">
            <div className="text-sm text-gray-800 font-medium mb-2">手机号</div>
            <input 
                type="tel" 
                placeholder="请输入手机号" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full outline-none text-gray-800 placeholder-gray-400 text-sm"
            />
        </div>

        {/* Password */}
        <div className="py-3 border-b border-gray-100">
            <div className="text-sm text-gray-800 font-medium mb-2">密码</div>
            <input 
                type="password" 
                placeholder="请输入密码" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full outline-none text-gray-800 placeholder-gray-400 text-sm"
            />
        </div>

        {/* Payment Password */}
        <div className="py-3 border-b border-gray-100">
            <div className="text-sm text-gray-800 font-medium mb-2">支付密码</div>
            <input 
                type="password" 
                placeholder="请输入支付密码" 
                value={payPassword}
                onChange={(e) => setPayPassword(e.target.value)}
                className="w-full outline-none text-gray-800 placeholder-gray-400 text-sm"
            />
        </div>

        {/* Verification Code */}
        <div className="py-3 border-b border-gray-100">
            <div className="text-sm text-gray-800 font-medium mb-2">验证码</div>
            <div className="flex items-center justify-between">
                <input 
                    type="text" 
                    placeholder="请输入验证码" 
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value)}
                    className="w-full outline-none text-gray-800 placeholder-gray-400 text-sm"
                />
                <button className="text-gray-800 text-sm font-medium whitespace-nowrap pl-3 border-l border-gray-200">
                    获取验证码
                </button>
            </div>
        </div>
        
        {/* Submit Button */}
        <div className="mt-8 mb-4">
            <button 
                onClick={handleRegister}
                disabled={loading}
                className="w-full bg-blue-500 text-white font-bold py-3 rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? '注册中...' : '完成并登录'}
            </button>
        </div>

        {/* Agreement */}
        <div className="flex items-start gap-2 text-xs text-gray-500 mb-8 justify-center">
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

        {/* Download App Link */}
        <div className="text-center pb-2">
            <button className="text-blue-500 text-sm">点击下载APP</button>
        </div>

      </div>
    </div>
  );
};

export default Register;
