/**
 * ServiceRecharge - 服务充值页面
 * 
 * 使用 PageContainer、LoadingSpinner 组件重构
 * 使用 formatAmount 工具函数
 * 
 * @author 树交所前端团队
 * @version 2.0.0
 */

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import { rechargeServiceFee, fetchProfile, AUTH_TOKEN_KEY, USER_INFO_KEY } from '../../services/api';
import { UserInfo } from '../../types';
import { formatAmount } from '../../utils/format';

/**
 * ServiceRecharge 组件属性接口
 */
interface ServiceRechargeProps {
  onBack: () => void;
}

/**
 * ServiceRecharge 服务充值页面组件
 */
const ServiceRecharge: React.FC<ServiceRechargeProps> = ({ onBack }) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(() => {
    try {
      const cached = localStorage.getItem(USER_INFO_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.warn('解析本地用户信息失败:', error);
      return null;
    }
  });

  const [payType, setPayType] = useState<'money' | 'withdraw'>('money');
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 加载用户信息
  useEffect(() => {
    const loadUserInfo = async () => {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!token) return;

      try {
        const response = await fetchProfile(token);
        if (response.code === 1 && response.data?.userInfo) {
          setUserInfo(response.data.userInfo);
          localStorage.setItem(USER_INFO_KEY, JSON.stringify(response.data.userInfo));
        }
      } catch (err) {
        console.error('获取用户信息失败:', err);
      }
    };

    loadUserInfo();
  }, []);

  /**
   * 处理充值
   */
  const handleRecharge = async () => {
    setError(null);
    setSuccess(null);

    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      setError('未找到用户登录信息，请先登录');
      return;
    }

    const rechargeAmount = Number(amount);
    if (!amount || rechargeAmount <= 0) {
      setError('请输入有效的充值金额');
      return;
    }

    // 根据支付方式检查余额
    const currentBalance = payType === 'money'
      ? Number(userInfo?.balance_available || 0)
      : Number(userInfo?.withdrawable_money || 0);

    if (rechargeAmount > currentBalance) {
      setError(`${payType === 'money' ? '可用余额' : '提现余额'}不足`);
      return;
    }

    setLoading(true);

    try {
      // 使用新的充值接口
      const response = await rechargeServiceFee({
        amount: rechargeAmount,
        source: payType === 'withdraw' ? 'withdrawable_money' : undefined,
        token,
      });

      if (response.code === 1) {
        setSuccess('充值成功');
        setAmount('');

        // 更新用户信息
        const updatedResponse = await fetchProfile(token);
        if (updatedResponse.code === 1 && updatedResponse.data?.userInfo) {
          setUserInfo(updatedResponse.data.userInfo);
          localStorage.setItem(USER_INFO_KEY, JSON.stringify(updatedResponse.data.userInfo));
        }

        // 3秒后清除成功提示
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } else {
        setError(response.msg || '充值失败');
      }
    } catch (err: any) {
      console.error('充值失败:', err);
      setError(err?.msg || err?.message || '充值失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer title="服务充值" onBack={onBack}>
      {/* 余额显示 */}
      <div className="bg-white rounded-xl p-4 shadow-sm space-y-2 mb-4">
        <div className="text-xs text-gray-500">当前服务费余额 (元)</div>
        <div className="text-2xl font-bold text-gray-900">
          {formatAmount(userInfo?.service_fee_balance)}
        </div>
        <div className="text-[11px] text-gray-400">
          服务费主要用于平台服务、技术维护等相关支出，具体扣费规则以服务协议为准。
        </div>
      </div>

      {/* 充值表单 */}
      <div className="bg-white rounded-xl p-4 shadow-sm space-y-4 mb-4">
        {/* 充值金额 */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">充值金额 (元)</label>
          <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50 mb-1">
            <span className="text-gray-500 mr-1">¥</span>
            <input
              type="number"
              placeholder="请输入充值金额"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError(null);
              }}
              className="flex-1 bg-transparent outline-none text-gray-900 text-sm"
              disabled={loading}
            />
          </div>
          <div className="text-xs text-gray-400">
            可用余额: {formatAmount(userInfo?.balance_available)}
          </div>
        </div>

        {/* 支付方式 */}
        <div>
          <label className="block text-xs text-gray-500 mb-2">支付方式</label>
          <div className="grid grid-cols-2 gap-4 mb-1">
            <button
              onClick={() => setPayType('money')}
              className={`py-3 rounded-lg border text-sm font-medium transition-all ${payType === 'money'
                ? 'border-orange-500 bg-orange-50 text-orange-600'
                : 'border-gray-200 text-gray-600'
                }`}
            >
              可用余额支付
            </button>
            <button
              onClick={() => setPayType('withdraw')}
              className={`py-3 rounded-lg border text-sm font-medium transition-all ${payType === 'withdraw'
                ? 'border-orange-500 bg-orange-50 text-orange-600'
                : 'border-gray-200 text-gray-600'
                }`}
            >
              提现余额支付
            </button>
          </div>
          <div className="text-xs text-gray-400">
            可用余额: {formatAmount(payType === 'money' ? userInfo?.balance_available : userInfo?.withdrawable_money)}
          </div>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600 mb-4">
          {error}
        </div>
      )}

      {/* 成功提示 */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-600 mb-4">
          {success}
        </div>
      )}

      {/* 提示文字 */}
      <p className="text-xs text-gray-400 leading-relaxed mb-4">
        完成充值即视为同意相关服务协议与费用说明。请在操作前仔细阅读平台公布的服务条款及风险提示。
      </p>

      {/* 提交按钮 */}
      <button
        onClick={handleRecharge}
        disabled={loading || !amount || Number(amount) <= 0}
        className="w-full bg-orange-600 text-white rounded-full py-3 text-sm font-medium active:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {loading ? '充值中...' : '确认充值'}
      </button>
    </PageContainer>
  );
};

export default ServiceRecharge;
