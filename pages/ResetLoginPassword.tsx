import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { AUTH_TOKEN_KEY, USER_INFO_KEY, updatePassword } from '../services/api';

interface ResetLoginPasswordProps {
  onBack: () => void;
}

const ResetLoginPassword: React.FC<ResetLoginPasswordProps> = ({ onBack }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const trimmedOldPassword = oldPassword.trim();
    const trimmedNewPassword = newPassword.trim();
    const trimmedConfirm = confirmPassword.trim();

    if (!trimmedOldPassword || !trimmedNewPassword || !trimmedConfirm) {
      setError('请完整填写所有字段');
      return;
    }

    if (trimmedNewPassword.length < 6) {
      setError('新密码长度至少需要 6 位');
      return;
    }

    if (trimmedNewPassword !== trimmedConfirm) {
      setError('两次输入的新密码不一致');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // 后端暂未提供验证码字段，先复用 old_password 透传给 /User/updatePassword
      const response = await updatePassword({
        old_password: trimmedOldPassword,
        new_password: trimmedNewPassword,
      });

      // 修改登录密码成功后清理本地登录态，强制用户重新登录
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(USER_INFO_KEY);

      alert(response?.msg || '登录密码重置成功，请使用新密码重新登录');
      onBack();
    } catch (err: any) {
      const message =
        err?.msg || err?.message || err?.data?.msg || '重置登录密码失败，请稍后重试';
      setError(message);
    } finally {
      setLoading(false);
    }
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
        <h1 className="text-base font-bold text-gray-900">重置登录密码</h1>
      </header>

      <main className="px-4 pt-6">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <label className="text-sm text-gray-800">
              <span className="mb-2 block font-medium">请输入旧密码</span>
              <input
                type="password"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
                placeholder="请输入旧密码"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                disabled={loading}
              />
            </label>

            <label className="text-sm text-gray-800">
              <span className="mb-2 block font-medium">请输入新密码</span>
              <input
                type="password"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
                placeholder="请输入新密码"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
              />
            </label>

            <label className="text-sm text-gray-800">
              <span className="mb-2 block font-medium">再次输入新密码</span>
              <input
                type="password"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
                placeholder="请再次输入新密码"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </label>
            {error && <p className="text-xs text-red-500" role="alert">{error}</p>}

            <button
              type="submit"
              className="mt-2 w-full rounded-lg bg-orange-500 py-3 text-sm font-semibold text-white active:opacity-80 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? '提交中...' : '重置登录密码'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ResetLoginPassword;

