import React, { useState, useEffect } from 'react';
import { Receipt, Loader2, FileText, ShoppingBag, Clock, CheckCircle, XCircle } from 'lucide-react';
import SubPageLayout from '../components/SubPageLayout';
import { AUTH_TOKEN_KEY, getMyCollection } from '../services/api';

interface ConsignmentVoucherProps {
  onBack: () => void;
}

interface VoucherRecord {
  id: string;
  type: 'earned' | 'used';
  title: string;
  time: string;
  amount: number;
  status: 'active' | 'used' | 'expired';
}

const ConsignmentVoucher: React.FC<ConsignmentVoucherProps> = ({ onBack }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [voucherCount, setVoucherCount] = useState<number>(0);
  const [records, setRecords] = useState<VoucherRecord[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!token) {
        setError('请先登录');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // 从我的藏品接口获取寄售券数量
        const response = await getMyCollection({ page: 1, limit: 1, token });
        if (response.code === 1 && response.data) {
          const count = response.data.consignment_coupon ?? 0;
          setVoucherCount(count);
          
          // 生成模拟记录（实际应该从API获取）
          // TODO: 替换为真实的寄售券使用记录API
          const mockRecords: VoucherRecord[] = [
            {
              id: '1',
              type: 'earned',
              title: '购买商品获得',
              time: new Date().toLocaleString('zh-CN'),
              amount: 1,
              status: 'active',
            },
            {
              id: '2',
              type: 'used',
              title: '寄售商品使用',
              time: new Date(Date.now() - 86400000).toLocaleString('zh-CN'),
              amount: 1,
              status: 'used',
            },
          ];
          setRecords(mockRecords);
        } else {
          setError(response.msg || '获取寄售券信息失败');
        }
      } catch (err: any) {
        setError(err?.msg || err?.message || '获取寄售券信息失败');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const formatTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return timeStr;
    }
  };

  return (
    <SubPageLayout title="寄售券" onBack={onBack}>
      <div className="p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Loader2 size={32} className="animate-spin mb-4" />
            <span className="text-xs">加载中...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-red-400">
            <div className="w-16 h-16 mb-4 border-2 border-red-200 rounded-lg flex items-center justify-center">
              <FileText size={32} className="opacity-50" />
            </div>
            <span className="text-xs">{error}</span>
          </div>
        ) : (
          <>
            {/* 寄售券卡片 */}
            <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl p-6 text-white shadow-lg mb-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Receipt size={24} />
                  <div className="text-sm opacity-90">我的寄售券</div>
                </div>
                <div className="text-4xl font-bold mb-2">{voucherCount}</div>
                <div className="text-sm opacity-80">
                  可用于寄售商品
                </div>
              </div>
            </div>

            {/* 使用说明 */}
            <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
              <div className="text-sm font-bold text-gray-800 mb-3 border-l-4 border-orange-300 pl-2">
                使用说明
              </div>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 flex-shrink-0"></div>
                  <div>寄售券可用于寄售您购买的藏品商品</div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 flex-shrink-0"></div>
                  <div>每次寄售商品需要消耗1张寄售券</div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 flex-shrink-0"></div>
                  <div>寄售券可通过购买商品、参与活动等方式获得</div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 flex-shrink-0"></div>
                  <div>寄售商品需满足购买后48小时的条件</div>
                </div>
              </div>
            </div>

            {/* 使用记录 */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-sm font-bold text-gray-800 mb-4 border-l-4 border-orange-300 pl-2">
                使用记录
              </div>
              {records.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                  <ShoppingBag size={32} className="opacity-50 mb-2" />
                  <span className="text-xs">暂无使用记录</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {records.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          record.type === 'earned'
                            ? 'bg-green-100'
                            : 'bg-orange-100'
                        }`}
                      >
                        {record.status === 'used' ? (
                          <CheckCircle
                            size={20}
                            className={
                              record.type === 'earned'
                                ? 'text-green-600'
                                : 'text-orange-600'
                            }
                          />
                        ) : (
                          <Receipt
                            size={20}
                            className={
                              record.type === 'earned'
                                ? 'text-green-600'
                                : 'text-orange-600'
                            }
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-sm font-medium text-gray-800">
                            {record.title}
                          </div>
                          <div
                            className={`text-sm font-bold ${
                              record.type === 'earned'
                                ? 'text-green-600'
                                : 'text-orange-600'
                            }`}
                          >
                            {record.type === 'earned' ? '+' : '-'}
                            {record.amount} 张
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock size={12} />
                          <span>{formatTime(record.time)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </SubPageLayout>
  );
};

export default ConsignmentVoucher;

