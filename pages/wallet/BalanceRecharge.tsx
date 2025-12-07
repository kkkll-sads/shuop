import React, { useEffect, useState, useRef } from 'react';
import { X, Upload, ChevronRight, CreditCard, Smartphone, Zap, MessageSquare, Wallet } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import { LoadingSpinner } from '../../components/common';
import { isValidAmount } from '../../utils/validation';
import {
  fetchCompanyAccountList,
  CompanyAccountItem,
  normalizeAssetUrl,
  submitRechargeOrder,
  uploadImage,
} from '../../services/api';

interface BalanceRechargeProps {
  onBack: () => void;
}

const BalanceRecharge: React.FC<BalanceRechargeProps> = ({ onBack }) => {
  const [accounts, setAccounts] = useState<CompanyAccountItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<CompanyAccountItem | null>(null);
  const [showAccountModal, setShowAccountModal] = useState<boolean>(false); // 账户选择弹窗
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false); // 提交确认弹窗
  const [amount, setAmount] = useState<string>('');
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadAccounts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchCompanyAccountList({ usage: 'recharge' });
        if (res.code === 1 && res.data?.list) {
          setAccounts(res.data.list || []);
          // 默认选中第一个
          if (res.data.list.length > 0) {
            setSelectedAccount(res.data.list[0]);
          }
        } else {
          setError(res.msg || '获取充值账户信息失败');
        }
      } catch (e: any) {
        setError(e?.msg || e?.response?.msg || e?.message || '获取充值账户信息失败');
      } finally {
        setLoading(false);
      }
    };

    loadAccounts();
  }, []);

  // 获取支付方式图标
  const getPaymentIcon = (type: string) => {
    const iconClass = "w-6 h-6 object-contain";
    switch (type) {
      case 'alipay':
        return <img src="https://oss.spyggw.cc/zhifub.png" alt="Alipay" className={iconClass} />;
      case 'wechat':
        return <img src="https://oss.spyggw.cc/weix.png" alt="WeChat" className={iconClass} />;
      case 'bank_card':
        return <img src="https://oss.spyggw.cc/%E9%93%B6%E8%81%94.png" alt="UnionPay" className={iconClass} />;
      case 'cloud_flash':
        return <img src="https://oss.spyggw.cc/unnamed.png" alt="CloudFlash" className={iconClass} />;
      default:
        return <Wallet size={24} className="text-gray-500" />;
    }
  };

  // 获取支付方式名称
  const getPaymentTypeName = (account: CompanyAccountItem) => {
    if (account.type_text) return account.type_text;
    const map: Record<string, string> = {
      alipay: '支付宝',
      wechat: '微信支付',
      bank_card: '银行卡',
      cloud_flash: '云闪付'
    };
    return map[account.type] || '其他支付';
  };

  return (
    <PageContainer title="余额充值" onBack={onBack}>
      <div className="p-3 space-y-3">
        {/* 选择充值账户 */}
        <div
          className="bg-white rounded-xl p-3 shadow-sm flex justify-between items-center cursor-pointer active:bg-gray-50"
          onClick={() => setShowAccountModal(true)}
        >
          <div className="flex items-center gap-3">
            {selectedAccount ? (
              <>
                {getPaymentIcon(selectedAccount.type)}
                <div className="flex flex-col">
                  <span className="text-base text-gray-800 font-medium">
                    {getPaymentTypeName(selectedAccount)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {selectedAccount.account_name || selectedAccount.account_number}
                  </span>
                </div>
              </>
            ) : (
              <span className="text-base text-gray-800">选择充值方式</span>
            )}
          </div>
          <ChevronRight size={20} className="text-gray-400" />
        </div>

        {/* 充值金额 */}
        <div className="bg-white rounded-xl p-3 shadow-sm">
          <div className="text-base text-gray-800 font-medium mb-4">充值金额</div>
          <div className="flex items-center border-b border-gray-100 pb-4">
            <span className="text-3xl text-gray-800 mr-2">¥</span>
            <input
              type="number"
              placeholder=""
              className="flex-1 bg-transparent outline-none text-3xl text-gray-900"
              value={amount}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0)) {
                  setAmount(val);
                  setSubmitError(null);
                }
              }}
            />
          </div>
        </div>

        {/* 充值说明 */}
        <p className="text-xs text-gray-400 leading-relaxed px-1">
          充值资金仅用于平台内相关业务。实际到账时间以支付渠道为准，若长时间未到账，请保留凭证并联系平台客服处理。
        </p>

        {/* 充值按钮 */}
        <button
          className={`w-full rounded-full py-3.5 text-base font-medium ${selectedAccount && amount && parseFloat(amount) > 0
            ? 'bg-orange-600 text-white active:bg-orange-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          onClick={() => {
            if (selectedAccount && amount && parseFloat(amount) > 0) {
              setShowConfirmModal(true);
            }
          }}
          disabled={!selectedAccount || !amount || parseFloat(amount) <= 0}
        >
          下一步
        </button>
      </div>

      {/* 账户选择弹窗 */}
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
              <span className="font-bold text-gray-900">选择充值方式</span>
              <button onClick={() => setShowAccountModal(false)}>
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            {loading && (
              <div className="text-center py-8 text-gray-500 text-sm">加载中...</div>
            )}

            {!loading && accounts.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-sm">暂无可用充值账户</div>
            )}

            <div className="p-4 space-y-3">
              {accounts.map((item) => {
                const isSelected = selectedAccount?.id === item.id;
                return (
                  <div
                    key={item.id}
                    className={`border rounded-xl p-3 cursor-pointer transition-colors flex items-center justify-between ${isSelected
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-100 bg-white'}`}
                    onClick={() => {
                      setSelectedAccount(item);
                      setShowAccountModal(false);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {getPaymentIcon(item.type)}
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{getPaymentTypeName(item)}</span>
                        <span className="text-xs text-gray-500 text-left">{item.account_name || item.account_number}</span>
                      </div>
                    </div>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-orange-500"></div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 确认提交/上传凭证弹窗 */}
      {showConfirmModal && selectedAccount && (
        <div
          className="fixed inset-0 z-20 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setShowConfirmModal(false)}
        >
          <div
            className="bg-white rounded-xl p-5 max-w-sm w-full flex flex-col relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 z-10"
              onClick={() => setShowConfirmModal(false)}
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">
              确认充值信息
            </h3>

            {/* 收款方信息卡片 */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3 mb-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">充值金额</span>
                <span className="text-xl font-bold text-orange-600">¥ {amount}</span>
              </div>
              <div className="h-px bg-gray-200 my-2"></div>

              {selectedAccount.qrcode ? (
                <div className="flex flex-col items-center gap-2 py-2">
                  <img
                    src={normalizeAssetUrl(selectedAccount.qrcode)}
                    alt="QRCode"
                    className="w-40 h-40 object-contain bg-white rounded p-1 border"
                  />
                  <span className="text-xs text-gray-500">请扫码支付</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-500">收款方式</span>
                    <span className="text-gray-900 font-medium">{getPaymentTypeName(selectedAccount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">收款账号</span>
                    <span className="text-gray-900 font-medium text-right break-all w-48">{selectedAccount.account_number}</span>
                  </div>
                  {selectedAccount.account_name && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">户名</span>
                      <span className="text-gray-900 font-medium">{selectedAccount.account_name}</span>
                    </div>
                  )}
                  {selectedAccount.bank_name && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">开户行</span>
                      <span className="text-gray-900 font-medium text-right w-48">{selectedAccount.bank_name}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* 付款截图上传 */}
            <div className="space-y-2 mb-6">
              <label className="block text-sm font-medium text-gray-800">上传付款凭证 (选填)</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setPaymentScreenshot(file);
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setScreenshotPreview(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              {screenshotPreview ? (
                <div className="relative group">
                  <img
                    src={screenshotPreview}
                    alt="Preview"
                    className="w-full h-40 object-contain rounded-lg border border-gray-200 bg-gray-50"
                  />
                  <button
                    type="button"
                    className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-white hover:bg-black/70"
                    onClick={() => {
                      setPaymentScreenshot(null);
                      setScreenshotPreview(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-gray-500 hover:border-orange-500 hover:text-orange-500 transition-colors bg-gray-50/50"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={24} className="mb-2" />
                  <span className="text-xs">点击上传付款截图</span>
                </button>
              )}
            </div>

            {submitError && (
              <div className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded mb-4">
                {submitError}
              </div>
            )}

            <button
              type="button"
              className={`w-full bg-orange-600 text-white rounded-full py-3 text-base font-medium active:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed`}
              onClick={async () => {
                setSubmitting(true);
                setSubmitError(null);

                try {
                  let screenshotUrl: string | undefined;
                  let screenshotId: number | undefined;

                  if (paymentScreenshot) {
                    const uploadRes = await uploadImage(paymentScreenshot);
                    if (uploadRes.code === 1 && uploadRes.data) {
                      screenshotUrl = uploadRes.data.url || uploadRes.data.fullurl || (uploadRes.data as any).full_url;
                      screenshotId = (uploadRes.data as any).id;
                    }
                  }

                  // 映射支付方式
                  const paymentTypeMap: Record<string, 'bank_card' | 'alipay' | 'wechat' | 'usdt'> = {
                    bank_card: 'bank_card',
                    alipay: 'alipay',
                    wechat: 'wechat',
                    usdt: 'usdt',
                    cloud_flash: 'bank_card' // 云闪付通常归为银行卡类或特殊处理
                  };

                  const paymentType = paymentTypeMap[selectedAccount.type] || selectedAccount.type as any;

                  const submitRes = await submitRechargeOrder({
                    amount: parseFloat(amount),
                    payment_type: paymentType,
                    company_account_id: selectedAccount.id,
                    payment_screenshot: paymentScreenshot || undefined,
                    payment_screenshot_id: screenshotId,
                    payment_screenshot_url: screenshotUrl,
                  });

                  if (submitRes.code === 1) {
                    alert(submitRes.msg || '提交成功，请等待审核');
                    setShowConfirmModal(false);
                    setAmount('');
                    setPaymentScreenshot(null);
                    setScreenshotPreview(null);
                    onBack(); // 返回上一页
                  } else {
                    setSubmitError(submitRes.msg || '提交失败');
                  }
                } catch (e: any) {
                  setSubmitError(e?.msg || e?.message || '提交失败');
                } finally {
                  setSubmitting(false);
                }
              }}
              disabled={submitting}
            >
              {submitting ? '提交中...' : '确认提交'}
            </button>
          </div>
        </div>
      )
      }
    </PageContainer >
  );
};

export default BalanceRecharge;


