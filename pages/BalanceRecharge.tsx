import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { fetchCompanyAccountList, CompanyAccountItem, normalizeAssetUrl } from '../services/api';

interface BalanceRechargeProps {
  onBack: () => void;
}

const BalanceRecharge: React.FC<BalanceRechargeProps> = ({ onBack }) => {
  const [accounts, setAccounts] = useState<CompanyAccountItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<CompanyAccountItem | null>(null);
  const [qrPreviewUrl, setQrPreviewUrl] = useState<string | null>(null);

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
        setError(e?.message || '获取充值账户信息失败');
      } finally {
        setLoading(false);
      }
    };

    loadAccounts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white px-4 py-3 flex items-center sticky top-0 z-10 shadow-sm">
        <button onClick={onBack} className="absolute left-4 p-1">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-gray-800 w-full text-center">余额充值</h1>
      </header>

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
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-100 bg-gray-50'
                    }`}
                    onClick={() =>
                      setSelectedAccount((prev) =>
                        prev?.id === item.id ? null : item,
                      )
                    }
                  >
                    <div className="flex gap-3 items-center">
                      {item.qrcode ? (
                        <img
                          src={normalizeAssetUrl(item.qrcode)}
                          alt={item.account_name}
                          className="w-16 h-16 rounded-md object-cover flex-shrink-0 bg-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            setQrPreviewUrl(normalizeAssetUrl(item.qrcode));
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-md bg-gray-200 flex items-center justify-center text-xs text-gray-500 flex-shrink-0">
                          无二维码
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-800">
                            {item.account_name || item.type_text}
                          </span>
                          <span className="text-[11px] text-blue-600">
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

        {qrPreviewUrl && (
          <div
            className="fixed inset-0 z-20 bg-black/70 flex items-center justify-center"
            onClick={() => setQrPreviewUrl(null)}
          >
            <div
              className="bg-white rounded-xl p-4 max-w-xs w-72 flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={qrPreviewUrl}
                alt="充值二维码"
                className="w-64 h-64 object-contain rounded-md bg-gray-50"
              />
              <button
                type="button"
                className="mt-3 text-sm text-blue-600"
                onClick={() => setQrPreviewUrl(null)}
              >
                关闭
              </button>
            </div>
          </div>
        )}

        <p className="text-xs text-gray-400 leading-relaxed">
          充值资金仅用于平台内相关业务。实际到账时间以支付渠道为准，若长时间未到账，请保留凭证并联系平台客服处理。
        </p>

        <button className="w-full bg-blue-600 text-white rounded-full py-3 text-sm font-medium active:bg-blue-700">
          确认充值
        </button>
      </div>
    </div>
  );
};

export default BalanceRecharge;


