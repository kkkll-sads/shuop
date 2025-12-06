/**
 * AccountDeletion - 账户注销页面
 * 
 * 使用 PageContainer 布局组件重构
 * 使用 ConfirmModal 确认弹窗
 * 
 * @author 树交所前端团队
 * @version 2.0.0
 */

import React, { useState } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import { ConfirmModal } from '../../components/common';
import { AUTH_TOKEN_KEY, USER_INFO_KEY, cancelAccount } from '../../services/api';
import { useModal } from '../../hooks';

/**
 * AccountDeletion 组件属性接口
 */
interface AccountDeletionProps {
  onBack: () => void;
}

/** 注销提示列表 */
const tips = [
  '账户不存在安全状态（没有被盗、被封等风险）；',
  '平台内，您的资产账户已结清；',
  '平台内，您的账户与与三方账号没有绑定关系；',
  '您的所有订单均处于已完成状态。',
];

/**
 * AccountDeletion 账户注销页面组件
 */
const AccountDeletion: React.FC<AccountDeletionProps> = ({ onBack }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 使用 useModal 管理确认弹窗
  const confirmModal = useModal();

  /**
   * 验证表单
   */
  const validateForm = () => {
    const trimmedPassword = password.trim();
    const trimmedConfirm = confirmPassword.trim();

    if (!trimmedPassword || !trimmedConfirm) {
      setError('请填写登录密码并完成二次确认');
      return false;
    }

    if (trimmedPassword !== trimmedConfirm) {
      setError('两次输入的密码不一致');
      return false;
    }

    setError('');
    return true;
  };

  /**
   * 处理提交
   */
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (validateForm()) {
      confirmModal.show();
    }
  };

  /**
   * 确认注销
   */
  const handleConfirmDeletion = async () => {
    confirmModal.hide();
    setLoading(true);

    try {
      const response = await cancelAccount({
        password: password.trim(),
        reason: reason.trim(),
      });

      // 注销成功后清理本地登录态
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(USER_INFO_KEY);

      alert(response?.msg || '您的注销申请已提交，我们将尽快处理。');
      onBack();
    } catch (err: any) {
      const message =
        err?.msg || err?.message || err?.data?.msg || '提交注销申请失败，请稍后重试';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer title="账户注销" onBack={onBack} padding={false}>
      <form className="flex flex-col flex-1" onSubmit={handleSubmit}>
        <main className="px-4 pt-4 flex flex-col gap-3 flex-1">
          {/* 注销提示 */}
          <section className="rounded-xl bg-white shadow-sm border border-gray-100">
            <h2 className="px-4 py-3 text-sm font-semibold text-gray-900 border-b border-gray-100">
              注销提示
            </h2>
            <p className="px-4 py-3 text-xs leading-5 text-gray-600">
              注销成功后，您将无法使用当前账号，相关数据也将被删除无法找回。
            </p>
          </section>

          {/* 注销条件 */}
          <section className="rounded-xl bg-white shadow-sm border border-gray-100">
            <h2 className="px-4 py-3 text-sm font-semibold text-gray-900 border-b border-gray-100">
              注销条件
            </h2>
            <div className="px-4 py-3 text-xs leading-5 text-gray-600">
              <p className="mb-3">
                您提交的注销申请生效前，平台将进行以下验证，以保证您的账户与财产安全：
              </p>
              <ol className="list-decimal pl-4 space-y-2">
                {tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ol>
            </div>
          </section>

          {/* 身份验证 */}
          <section className="rounded-xl bg-white shadow-sm border border-gray-100">
            <h2 className="px-4 py-3 text-sm font-semibold text-gray-900 border-b border-gray-100">
              身份验证
            </h2>
            <div className="px-4 py-3 flex flex-col gap-4">
              <label className="text-sm text-gray-800">
                <span className="mb-2 block font-medium">请输入登录密码</span>
                <input
                  type="password"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
                  placeholder="请输入登录密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </label>

              <label className="text-sm text-gray-800">
                <span className="mb-2 block font-medium">再次输入密码确认注销</span>
                <input
                  type="password"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
                  placeholder="请再次输入登录密码"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </label>

              <label className="text-sm text-gray-800">
                <span className="mb-2 block font-medium">注销原因（选填）</span>
                <textarea
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
                  placeholder="请输入注销原因，我们将用于优化体验"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  disabled={loading}
                />
              </label>

              {error && (
                <p className="text-xs text-red-500" role="alert">
                  {error}
                </p>
              )}
            </div>
          </section>
        </main>

        {/* 提交按钮 */}
        <div className="px-4 pt-6 pb-6">
          <button
            type="submit"
            className="w-full rounded-lg bg-orange-500 py-3 text-sm font-semibold text-white shadow-sm active:opacity-80 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? '提交中...' : '确认注销'}
          </button>
        </div>
      </form>

      {/* 确认弹窗 */}
      <ConfirmModal
        open={confirmModal.open}
        title="确认注销账户"
        content="确认提交账号注销申请？确认后账号将无法恢复。"
        confirmText="确认注销"
        cancelText="取消"
        type="danger"
        onConfirm={handleConfirmDeletion}
        onCancel={confirmModal.hide}
      />
    </PageContainer>
  );
};

export default AccountDeletion;
