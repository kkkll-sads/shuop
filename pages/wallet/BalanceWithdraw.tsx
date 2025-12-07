import React, { useEffect, useState } from 'react';
import { X, ChevronRight } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import {
  fetchPaymentAccountList,
  PaymentAccountItem,
  submitWithdraw,
  fetchProfile,
  AUTH_TOKEN_KEY,
  USER_INFO_KEY,
} from '../../services/api';

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
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [amount, setAmount] = useState<string>('');
  const [payPassword, setPayPassword] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0.00');
  const [loadingBalance, setLoadingBalance] = useState<boolean>(false);

  // 费率
  const feeRate = 0.01; // 1%
  const serviceFee = amount ? (parseFloat(amount) * feeRate).toFixed(2) : '0';

  // 加载收款账户列表
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
          // 自动选择默认账户
          const defaultAcc = res.data.list.find((acc: PaymentAccountItem) => Number(acc.is_default) === 1);
          if (defaultAcc) {
            setSelectedAccount(defaultAcc);
          }
        } else {
          setError(res.msg || '获取收款账户信息失败');
        }
      } catch (e: any) {
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

  const handleWithdrawClick = () => {
    if (!amount || parseFloat(amount) <= 0) {
      setSubmitError('请输入有效的提现金额');
      return;
    }

    if (parseFloat(amount) > parseFloat(balance)) {
      setSubmitError('提现金额不能超过可提现余额');
      return;
    }

    if (!selectedAccount) {
      setSubmitError('请选择提现账户');
      return;
    }

    setSubmitError(null);
    setShowPasswordModal(true);
  };

  const handleConfirmWithdraw = async () => {
    if (!payPassword) {
      setSubmitError('请输入支付密码');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const accountId = selectedAccount!.id;

      const res = await submitWithdraw({
        amount: parseFloat(amount),
        payment_account_id: typeof accountId === 'string' ? parseInt(accountId, 10) : accountId,
        pay_password: payPassword,
      });

      if (res.code === 1) {
        alert(res.msg || '提现申请提交成功，请等待审核');
        setAmount('');
        setPayPassword('');
        setSelectedAccount(null);
        setShowPasswordModal(false);
        // 重新加载余额
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        if (token) {
          const response = await fetchProfile(token);
          if (response.code === 1 && response.data?.userInfo) {
            const userInfo = response.data.userInfo;
            setBalance(parseFloat(userInfo.withdrawable_money || '0').toFixed(2));
            localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
          }
        }
      } else {
        setSubmitError(res.msg || '提交失败，请重试');
      }
    } catch (e: any) {
      setSubmitError(e?.msg || e?.response?.msg || e?.message || '提交失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer title="提现" onBack={onBack}>
      <div className="p-3 space-y-3">
        {/* 选择提现账户 */}
        <div
          className="bg-white rounded-xl p-3 shadow-sm flex justify-between items-center cursor-pointer active:bg-gray-50"
          onClick={() => setShowAccountModal(true)}
        >
          <span className="text-base text-gray-800">
            {selectedAccount
              ? `${selectedAccount.account_name || selectedAccount.type_text || '账户'} - ${selectedAccount.account?.slice(-4) || ''}`
              : '选择提现账户'}
          </span>
          <ChevronRight size={20} className="text-gray-400" />
        </div>

        {/* 提现金额 */}
        <div className="bg-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-base text-gray-800 font-medium">提现金额</span>
            <span className="text-xs text-gray-400">（费率 {feeRate * 100}%）</span>
          </div>

          <div className="flex items-center border-b border-gray-100 pb-4">
            <span className="text-3xl text-gray-800 mr-2">¥</span>
            <input
              type="number"
              placeholder=""
              className="flex-1 bg-transparent outline-none text-3xl text-gray-900"
              value={amount}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '') {
                  setAmount('');
                  setSubmitError(null);
                  return;
                }

                if (!isNaN(parseFloat(val)) && parseFloat(val) >= 0) {
                  const numVal = parseFloat(val);
                  const numBal = parseFloat(balance);

                  if (numVal > numBal) {
                    setAmount(balance);
                  } else {
                    setAmount(val);
                  }
                  setSubmitError(null);
                }
              }}
            />
          </div>

          <div className="mt-3 text-sm">
            <span className="text-gray-500">服务费 </span>
            <span className="text-orange-500">¥{serviceFee}</span>
            <span className="text-gray-500">，可用 </span>
            <span className="text-gray-800">{loadingBalance ? '...' : balance}</span>
          </div>
        </div>

        {submitError && (
          <div className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded">
            {submitError}
          </div>
        )}

        {/* 提现按钮 */}
        <button
          className={`w-full rounded-full py-3.5 text-base font-medium ${submitting
            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
            : 'bg-orange-500 text-white active:bg-orange-600'
            }`}
          onClick={handleWithdrawClick}
          disabled={submitting}
        >
          提现
        </button>


      </div>

      {/* 收款账户选择弹窗 */}
      {showAccountModal && (
        <div
          className="fixed inset-0 z-20 bg-black/70 flex items-end justify-center"
          onClick={() => setShowAccountModal(false)}
        >
          <div
            className="bg-white rounded-t-2xl w-full max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <span className="font-bold text-gray-900">选择提现账户</span>
              <button onClick={() => setShowAccountModal(false)}>
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            {loading && (
              <div className="text-center py-8 text-gray-500 text-sm">加载中...</div>
            )}

            {error && (
              <div className="text-xs text-red-500 bg-red-50 px-4 py-2 m-4 rounded">
                {error}
              </div>
            )}

            {!loading && !error && accounts.length === 0 && (
              <div className="text-center py-8 space-y-3">
                <div className="text-gray-400 text-sm">暂无绑定的收款账户</div>
                {onNavigate && (
                  <button
                    className="text-sm text-orange-600 bg-orange-50 px-4 py-2 rounded-lg"
                    onClick={() => {
                      setShowAccountModal(false);
                      onNavigate('card-management');
                    }}
                  >
                    去添加收款账户
                  </button>
                )}
              </div>
            )}

            {!loading && !error && accounts.length > 0 && (
              <div className="p-4 space-y-3">
                {accounts.map((item) => {
                  const isSelected = selectedAccount?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      className={`border rounded-lg p-3 cursor-pointer transition-colors ${isSelected ? 'border-orange-500 bg-orange-50' : 'border-gray-100 bg-gray-50'
                        }`}
                      onClick={() => {
                        setSelectedAccount(item);
                        setShowAccountModal(false);
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-800">
                          {item.account_name || item.type_text}
                        </span>
                        <span className="text-xs text-orange-600">{item.type_text}</span>
                      </div>
                      <div className="text-xs text-gray-600">{item.account}</div>
                    </div>
                  );
                })}

                {onNavigate && (
                  <button
                    className="w-full text-center text-sm text-orange-600 py-2"
                    onClick={() => {
                      setShowAccountModal(false);
                      onNavigate('card-management');
                    }}
                  >
                    管理账户
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 支付密码弹窗 */}
      {showPasswordModal && (
        <div
          className="fixed inset-0 z-20 bg-black/70 flex items-center justify-center p-4"
          onClick={() => {
            setShowPasswordModal(false);
            setPayPassword('');
            setSubmitError(null);
          }}
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <span className="font-bold text-lg text-gray-900">输入支付密码</span>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPayPassword('');
                  setSubmitError(null);
                }}
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="mb-4">
              <div className="text-sm text-gray-500 mb-2">提现金额</div>
              <div className="text-2xl font-bold text-gray-900">¥ {amount}</div>
              <div className="text-xs text-gray-400 mt-1">
                服务费 ¥{serviceFee}，实际到账 ¥{(parseFloat(amount || '0') - parseFloat(serviceFee)).toFixed(2)}
              </div>
            </div>

            <input
              type="password"
              placeholder="请输入支付密码"
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-base outline-none focus:border-orange-500 mb-4"
              value={payPassword}
              onChange={(e) => {
                setPayPassword(e.target.value);
                setSubmitError(null);
              }}
              autoFocus
            />

            {submitError && (
              <div className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded mb-4">
                {submitError}
              </div>
            )}

            <button
              className={`w-full rounded-lg py-3 text-base font-medium ${submitting
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-orange-500 text-white active:bg-orange-600'
                }`}
              onClick={handleConfirmWithdraw}
              disabled={submitting}
            >
              {submitting ? '提交中...' : '确认提现'}
            </button>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default BalanceWithdraw;
