import React, { useEffect, useState, useRef } from 'react';
import { X, Upload } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import { LoadingSpinner } from '../components/common';
import { isValidAmount } from '../utils/validation';
import {
  fetchCompanyAccountList,
  CompanyAccountItem,
  normalizeAssetUrl,
  submitRechargeOrder,
  uploadImage,
} from '../services/api';


interface BalanceRechargeProps {
  onBack: () => void;
}

const BalanceRecharge: React.FC<BalanceRechargeProps> = ({ onBack }) => {
  const [accounts, setAccounts] = useState<CompanyAccountItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<CompanyAccountItem | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
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
        } else {
          setError(res.msg || '获取充值账户信息失败');
        }
      } catch (e: any) {
        // 优先使用接口返回的错误消息
        setError(e?.msg || e?.response?.msg || e?.message || '获取充值账户信息失败');
      } finally {
        setLoading(false);
      }
    };

    loadAccounts();
  }, []);

  return (
    <PageContainer title="余额充值" onBack={onBack}>
      <div className="p-4 space-y-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-xs text-gray-500 mb-1">当前可用余额 (元)</div>
          <div className="text-2xl font-bold text-gray-900 mb-2">¥ 0.00</div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">充值金额 (元)</label>
            <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50">
              <span className="text-gray-500 mr-1">¥</span>
              <input
                type="number"
                placeholder="请输入充值金额"
                className="flex-1 bg-transparent outline-none text-gray-900 text-sm"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>


        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">可用充值账户</span>
            {loading && (
              <span className="text-[11px] text-gray-400">加载中...</span>
            )}
          </div>

          {error && (
            <div className="text-[11px] text-red-500 bg-red-50 px-2 py-1 rounded">
              {error}
            </div>
          )}

          {!loading && !error && accounts.length === 0 && (
            <div className="text-[11px] text-gray-400">
              暂无可用充值账户，请稍后重试或联系平台客服。
            </div>
          )}

          {!loading && !error && accounts.length > 0 && (
            <div className="space-y-3">
              {accounts.map((item) => {
                const isSelected = selectedAccount?.id === item.id;
                return (
                  <div
                    key={item.id}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${isSelected
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-100 bg-gray-50'
                      }`}
                    onClick={() =>
                      setSelectedAccount((prev) =>
                        prev?.id === item.id ? null : item,
                      )
                    }
                  >
                    <div className="flex gap-3 items-center">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-800">
                            {item.account_name || item.type_text}
                          </span>
                          <span className="text-[11px] text-orange-600">
                            {item.type_text}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 break-all">
                          {item.account_number}
                        </div>
                        <div className="text-[11px] text-gray-400 mt-0.5">
                          {item.status_text}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-dashed border-gray-200 space-y-1 text-xs text-gray-700">
                        {item.bank_name && (
                          <div className="text-[11px] text-gray-600">
                            开户行：
                            {item.bank_name}
                            {item.bank_branch ? ` ${item.bank_branch}` : ''}
                          </div>
                        )}
                        {item.remark && (
                          <div className="text-[11px] text-gray-500">
                            备注：{item.remark}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {showConfirmModal && selectedAccount && (
          <div
            className="fixed inset-0 z-20 bg-black/70 flex items-center justify-center p-4"
            onClick={() => setShowConfirmModal(false)}
          >
            <div
              className="bg-white rounded-xl p-6 max-w-sm w-full flex flex-col items-center relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600"
                onClick={() => setShowConfirmModal(false)}
              >
                <X size={20} />
              </button>

              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {selectedAccount.account_name || selectedAccount.type_text}
              </h3>

              <div className="w-full space-y-4">
                {selectedAccount.qrcode ? (
                  <div className="flex flex-col items-center space-y-2">
                    <img
                      src={normalizeAssetUrl(selectedAccount.qrcode)}
                      alt="充值二维码"
                      className="w-64 h-64 object-contain rounded-md bg-gray-50 border border-gray-200"
                    />
                    <div className="text-xs text-gray-500 text-center">
                      请使用{selectedAccount.type_text}扫描二维码进行充值
                    </div>
                  </div>
                ) : (
                  <div className="w-full space-y-3 text-sm">
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">支付方式：</span>
                        <span className="font-medium text-gray-900">{selectedAccount.type_text}</span>
                      </div>
                      <div className="flex items-start justify-between">
                        <span className="text-gray-500">收款账号：</span>
                        <span className="font-medium text-gray-900 text-right break-all ml-4">
                          {selectedAccount.account_number}
                        </span>
                      </div>
                      {selectedAccount.account_name && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">账户名称：</span>
                          <span className="font-medium text-gray-900">{selectedAccount.account_name}</span>
                        </div>
                      )}
                      {selectedAccount.bank_name && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">开户行：</span>
                          <span className="font-medium text-gray-900">
                            {selectedAccount.bank_name}
                            {selectedAccount.bank_branch ? ` ${selectedAccount.bank_branch}` : ''}
                          </span>
                        </div>
                      )}
                      {selectedAccount.remark && (
                        <div className="flex items-start justify-between">
                          <span className="text-gray-500">备注：</span>
                          <span className="font-medium text-gray-900 text-right break-all ml-4">
                            {selectedAccount.remark}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">状态：</span>
                        <span className="text-orange-600">{selectedAccount.status_text}</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 text-center">
                      请按照以上信息进行转账充值
                    </div>
                  </div>
                )}

                {/* 充值金额输入 */}
                <div className="space-y-2">
                  <label className="block text-xs text-gray-500">充值金额 (元)</label>
                  <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50">
                    <span className="text-gray-500 mr-1">¥</span>
                    <input
                      type="number"
                      placeholder="请输入充值金额"
                      className="flex-1 bg-transparent outline-none text-gray-900 text-sm"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                </div>

                {/* 付款截图上传 */}
                <div className="space-y-2">
                  <label className="block text-xs text-gray-500">付款截图（选填）</label>
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
                    <div className="relative">
                      <img
                        src={screenshotPreview}
                        alt="付款截图预览"
                        className="w-full h-48 object-contain rounded-lg border border-gray-200 bg-gray-50"
                      />
                      <button
                        type="button"
                        className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white"
                        onClick={() => {
                          setPaymentScreenshot(null);
                          setScreenshotPreview(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-gray-500 hover:border-orange-500 hover:text-orange-500 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={24} className="mb-2" />
                      <span className="text-xs">点击上传付款截图</span>
                      <span className="text-[10px] text-gray-400 mt-1">支持 JPG/PNG/GIF 格式</span>
                    </button>
                  )}
                </div>

                {submitError && (
                  <div className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded">
                    {submitError}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    className="flex-1 border border-gray-300 text-gray-700 rounded-full py-2 text-sm font-medium active:bg-gray-100"
                    onClick={() => {
                      setShowConfirmModal(false);
                      setSubmitError(null);
                    }}
                    disabled={submitting}
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    className={`flex-1 bg-orange-600 text-white rounded-full py-2 text-sm font-medium active:bg-orange-700 ${submitting ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    onClick={async () => {
                      if (!amount || parseFloat(amount) <= 0) {
                        setSubmitError('请输入有效的充值金额');
                        return;
                      }

                      if (!selectedAccount) {
                        setSubmitError('请选择充值账户');
                        return;
                      }

                      setSubmitting(true);
                      setSubmitError(null);

                      try {
                        // 如果有截图，先上传
                        let screenshotUrl: string | undefined;
                        let screenshotId: number | undefined;

                        if (paymentScreenshot) {
                          const uploadRes = await uploadImage(paymentScreenshot);
                          if (uploadRes.code === 1 && uploadRes.data) {
                            screenshotUrl = uploadRes.data.url || uploadRes.data.fullurl || uploadRes.data.full_url;
                            screenshotId = uploadRes.data.id;
                          }
                        }

                        // 映射支付方式
                        const paymentTypeMap: Record<string, 'bank_card' | 'alipay' | 'wechat' | 'usdt'> = {
                          bank_card: 'bank_card',
                          alipay: 'alipay',
                          wechat: 'wechat',
                          usdt: 'usdt',
                        };

                        const paymentType = paymentTypeMap[selectedAccount.type] || selectedAccount.type as any;

                        // 提交订单
                        const submitRes = await submitRechargeOrder({
                          amount: parseFloat(amount),
                          payment_type: paymentType,
                          company_account_id: selectedAccount.id,
                          payment_screenshot: paymentScreenshot || undefined,
                          payment_screenshot_id: screenshotId,
                          payment_screenshot_url: screenshotUrl,
                        });

                        if (submitRes.code === 1) {
                          // 提交成功
                          const orderInfo = submitRes.data;
                          const successMsg = submitRes.msg || '充值订单提交成功，请等待审核';
                          const detailMsg = orderInfo?.order_no
                            ? `${successMsg}\n订单号：${orderInfo.order_no}`
                            : successMsg;
                          alert(detailMsg);
                          setShowConfirmModal(false);
                          setAmount('');
                          setPaymentScreenshot(null);
                          setScreenshotPreview(null);
                          setSelectedAccount(null);
                          setSubmitError(null);
                        } else {
                          setSubmitError(submitRes.msg || '提交失败，请重试');
                        }
                      } catch (e: any) {
                        // 优先使用接口返回的错误消息
                        setSubmitError(e?.msg || e?.response?.msg || e?.message || '提交失败，请重试');
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
            </div>
          </div>
        )}

        <p className="text-xs text-gray-400 leading-relaxed">
          充值资金仅用于平台内相关业务。实际到账时间以支付渠道为准，若长时间未到账，请保留凭证并联系平台客服处理。
        </p>

        <button
          className={`w-full rounded-full py-3 text-sm font-medium ${selectedAccount
            ? 'bg-orange-600 text-white active:bg-orange-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          onClick={() => {
            if (selectedAccount) {
              setShowConfirmModal(true);
            }
          }}
          disabled={!selectedAccount}
        >
          确认充值
        </button>
      </div>
    </PageContainer>
  );
};

export default BalanceRecharge;


