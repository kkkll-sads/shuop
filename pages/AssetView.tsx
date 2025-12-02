
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Wallet, Receipt, CreditCard, FileText, Loader2 } from 'lucide-react';
import {
  getBalanceLog,
  getMyOrderList,
  getMyWithdrawList,
  BalanceLogItem,
  RechargeOrderItem,
  WithdrawOrderItem,
  AUTH_TOKEN_KEY,
} from '../services/api';

interface AssetViewProps {
  onBack: () => void;
  onNavigate: (page: string) => void;
}

const AssetView: React.FC<AssetViewProps> = ({ onBack, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [balanceLogs, setBalanceLogs] = useState<BalanceLogItem[]>([]);
  const [rechargeOrders, setRechargeOrders] = useState<RechargeOrderItem[]>([]);
  const [withdrawOrders, setWithdrawOrders] = useState<WithdrawOrderItem[]>([]);
  
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);

  const tabs = ['余额明细', '拓展明细', '服务费明细', '赠送服务'];

  // Reset page when tab changes
  useEffect(() => {
    setPage(1);
    setBalanceLogs([]);
    setRechargeOrders([]);
    setWithdrawOrders([]);
  }, [activeTab]);

  useEffect(() => {
    loadData();
  }, [activeTab, page]);

  const loadData = async () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      setError('请先登录');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (activeTab === 0) {
        // 余额明细
        const res = await getBalanceLog({ page, limit: 10, token });
        if (res.code === 1 && res.data) {
          if (page === 1) {
            setBalanceLogs(res.data.list || []);
          } else {
            setBalanceLogs(prev => [...prev, ...(res.data?.list || [])]);
          }
          setHasMore((res.data.list?.length || 0) >= 10);
        } else {
          setError(res.msg || '获取余额明细失败');
        }
      } else if (activeTab === 1) {
        // 拓展明细 (提现记录)
        const res = await getMyWithdrawList({ page, limit: 10, token });
        if (res.code === 1 && res.data) {
          if (page === 1) {
            setWithdrawOrders(res.data.data || []);
          } else {
            setWithdrawOrders(prev => [...prev, ...(res.data?.data || [])]);
          }
          setHasMore(res.data.has_more || false);
        } else {
          setError(res.msg || '获取拓展明细失败');
        }
      } else if (activeTab === 2) {
        // 服务费明细 (充值订单)
        const res = await getMyOrderList({ page, limit: 10, token });
        if (res.code === 1 && res.data) {
          if (page === 1) {
            setRechargeOrders(res.data.data || []);
          } else {
            setRechargeOrders(prev => [...prev, ...(res.data?.data || [])]);
          }
          setHasMore(res.data.has_more || false);
        } else {
          setError(res.msg || '获取服务费明细失败');
        }
      }
    } catch (e: any) {
      setError(e?.message || '加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (idx: number) => {
    setActiveTab(idx);
  };

  const formatTime = (timestamp: number | string | null): string => {
    if (!timestamp) return '';
    const date = new Date(typeof timestamp === 'string' ? parseInt(timestamp) * 1000 : timestamp * 1000);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderBalanceLogItem = (item: BalanceLogItem) => (
    <div key={item.id} className="bg-white rounded-lg p-4 mb-3 shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-800 mb-1">{item.memo}</div>
          <div className="text-xs text-gray-500">{formatTime(item.create_time)}</div>
        </div>
        <div className={`text-lg font-bold ${parseFloat(item.money) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {parseFloat(item.money) >= 0 ? '+' : ''}{item.money}
        </div>
      </div>
      <div className="text-xs text-gray-400">
        余额: {item.before} → {item.after}
      </div>
    </div>
  );

  const renderRechargeOrderItem = (item: RechargeOrderItem) => (
    <div key={item.id} className="bg-white rounded-lg p-4 mb-3 shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-800 mb-1">充值订单</div>
          <div className="text-xs text-gray-500">{item.order_no}</div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-green-600">+{item.amount}</div>
          <div className={`text-xs mt-1 ${
            item.status === 1 ? 'text-green-600' : 
            item.status === 2 ? 'text-red-600' : 
            'text-yellow-600'
          }`}>
            {item.status_text}
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          <div>支付方式: {item.payment_type_text}</div>
          <div className="mt-1">创建时间: {item.create_time_text}</div>
          {item.audit_time_text && (
            <div className="mt-1">审核时间: {item.audit_time_text}</div>
          )}
        </div>
      </div>
    </div>
  );

  const renderWithdrawOrderItem = (item: WithdrawOrderItem) => (
    <div key={item.id} className="bg-white rounded-lg p-4 mb-3 shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-800 mb-1">提现申请</div>
          <div className="text-xs text-gray-500">{item.account_type_text}</div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-red-600">-{item.amount}</div>
          <div className={`text-xs mt-1 ${
            item.status === 1 ? 'text-green-600' : 
            item.status === 2 ? 'text-red-600' : 
            'text-yellow-600'
          }`}>
            {item.status_text}
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          <div>账户: {item.account_name}</div>
          <div className="mt-1">账号: {item.account_number}</div>
          <div className="mt-1">创建时间: {item.create_time_text}</div>
          {item.audit_time_text && (
            <div className="mt-1">审核时间: {item.audit_time_text}</div>
          )}
          {item.audit_reason && (
            <div className="mt-1 text-red-500">审核原因: {item.audit_reason}</div>
          )}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading && page === 1) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <Loader2 size={32} className="animate-spin mb-4" />
          <span className="text-xs">加载中...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-red-400">
          <div className="w-16 h-16 mb-4 border-2 border-red-200 rounded-lg flex items-center justify-center">
            <FileText size={32} className="opacity-50" />
          </div>
          <span className="text-xs">{error}</span>
        </div>
      );
    }

    if (activeTab === 0) {
      // 余额明细
      if (balanceLogs.length === 0) {
        return (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <div className="w-16 h-16 mb-4 border-2 border-gray-200 rounded-lg flex items-center justify-center">
              <FileText size={32} className="opacity-50" />
            </div>
            <span className="text-xs">暂无数据</span>
          </div>
        );
      }
      return (
        <div>
          {balanceLogs.map(renderBalanceLogItem)}
          {hasMore && (
            <button
              onClick={() => setPage(prev => prev + 1)}
              disabled={loading}
              className="w-full py-2 text-sm text-blue-600 disabled:opacity-50"
            >
              {loading ? '加载中...' : '加载更多'}
            </button>
          )}
        </div>
      );
    } else if (activeTab === 1) {
      // 拓展明细
      if (withdrawOrders.length === 0) {
        return (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <div className="w-16 h-16 mb-4 border-2 border-gray-200 rounded-lg flex items-center justify-center">
              <FileText size={32} className="opacity-50" />
            </div>
            <span className="text-xs">暂无数据</span>
          </div>
        );
      }
      return (
        <div>
          {withdrawOrders.map(renderWithdrawOrderItem)}
          {hasMore && (
            <button
              onClick={() => setPage(prev => prev + 1)}
              disabled={loading}
              className="w-full py-2 text-sm text-blue-600 disabled:opacity-50"
            >
              {loading ? '加载中...' : '加载更多'}
            </button>
          )}
        </div>
      );
    } else if (activeTab === 2) {
      // 服务费明细
      if (rechargeOrders.length === 0) {
        return (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <div className="w-16 h-16 mb-4 border-2 border-gray-200 rounded-lg flex items-center justify-center">
              <FileText size={32} className="opacity-50" />
            </div>
            <span className="text-xs">暂无数据</span>
          </div>
        );
      }
      return (
        <div>
          {rechargeOrders.map(renderRechargeOrderItem)}
          {hasMore && (
            <button
              onClick={() => setPage(prev => prev + 1)}
              disabled={loading}
              className="w-full py-2 text-sm text-blue-600 disabled:opacity-50"
            >
              {loading ? '加载中...' : '加载更多'}
            </button>
          )}
        </div>
      );
    } else {
      // 赠送服务
      return (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <div className="w-16 h-16 mb-4 border-2 border-gray-200 rounded-lg flex items-center justify-center">
            <FileText size={32} className="opacity-50" />
          </div>
          <span className="text-xs">暂无数据</span>
        </div>
      );
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white px-4 py-3 flex items-center sticky top-0 z-10">
          <button onClick={onBack} className="absolute left-4 p-1"><ArrowLeft size={20} /></button>
          <h1 className="text-lg font-bold text-gray-800 w-full text-center">我的资产</h1>
          <button 
            onClick={() => onNavigate('asset-history')} 
            className="absolute right-4 text-sm text-blue-600"
          >
            历史记录
          </button>
      </header>
      <div className="p-4">
           {/* Asset Card */}
           <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-6 text-white shadow-lg mb-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                  <div className="text-sm opacity-90 mb-1">可用余额 (元)</div>
                  <div className="text-4xl font-bold mb-6">¥ 0.00</div>
                  
                  <div className="w-full h-px bg-white opacity-20 mb-4"></div>
                  
                  <div className="flex justify-between text-sm">
                      <div>
                          <div className="opacity-70 text-xs mb-1">充值服务费</div>
                          <div className="font-medium">0.00</div>
                      </div>
                      <div>
                          <div className="opacity-70 text-xs mb-1">拓展服务费</div>
                          <div className="font-medium">0.00</div>
                      </div>
                      <div>
                          <div className="opacity-70 text-xs mb-1">赠送服务费</div>
                          <div className="font-medium">0.00</div>
                      </div>
                  </div>
              </div>
          </div>

         {/* Actions */}
         <div className="grid grid-cols-4 gap-4 mb-8">
             {[
                 {label: '余额充值', icon: Wallet, page: 'asset:balance-recharge'},
                 {label: '余额提现', icon: Receipt, page: 'asset:balance-withdraw'},
                 {label: '拓展提现', icon: Receipt, page: 'asset:extension-withdraw'},
                 {label: '服务充值', icon: CreditCard, page: 'asset:service-recharge'}
             ].map((item, idx) => (
                 <button
                   key={idx}
                   type="button"
                   onClick={() => onNavigate(item.page)}
                   className="flex flex-col items-center focus:outline-none active:opacity-80"
                 >
                     <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mb-2 text-gray-700">
                         <item.icon size={20} />
                     </div>
                     <span className="text-xs text-gray-600">{item.label}</span>
                 </button>
             ))}
         </div>

          {/* Tabs */}
          <div className="flex justify-between bg-white p-1 rounded-full mb-8">
              {tabs.map((tab, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => handleTabChange(idx)}
                    className={`flex-1 py-2 text-xs rounded-full transition-colors ${
                      idx === activeTab ? 'bg-blue-100 text-blue-600 font-bold' : 'text-gray-500'
                    }`}
                  >
                      {tab}
                  </button>
              ))}
          </div>

          {/* Content */}
          {renderContent()}
      </div>
    </div>
  );
};

export default AssetView;
