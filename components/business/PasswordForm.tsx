/**
 * PasswordForm - 密码表单组件
 * 
 * 功能说明：
 * - 通用的密码修改/重置表单
 * - 支持重置登录密码、修改支付密码、找回密码等场景
 * - 统一的表单验证和提交逻辑
 * 
 * 可合并的页面：
 * - ResetLoginPassword.tsx
 * - ResetPayPassword.tsx
 * - ForgotPassword.tsx
 * 
 * @author 树交所前端团队
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { LoadingSpinner } from '../common';
import {
    updatePassword,
    updatePayPassword,
    retrievePassword,
    AUTH_TOKEN_KEY,
    USER_INFO_KEY,
} from '../../services/api';
import { sendSmsCode } from '../../services/common';

/**
 * 表单类型枚举
 */
type FormType = 'reset_login' | 'reset_pay' | 'forgot';

/**
 * PasswordForm 组件属性接口
 */
interface PasswordFormProps {
    /** 表单类型 */
    type: FormType;
    /** 页面标题 */
    title: string;
    /** 返回回调 */
    onBack: () => void;
    /** 跳转找回密码回调 (可选) */
    onNavigateForgotPassword?: () => void;
}

/**
 * 根据表单类型获取配置
 */
const getFormConfig = (type: FormType) => {
    switch (type) {
        case 'reset_login':
            return {
                oldLabel: '请输入旧密码',
                oldPlaceholder: '请输入旧密码',
                newLabel: '请输入新密码',
                newPlaceholder: '请输入新密码',
                confirmLabel: '再次输入新密码',
                confirmPlaceholder: '请再次输入新密码',
                submitText: '重置登录密码',
                minLength: 6,
                showPhone: false,
                showCode: false,
            };
        case 'reset_pay':
            return {
                oldLabel: '请输入旧支付密码',
                oldPlaceholder: '请输入旧支付密码',
                newLabel: '请输入新支付密码',
                newPlaceholder: '请输入新支付密码',
                confirmLabel: '再次输入新支付密码',
                confirmPlaceholder: '请再次输入新支付密码',
                submitText: '确认修改',
                minLength: 6,
                showPhone: false,
                showCode: false,
            };
        case 'forgot':
            return {
                oldLabel: '',
                oldPlaceholder: '',
                newLabel: '新密码',
                newPlaceholder: '请设置新的登录密码，至少 6 位',
                confirmLabel: '',
                confirmPlaceholder: '',
                submitText: '确认重置',
                minLength: 6,
                showPhone: true,
                showCode: true,
            };
        default:
            return {
                oldLabel: '请输入旧密码',
                oldPlaceholder: '请输入旧密码',
                newLabel: '请输入新密码',
                newPlaceholder: '请输入新密码',
                confirmLabel: '再次输入新密码',
                confirmPlaceholder: '请再次输入新密码',
                submitText: '确认',
                minLength: 6,
                showPhone: false,
                showCode: false,
            };
    }
};

/**
 * PasswordForm 密码表单组件
 * 
 * @example
 * // 重置登录密码
 * <PasswordForm
 *   type="reset_login"
 *   title="重置登录密码"
 *   onBack={() => navigate(-1)}
 * />
 * 
 * @example
 * // 修改支付密码
 * <PasswordForm
 *   type="reset_pay"
 *   title="修改支付密码"
 *   onBack={() => navigate(-1)}
 * />
 */
const PasswordForm: React.FC<PasswordFormProps> = ({
    type,
    title,
    onBack,
    onSuccess,
    onNavigateForgotPassword,
}) => {
    // 获取表单配置
    const config = getFormConfig(type);

    // 表单状态
    const [phone, setPhone] = useState('');
    const [code, setCode] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [countdown, setCountdown] = useState(0);

    /**
     * 发送验证码（找回密码场景）
     */
    const handleSendCode = async () => {
        const phoneRegex = /^1[3-9]\d{9}$/;
        if (!phoneRegex.test(phone.trim())) {
            alert('请输入正确的手机号');
            return;
        }
        
        try {
            await sendSmsCode({
                mobile: phone.trim(),
                event: 'retrieve_password'
            });
            alert('验证码已发送');
            setCountdown(60);
            
            // Start countdown timer
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch (error: any) {
            alert(error.message || error.msg || '发送验证码失败');
        }
    };

    /**
     * 提交表单
     */
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        const trimmedNewPassword = newPassword.trim();

        // 验证找回密码场景
        if (type === 'forgot') {
            const trimmedPhone = phone.trim();
            const trimmedCode = code.trim();

            if (!trimmedPhone || !trimmedCode || !trimmedNewPassword) {
                setError('请完整填写手机号、验证码和新密码');
                return;
            }

            const phoneRegex = /^1[3-9]\d{9}$/;
            if (!phoneRegex.test(trimmedPhone)) {
                setError('请输入正确的手机号');
                return;
            }

            if (trimmedNewPassword.length < config.minLength) {
                setError(`新密码长度至少 ${config.minLength} 位`);
                return;
            }

            setError('');
            setLoading(true);

            try {
                await retrievePassword({
                    mobile: trimmedPhone,
                    captcha: trimmedCode,
                    newpassword: trimmedNewPassword
                });
                alert('重置密码成功，请使用新密码重新登录');
                onSuccess?.();
                onBack();
            } catch (error: any) {
                const message = error.msg || error.message || '重置密码失败，请检查验证码是否正确';
                setError(message);
            } finally {
                setLoading(false);
            }
            return;
        }

        // 验证修改密码场景
        const trimmedOldPassword = oldPassword.trim();
        const trimmedConfirm = confirmPassword.trim();

        if (!trimmedOldPassword || !trimmedNewPassword || !trimmedConfirm) {
            setError('请完整填写所有字段');
            return;
        }

        if (trimmedNewPassword.length < config.minLength) {
            setError(`新密码长度至少需要 ${config.minLength} 位`);
            return;
        }

        if (trimmedNewPassword !== trimmedConfirm) {
            setError('两次输入的新密码不一致');
            return;
        }

        setError('');
        setLoading(true);

        try {
            if (type === 'reset_login') {
                // 重置登录密码
                const response = await updatePassword({
                    old_password: trimmedOldPassword,
                    new_password: trimmedNewPassword,
                });

                // 清理本地登录态，强制重新登录
                localStorage.removeItem(AUTH_TOKEN_KEY);
                localStorage.removeItem(USER_INFO_KEY);

                alert(response?.msg || '登录密码重置成功，请使用新密码重新登录');
                onSuccess?.();
                onBack();
            } else if (type === 'reset_pay') {
                // 修改支付密码
                const response = await updatePayPassword({
                    old_pay_password: trimmedOldPassword,
                    new_pay_password: trimmedNewPassword,
                });

                alert(response?.msg || '支付密码修改成功');
                onSuccess?.();
                onBack();
            }
        } catch (err: any) {
            const message =
                err?.msg || err?.message || err?.data?.msg || '操作失败，请稍后重试';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-safe">
            {/* 顶部导航栏 */}
            <header className="bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                <div className="relative flex items-center justify-center w-full">
                    <button
                        className="absolute left-0 p-1 active:opacity-70"
                        onClick={onBack}
                        aria-label="返回"
                    >
                        <ChevronLeft size={22} className="text-gray-800" />
                    </button>
                    <h1 className="text-base font-bold text-gray-900">{title}</h1>

                    {/* 忘记密码按钮 (仅在重置登录密码或支付密码时显示) */}
                    {(type === 'reset_login' || type === 'reset_pay') && onNavigateForgotPassword && (
                        <button
                            type="button"
                            className="absolute right-0 text-sm text-orange-500 font-medium active:opacity-70"
                            onClick={onNavigateForgotPassword}
                        >
                            忘记密码？
                        </button>
                    )}
                </div>
            </header>

            {/* 表单内容 */}
            <main className="px-4 pt-6">
                <div className="rounded-xl bg-white p-4 shadow-sm">
                    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                        {/* 手机号输入（找回密码场景） */}
                        {config.showPhone && (
                            <label className="text-sm text-gray-800">
                                <span className="mb-2 block font-medium">手机号</span>
                                <input
                                    type="tel"
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
                                    placeholder="请输入注册时使用的手机号"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    disabled={loading}
                                />
                            </label>
                        )}

                        {/* 验证码输入（找回密码场景） */}
                        {config.showCode && (
                            <div className="flex items-center gap-3">
                                <div className="flex-1">
                                    <label className="text-sm text-gray-800">
                                        <span className="mb-2 block font-medium">验证码</span>
                                        <input
                                            type="text"
                                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
                                            placeholder="请输入短信验证码"
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                            disabled={loading}
                                        />
                                    </label>
                                </div>
                                <button
                                    type="button"
                                    className={`mt-6 whitespace-nowrap rounded-lg border px-3 py-2 text-xs font-medium ${countdown > 0
                                            ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                                            : 'border-orange-500 text-orange-500 active:opacity-80'
                                        }`}
                                    onClick={handleSendCode}
                                    disabled={loading || countdown > 0}
                                >
                                    {countdown > 0 ? `${countdown}s 后重试` : '获取验证码'}
                                </button>
                            </div>
                        )}

                        {/* 旧密码输入 */}
                        {config.oldLabel && (
                            <label className="text-sm text-gray-800">
                                <span className="mb-2 block font-medium">{config.oldLabel}</span>
                                <input
                                    type="password"
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
                                    placeholder={config.oldPlaceholder}
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    disabled={loading}
                                />
                            </label>
                        )}

                        {/* 新密码输入 */}
                        <label className="text-sm text-gray-800">
                            <span className="mb-2 block font-medium">{config.newLabel}</span>
                            <input
                                type="password"
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
                                placeholder={config.newPlaceholder}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                disabled={loading}
                            />
                        </label>

                        {/* 确认新密码输入 */}
                        {config.confirmLabel && (
                            <label className="text-sm text-gray-800">
                                <span className="mb-2 block font-medium">{config.confirmLabel}</span>
                                <input
                                    type="password"
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
                                    placeholder={config.confirmPlaceholder}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    disabled={loading}
                                />
                            </label>
                        )}

                        {/* 错误提示 */}
                        {error && (
                            <p className="text-xs text-red-500" role="alert">
                                {error}
                            </p>
                        )}

                        {/* 提交按钮 */}
                        <button
                            type="submit"
                            className="mt-2 w-full rounded-lg bg-orange-500 py-3 text-sm font-semibold text-white active:opacity-80 disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? '提交中...' : config.submitText}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default PasswordForm;
