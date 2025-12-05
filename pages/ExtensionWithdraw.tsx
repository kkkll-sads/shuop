import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, X } from 'lucide-react';
import {
  fetchProfile,
  fetchPaymentAccountList,
  submitStaticIncomeWithdraw,
  PaymentAccountItem,
  AUTH_TOKEN_KEY,
  USER_INFO_KEY,
} from '../services/api';
import { UserInfo } from '../types';

interface ExtensionWithdrawProps {
  onBack: () => void;
}

const ExtensionWithdraw: React.FC<ExtensionWithdrawProps> = ({ onBack }) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(() => {
    try {
      const cached = localStorage.getItem(USER_INFO_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.warn('解析本地用户信息失败:', error);
      return null;
    }
  });

  const [accounts, setAccounts] = useState<PaymentAccountItem[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<PaymentAccountItem | null>(null);
  const [showAccountModal, setShowAccountModal] = useState<boolean>(false);
  const [amount, setAmount] = useState<string>('');
  const [payPassword, setPayPassword] = useState<string>('');
  const [remark, setRemark] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingAccounts, setLoadingAccounts] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
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

  // 加载收款账户列表
  useEffect(() => {
    const loadAccounts = async () => {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!token) return;

      setLoadingAccounts(true);
      setError(null);
      try {
        const res = await fetchPaymentAccountList(token);
        if (res.code === 1 && res.data?.list) {
          setAccounts(res.data.list || []);
          // 默认选择第一个账户或默认账户
          if (res.data.list.length > 0) {
            const defaultAccount = res.data.list.find((acc: PaymentAccountItem) => Number(acc.is_default) === 1);
            setSelectedAccount(defaultAccount || res.data.list[0]);
          }
        } else {
          setError(res.msg || '获取收款账户信息失败');
        }
      } catch (e: any) {
        setError(e?.msg || e?.message || '获取收款账户信息失败');
      } finally {
        setLoadingAccounts(false);
      }
    };

    loadAccounts();
  }, []);

  const formatAmount = (value?: string | number) => {
    if (value === undefined || value === null) return '0.00';
    const num = Number(value);
    if (Number.isNaN(num)) return String(value);
    return num.toFixed(2);
  };

  const handleSelectAll = () => {
    const staticIncome = Number(userInfo?.static_income || 0);
    if (staticIncome > 0) {
      setAmount(staticIncome.toFixed(2));
      setSubmitError(null);
    }
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    setSuccess(null);

    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      setSubmitError('未找到用户登录信息，请先登录');
      return;
    }

    const withdrawAmount = Number(amount);
    if (!amount || withdrawAmount <= 0) {
      setSubmitError('请输入有效的提现金额');
      return;
    }

    const staticIncome = Number(userInfo?.static_income || 0);
    if (withdrawAmount > staticIncome) {
      setSubmitError('提现金额不能超过可提现拓展服务费');
      return;
    }

    if (!selectedAccount || !selectedAccount.id) {
      setSubmitError('请选择收款账户');
      return;
    }

    if (!payPassword) {
      setSubmitError('请输入支付密码');
      return;
    }

    setSubmitting(true);

    try {
      const response = await submitStaticIncomeWithdraw({
        amount: withdrawAmount,
        payment_account_id: Number(selectedAccount.id),
        pay_password: payPassword,
        remark: remark || undefined,
        token,
      });

      if (response.code === 1) {
        setSuccess('提现申请已提交，请等待审核');
        setAmount('');
        setPayPassword('');
        setRemark('');

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
        setSubmitError(response.msg || '提交提现申请失败');
      }
    } catch (err: any) {
      console.error('提交提现申请失败:', err);
      setSubmitError(err?.msg || err?.message || '提交提现申请失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white px-4 py-3 flex items-center sticky top-0 z-10 shadow-sm">
        <button onClick={onBack} className="absolute left-4 p-1">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-gray-800 w-full text-center">拓展提现</h1>
      </header>

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>可提现拓展服务费 (元)</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">¥ {formatAmount(userInfo?.static_income)}</div>
          <div className="text-[11px] text-gray-400">
            拓展收益按平台规则结算后方可申请提现，具体结算周期以公告为准。
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">提现金额 (元)</label>
            <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50">
              <span className="text-gray-500 mr-1">¥</span>
              <input
                type="number"
                placeholder="请输入提现金额"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setSubmitError(null);
                }}
                className="flex-1 bg-transparent outline-none text-gray-900 text-sm"
                disabled={submitting}
              />
              <button
                onClick={handleSelectAll}
                className="ml-2 text-xs text-orange-600"
                disabled={submitting}
              >
                全部提现
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">收款账户</label>
            <button
              onClick={() => setShowAccountModal(true)}
              className="w-full flex justify-between items-center border rounded-lg px-3 py-2 bg-gray-50 text-sm text-gray-700"
              disabled={submitting || loadingAccounts}
            >
              <span>
                {selectedAccount
                  ? `${selectedAccount.type_text || selectedAccount.type || '账户'}: ${selectedAccount.account || ''}`
                  : '请选择收款账户'}
              </span>
              <span className="text-xs text-orange-600">选择</span>
            </button>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">支付密码</label>
            <input
              type="password"
              placeholder="请输入支付密码"
              value={payPassword}
              onChange={(e) => {
                setPayPassword(e.target.value);
                setSubmitError(null);
              }}
              className="w-full border rounded-lg px-3 py-2 bg-gray-50 text-sm text-gray-900 outline-none"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">备注 (可选)</label>
            <input
              type="text"
              placeholder="请输入备注信息"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 bg-gray-50 text-sm text-gray-900 outline-none"
              disabled={submitting}
            />
          </div>
        </div>

        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
            {submitError}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-600">
            {success}
          </div>
        )}

        <p className="text-xs text-gray-400 leading-relaxed">
          为保障资金安全，平台可能会对部分高频或大额提现订单进行人工或电话核实，请您留意来电与站内消息。
        </p>

        <button
          onClick={handleSubmit}
          disabled={submitting || !amount || !selectedAccount || !payPassword}
          className="w-full bg-orange-600 text-white rounded-full py-3 text-sm font-medium active:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {submitting ? '提交中...' : '提交提现申请'}
        </button>
      </div>

      {/* 收款账户选择弹窗 */}
      {showAccountModal && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setShowAccountModal(false)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-sm w-full relative max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">选择收款账户</h2>
              <button
                onClick={() => setShowAccountModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {loadingAccounts ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={24} className="animate-spin text-orange-600" />
              </div>
            ) : error ? (
              <div className="text-sm text-red-600 py-4">{error}</div>
            ) : accounts.length === 0 ? (
              <div className="text-sm text-gray-500 py-4 text-center">暂无收款账户</div>
            ) : (
              <div className="space-y-3">
                {accounts.map((item) => {
                  const itemId = item.id ?? '';
                  const selectedId = selectedAccount?.id ?? '';
                  const isSelected = String(itemId) === String(selectedId);
                  const typeText = item.type_text || item.type || '账户';
                  const account = item.account || '';
                  const accountName = item.account_name || '';
                  const bankName = item.bank_name || '';
                  const isDefault = Number(item.is_default) === 1;

                  return (
                    <div
                      key={itemId || `${typeText}-${account}`}
                      className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-100 bg-gray-50'
                      }`}
                      onClick={() => {
                        setSelectedAccount(item);
                        setShowAccountModal(false);
                      }}
                    >
                      <div className="flex gap-3 items-center">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-800">{typeText}</span>
                            {isDefault && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">
                                默认
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {accountName && <div>户名: {accountName}</div>}
                            {account && <div>账号: {account}</div>}
                            {bankName && <div>银行: {bankName}</div>}
                            {item.bank_branch && <div>支行: {item.bank_branch}</div>}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-orange-600 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExtensionWithdraw;


