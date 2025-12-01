import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

interface ForgotPasswordProps {
  onBack: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBack }) => {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = () => {
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone.trim())) {
      alert('请输入正确的手机号');
      return;
    }
    // 这里只做界面演示，实际接入短信接口后再调用后端
    alert('验证码已发送到您的手机（演示）');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedPhone = phone.trim();
    const trimmedCode = code.trim();
    const trimmedPassword = newPassword.trim();

    if (!trimmedPhone || !trimmedCode || !trimmedPassword) {
      alert('请完整填写手机号、验证码和新密码');
      return;
    }

    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(trimmedPhone)) {
      alert('请输入正确的手机号');
      return;
    }

    if (trimmedPassword.length < 6) {
      alert('新密码长度至少 6 位');
      return;
    }

    setLoading(true);
    // 暂无后端接口，这里仅做前端提示
    setTimeout(() => {
      alert('重置密码成功（演示），请使用新密码重新登录');
      setLoading(false);
      onBack();
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      <header className="bg-white px-4 py-3 flex items-center justify-center sticky top-0 z-10 shadow-sm">
        <button
          className="absolute left-0 ml-1 p-1 active:opacity-70"
          onClick={onBack}
          aria-label="返回"
        >
          <ChevronLeft size={22} className="text-gray-800" />
        </button>
        <h1 className="text-base font-bold text-gray-900">找回登录密码</h1>
      </header>

      <main className="px-4 pt-6">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <label className="text-sm text-gray-800">
              <span className="mb-2 block font-medium">手机号</span>
              <input
                type="tel"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                placeholder="请输入注册时使用的手机号"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
              />
            </label>

            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-sm text-gray-800">
                  <span className="mb-2 block font-medium">验证码</span>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    placeholder="请输入短信验证码"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    disabled={loading}
                  />
                </label>
              </div>
              <button
                type="button"
                className="mt-6 whitespace-nowrap rounded-lg border border-blue-500 px-3 py-2 text-xs font-medium text-blue-500 active:opacity-80"
                onClick={handleSendCode}
                disabled={loading}
              >
                获取验证码
              </button>
            </div>

            <label className="text-sm text-gray-800">
              <span className="mb-2 block font-medium">新密码</span>
              <input
                type="password"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                placeholder="请设置新的登录密码，至少 6 位"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
              />
            </label>

            <button
              type="submit"
              className="mt-2 w-full rounded-lg bg-blue-500 py-3 text-sm font-semibold text-white active:opacity-80 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? '提交中...' : '确认重置'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ForgotPassword;


