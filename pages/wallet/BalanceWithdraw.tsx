import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import { LoadingSpinner, EmptyState } from '../../components/common';
import { isValidAmount } from '../../utils/validation';
import { formatAmount } from '../../utils/format';
import {
  fetchPaymentAccountList,
  PaymentAccountItem,
  submitWithdraw,
  fetchProfile,
  AUTH_TOKEN_KEY,
  USER_INFO_KEY,
} from '../../services/api';
import { UserInfo } from '../../types';


interface BalanceWithdrawProps {
  onBack: () => void;
  onNavigate?: (page: string) => void;
}

const BalanceWithdraw: React.FC<BalanceWithdrawProps> = ({ onBack, onNavigate }) => {
  const [accounts, setAccounts] = useState<PaymentAccountItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<PaymentAccountItem | null>(null);
  const [showAccountModal, setShowAccountModal] = useState<boolean>(false);
  const [amount, setAmount] = useState<string>('');
  const [payPassword, setPayPassword] = useState<string>('');
  const [remark, setRemark] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0.00');
  const [loadingBalance, setLoadingBalance] = useState<boolean>(false);

  // 加载收款账户列表（用户绑定的账户）
  useEffect(() => {
    const loadAccounts = async () => {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!token) {
        setError('未检测到登录信息，请重新登录');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const res = await fetchPaymentAccountList(token);
        if (res.code === 1 && res.data?.list) {
          setAccounts(res.data.list || []);
        } else {
          setError(res.msg || '获取收款账户信息失败');
        }
      } catch (e: any) {
        // 优先使用接口返回的错误消息
        setError(e?.msg || e?.response?.msg || e?.message || '获取收款账户信息失败');
      } finally {
        setLoading(false);
      }
    };

    loadAccounts();
  }, []);

  // 加载用户余额
  useEffect(() => {
    const loadBalance = async () => {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!token) {
        setBalance('0.00');
        return;
      }

      setLoadingBalance(true);
      try {

        // 从服务器获取最新余额
        const response = await fetchProfile(token);
        if (response.code === 1 && response.data?.userInfo) {
          const userInfo = response.data.userInfo;
          setBalance(parseFloat(userInfo.withdrawable_money || '0').toFixed(2));
          localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
        }
      } catch (err: any) {
        console.error('获取余额失败:', err);
      } finally {
        setLoadingBalance(false);
      }
    };

    loadBalance();
  }, []);

  const handleWithdrawAll = () => {
    setAmount(balance);
  };

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setSubmitError('请输入有效的提现金额');
      return;
    }

    if (parseFloat(amount) > parseFloat(balance)) {
      setSubmitError('提现金额不能超过可提现余额');
      return;
    }

    if (!selectedAccount) {
      setSubmitError('请选择收款账户');
      return;
    }

    if (!payPassword) {
      setSubmitError('请输入支付密码');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const accountId = selectedAccount.id;
      if (!accountId) {
        setSubmitError('选择的账户ID无效');
        setSubmitting(false);
        return;
      }

      const res = await submitWithdraw({
        amount: parseFloat(amount),
        payment_account_id: typeof accountId === 'string' ? parseInt(accountId, 10) : accountId,
        pay_password: payPassword,
        remark: remark || '',
      });

      if (res.code === 1) {
        alert(res.msg || '提现申请提交成功，请等待审核');
        // 重置表单
        setAmount('');
        setPayPassword('');
        setRemark('');
        setSelectedAccount(null);
        // 重新加载余额
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        if (token) {
          const response = await fetchProfile(token);
          if (response.code === 1 && response.data?.userInfo) {
            const userInfo = response.data.userInfo;
            setBalance(parseFloat(userInfo.money || '0').toFixed(2));
            localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
          }
        }
      } else {
        setSubmitError(res.msg || '提交失败，请重试');
      }
    } catch (e: any) {
      // 优先使用接口返回的错误消息
      setSubmitError(e?.msg || e?.response?.msg || e?.message || '提交失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer title="余额提现" onBack={onBack}>
      <div className="p-4 space-y-4">
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>可提现余额 (元)</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {loadingBalance ? '加载中...' : `¥ ${balance}`}
          </div>
          <div className="text-[11px] text-gray-400">
            单笔提现金额及次数可能受银行或支付机构限制，以实际处理结果为准。
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
                className="flex-1 bg-transparent outline-none text-gray-900 text-sm"
                value={amount}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0)) {
                    setAmount(val);
                  }
                }}
              />
              <button
                className="ml-2 text-xs text-orange-600"
                onClick={handleWithdrawAll}
                disabled={parseFloat(balance) <= 0}
              >
                全部提现
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">收款账户</label>
            {accounts.length === 0 && !loading ? (
              <div className="border rounded-lg px-3 py-2 bg-gray-50">
                <div className="text-sm text-gray-500 mb-1">暂无绑定的收款账户</div>
                {onNavigate && (
                  <button
                    className="text-xs text-orange-600"
                    onClick={() => onNavigate('cardManagement')}
                  >
                    去管理页面添加账户 →
                  </button>
                )}
              </div>
            ) : (
              <button
                className="w-full flex justify-between items-center border rounded-lg px-3 py-2 bg-gray-50 text-sm text-gray-700"
                onClick={() => {
                  if (accounts.length > 0) {
                    setShowAccountModal(true);
                  } else if (onNavigate) {
                    onNavigate('cardManagement');
                  }
                }}
              >
                <span>
                  {selectedAccount
                    ? `${selectedAccount.account_name || selectedAccount.type_text || ''} - ${selectedAccount.account || ''}`
                    : '请选择绑定的收款账户'}
                </span>
                <span className="text-xs text-orange-600">
                  {accounts.length > 0 ? '选择' : '去管理'}
                </span>
              </button>
            )}
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">支付密码</label>
            <input
              type="password"
              placeholder="请输入支付密码"
              className="w-full border rounded-lg px-3 py-2 bg-gray-50 text-sm text-gray-900 outline-none"
              value={payPassword}
              onChange={(e) => setPayPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">提现备注（选填）</label>
            <input
              type="text"
              placeholder="请输入备注信息"
              className="w-full border rounded-lg px-3 py-2 bg-gray-50 text-sm text-gray-900 outline-none"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            />
          </div>
        </div>

        {submitError && (
          <div className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded">
            {submitError}
          </div>
        )}

        <p className="text-xs text-gray-400 leading-relaxed">
          预计到账时间：1-3个工作日。节假日顺延。提现期间请保持预留手机号畅通，以便银行或平台核实信息。
        </p>

        <button
          className={`w-full rounded-full py-3 text-sm font-medium ${submitting
            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
            : 'bg-orange-600 text-white active:bg-orange-700'
            }`}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? '提交中...' : '提交提现申请'}
        </button>
      </div>

      {/* 收款账户选择弹窗 */}
      {showAccountModal && (
        <div
          className="fixed inset-0 z-20 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setShowAccountModal(false)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-sm w-full max-h-[80vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600"
              onClick={() => setShowAccountModal(false)}
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-4">选择收款账户</h3>

            {loading && (
              <div className="text-center py-8 text-gray-500 text-sm">加载中...</div>
            )}

            {error && (
              <div className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded mb-4">
                {error}
              </div>
            )}

            {!loading && !error && accounts.length === 0 && (
              <div className="text-center py-8 space-y-3">
                <div className="text-gray-400 text-sm">暂无绑定的收款账户</div>
                {onNavigate && (
                  <button
                    className="text-sm text-orange-600 bg-orange-50 px-4 py-2 rounded-lg active:bg-orange-100"
                    onClick={() => {
                      setShowAccountModal(false);
                      onNavigate('cardManagement');
                    }}
                  >
                    去添加收款账户
                  </button>
                )}
              </div>
            )}

            {!loading && !error && accounts.length > 0 && (
              <div className="space-y-3">
                {accounts.map((item) => {
                  const itemId = item.id ?? '';
                  const selectedId = selectedAccount?.id ?? '';
                  const isSelected = String(itemId) === String(selectedId);
                  const typeText = item.type_text || item.type || '账户';
                  const account = item.account || '';
                  const accountName = item.account_name || '';
                  const bankName = item.bank_name || '';
                  const bankBranch = item.bank_branch || '';
                  const isDefault = Number(item.is_default) === 1;

                  return (
                    <div
                      key={itemId || `${typeText}-${account}`}
                      className={`border rounded-lg p-3 cursor-pointer transition-colors ${isSelected
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
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-800">
                              {accountName || typeText}
                            </span>
                            <div className="flex items-center gap-2">
                              {isDefault && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-50 text-orange-500 border border-orange-100">
                                  默认
                                </span>
                              )}
                              <span className="text-[11px] text-orange-600">{typeText}</span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-600 break-all">
                            {account}
                          </div>
                          {(bankName || bankBranch) && (
                            <div className="text-[11px] text-gray-400 mt-0.5">
                              {[bankName, bankBranch].filter(Boolean).join(' · ')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default BalanceWithdraw;


