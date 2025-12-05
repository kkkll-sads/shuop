import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { rechargeServiceFee, fetchProfile, AUTH_TOKEN_KEY, USER_INFO_KEY } from '../services/api';
import { UserInfo } from '../types';

interface ServiceRechargeProps {
  onBack: () => void;
}

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

  const [amount, setAmount] = useState<string>('');
  const [paymentSource, setPaymentSource] = useState<'balance_available' | 'withdrawable_money'>('balance_available');
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

  const formatAmount = (value?: string | number) => {
    if (value === undefined || value === null) return '0.00';
    const num = Number(value);
    if (Number.isNaN(num)) return String(value);
    return num.toFixed(2);
  };

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

    // 根据选择的支付方式验证余额
    if (paymentSource === 'balance_available') {
      if (rechargeAmount > Number(userInfo?.balance_available || 0)) {
        setError('可用余额不足');
        return;
      }
    } else {
      if (rechargeAmount > Number(userInfo?.withdrawable_money || 0)) {
        setError('提现余额不足');
        return;
      }
    }

    setLoading(true);

    try {
      const response = await rechargeServiceFee({
        amount: rechargeAmount,
        source: paymentSource === 'withdrawable_money' ? 'withdrawable_money' : undefined,
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
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white px-4 py-3 flex items-center sticky top-0 z-10 shadow-sm">
        <button onClick={onBack} className="absolute left-4 p-1">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-gray-800 w-full text-center">服务充值</h1>
      </header>

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-2">
          <div className="text-xs text-gray-500">当前服务费余额 (元)</div>
          <div className="text-2xl font-bold text-gray-900">¥ {formatAmount(userInfo?.service_fee_balance)}</div>
          <div className="text-[11px] text-gray-400">
            服务费主要用于平台服务、技术维护等相关支出，具体扣费规则以服务协议为准。
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">充值金额 (元)</label>
            <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50">
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
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">支付方式</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setPaymentSource('balance_available');
                  setError(null);
                }}
                className={`border rounded-lg py-2 text-sm transition-colors ${
                  paymentSource === 'balance_available'
                    ? 'border-orange-500 text-orange-600 bg-orange-50'
                    : 'border-gray-200 text-gray-700 bg-white'
                }`}
                disabled={loading}
              >
                可用余额支付
              </button>
              <button
                onClick={() => {
                  setPaymentSource('withdrawable_money');
                  setError(null);
                }}
                className={`border rounded-lg py-2 text-sm transition-colors ${
                  paymentSource === 'withdrawable_money'
                    ? 'border-orange-500 text-orange-600 bg-orange-50'
                    : 'border-gray-200 text-gray-700 bg-white'
                }`}
                disabled={loading}
              >
                提现余额支付
              </button>
            </div>
            <div className="text-xs text-gray-400 mt-2">
              {paymentSource === 'balance_available' ? (
                <>可用余额：¥ {formatAmount(userInfo?.balance_available)}</>
              ) : (
                <>提现余额：¥ {formatAmount(userInfo?.withdrawable_money)}</>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-600">
            {success}
          </div>
        )}

        <p className="text-xs text-gray-400 leading-relaxed">
          完成充值即视为同意相关服务协议与费用说明。请在操作前仔细阅读平台公布的服务条款及风险提示。
        </p>

        <button
          onClick={handleRecharge}
          disabled={loading || !amount || Number(amount) <= 0}
          className="w-full bg-orange-600 text-white rounded-full py-3 text-sm font-medium active:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? '充值中...' : '确认充值'}
        </button>
      </div>
    </div>
  );
};

export default ServiceRecharge;

