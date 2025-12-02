
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, FileText, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import {
  getBalanceLog,
  getMyOrderList,
  getMyWithdrawList,
  BalanceLogItem,
  RechargeOrderItem,
  WithdrawOrderItem,
  AUTH_TOKEN_KEY,
} from '../services/api';

interface AssetHistoryProps {
  onBack: () => void;
}

type HistoryItem = 
  | { type: 'balance'; data: BalanceLogItem }
  | { type: 'recharge'; data: RechargeOrderItem }
  | { type: 'withdraw'; data: WithdrawOrderItem };

const AssetHistory: React.FC<AssetHistoryProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<number>(0); // 0: 全部, 1: 余额明细, 2: 充值订单, 3: 提现记录
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [balanceLogs, setBalanceLogs] = useState<BalanceLogItem[]>([]);
  const [rechargeOrders, setRechargeOrders] = useState<RechargeOrderItem[]>([]);
  const [withdrawOrders, setWithdrawOrders] = useState<WithdrawOrderItem[]>([]);
  
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [allItems, setAllItems] = useState<HistoryItem[]>([]);
  const [balanceHasMore, setBalanceHasMore] = useState<boolean>(false);
  const [rechargeHasMore, setRechargeHasMore] = useState<boolean>(false);
  const [withdrawHasMore, setWithdrawHasMore] = useState<boolean>(false);

  const tabs = ['全部', '余额明细', '充值订单', '提现记录'];

  // Reset page when tab changes
  useEffect(() => {
    setPage(1);
    setBalanceLogs([]);
    setRechargeOrders([]);
    setWithdrawOrders([]);
    setAllItems([]);
    setBalanceHasMore(false);
    setRechargeHasMore(false);
    setWithdrawHasMore(false);
  }, [activeTab]);

  useEffect(() => {
    loadData();
  }, [activeTab, page]);

  // Merge all data when individual lists update
  useEffect(() => {
    if (activeTab === 0) {
      const items: HistoryItem[] = [
        ...balanceLogs.map(item => ({ type: 'balance' as const, data: item })),
        ...rechargeOrders.map(item => ({ type: 'recharge' as const, data: item })),
        ...withdrawOrders.map(item => ({ type: 'withdraw' as const, data: item })),
      ];
      // Sort by create_time descending
      items.sort((a, b) => {
        const timeA = a.data.create_time || 0;
        const timeB = b.data.create_time || 0;
        return timeB - timeA;
      });
      setAllItems(items);
    }
  }, [balanceLogs, rechargeOrders, withdrawOrders, activeTab]);

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
        // 全部：并行加载所有数据
        const [balanceRes, rechargeRes, withdrawRes] = await Promise.all([
          getBalanceLog({ page, limit: 10, token }),
          getMyOrderList({ page, limit: 10, token }),
          getMyWithdrawList({ page, limit: 10, token }),
        ]);

        if (balanceRes.code === 1 && balanceRes.data) {
          if (page === 1) {
            setBalanceLogs(balanceRes.data.list || []);
          } else {
            setBalanceLogs(prev => [...prev, ...(balanceRes.data?.list || [])]);
          }
          setBalanceHasMore((balanceRes.data.list?.length || 0) >= 10);
        }

        if (rechargeRes.code === 1 && rechargeRes.data) {
          if (page === 1) {
            setRechargeOrders(rechargeRes.data.data || []);
          } else {
            setRechargeOrders(prev => [...prev, ...(rechargeRes.data?.data || [])]);
          }
          setRechargeHasMore(rechargeRes.data.has_more || false);
        }

        if (withdrawRes.code === 1 && withdrawRes.data) {
          if (page === 1) {
            setWithdrawOrders(withdrawRes.data.data || []);
          } else {
            setWithdrawOrders(prev => [...prev, ...(withdrawRes.data?.data || [])]);
          }
          setWithdrawHasMore(withdrawRes.data.has_more || false);
        }

        // 更新hasMore：如果任意一种类型还有更多，就显示"加载更多"
        setHasMore(
          (balanceRes.data && (balanceRes.data.list?.length || 0) >= 10) ||
          (rechargeRes.data?.has_more) ||
          (withdrawRes.data?.has_more)
        );
      } else if (activeTab === 1) {
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
      } else if (activeTab === 2) {
        // 充值订单
        const res = await getMyOrderList({ page, limit: 10, token });
        if (res.code === 1 && res.data) {
          if (page === 1) {
            setRechargeOrders(res.data.data || []);
          } else {
            setRechargeOrders(prev => [...prev, ...(res.data?.data || [])]);
          }
          setHasMore(res.data.has_more || false);
        } else {
          setError(res.msg || '获取充值订单失败');
        }
      } else if (activeTab === 3) {
        // 提现记录
        const res = await getMyWithdrawList({ page, limit: 10, token });
        if (res.code === 1 && res.data) {
          if (page === 1) {
            setWithdrawOrders(res.data.data || []);
          } else {
            setWithdrawOrders(prev => [...prev, ...(res.data?.data || [])]);
          }
          setHasMore(res.data.has_more || false);
        } else {
          setError(res.msg || '获取提现记录失败');
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
    <div key={`balance-${item.id}`} className="bg-white rounded-lg p-4 mb-3 shadow-sm">
      <div className="flex justify-between items-start mb-2 gap-3">
        <div className="flex items-start flex-1 min-w-0">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
            <Wallet size={20} className="text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-800 mb-1 break-words">{item.memo}</div>
            <div className="text-xs text-gray-500">{formatTime(item.create_time)}</div>
          </div>
        </div>
        <div className={`text-lg font-bold flex-shrink-0 ${parseFloat(item.money) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {parseFloat(item.money) >= 0 ? '+' : ''}{item.money}
        </div>
      </div>
      <div className="text-xs text-gray-400 ml-[52px] break-words">
        余额: {item.before} → {item.after}
      </div>
    </div>
  );

  const renderRechargeOrderItem = (item: RechargeOrderItem) => (
    <div key={`recharge-${item.id}`} className="bg-white rounded-lg p-4 mb-3 shadow-sm">
      <div className="flex justify-between items-start mb-2 gap-3">
        <div className="flex items-start flex-1 min-w-0">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3 flex-shrink-0">
            <TrendingUp size={20} className="text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-800 mb-1 break-words">充值订单</div>
            <div className="text-xs text-gray-500 break-all">{item.order_no}</div>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-lg font-bold text-green-600 whitespace-nowrap">+{item.amount}</div>
          <div className={`text-xs mt-1 ${
            item.status === 1 ? 'text-green-600' : 
            item.status === 2 ? 'text-red-600' : 
            'text-yellow-600'
          }`}>
            {item.status_text}
          </div>
        </div>
      </div>
      <div className="ml-[52px] mt-2 pt-2 border-t border-gray-100">
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
    <div key={`withdraw-${item.id}`} className="bg-white rounded-lg p-4 mb-3 shadow-sm">
      <div className="flex justify-between items-start mb-2 gap-3">
        <div className="flex items-start flex-1 min-w-0">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3 flex-shrink-0">
            <TrendingDown size={20} className="text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-800 mb-1 break-words">提现申请</div>
            <div className="text-xs text-gray-500 break-words">{item.account_type_text}</div>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-lg font-bold text-red-600 whitespace-nowrap">-{item.amount}</div>
          <div className={`text-xs mt-1 ${
            item.status === 1 ? 'text-green-600' : 
            item.status === 2 ? 'text-red-600' : 
            'text-yellow-600'
          }`}>
            {item.status_text}
          </div>
        </div>
      </div>
      <div className="ml-[52px] mt-2 pt-2 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          <div className="break-words">账户: {item.account_name}</div>
          <div className="mt-1 break-all">账号: {item.account_number}</div>
          <div className="mt-1">创建时间: {item.create_time_text}</div>
          {item.audit_time_text && (
            <div className="mt-1">审核时间: {item.audit_time_text}</div>
          )}
          {item.audit_reason && (
            <div className="mt-1 text-red-500 break-words">审核原因: {item.audit_reason}</div>
          )}
        </div>
      </div>
    </div>
  );

  const renderHistoryItem = (item: HistoryItem) => {
    switch (item.type) {
      case 'balance':
        return renderBalanceLogItem(item.data);
      case 'recharge':
        return renderRechargeOrderItem(item.data);
      case 'withdraw':
        return renderWithdrawOrderItem(item.data);
      default:
        return null;
    }
  };

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
      // 全部
      if (allItems.length === 0) {
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
          {allItems.map(renderHistoryItem)}
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
    } else if (activeTab === 2) {
      // 充值订单
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
    } else if (activeTab === 3) {
      // 提现记录
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
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white px-4 py-3 flex items-center sticky top-0 z-10">
        <button onClick={onBack} className="absolute left-4 p-1">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-gray-800 w-full text-center">历史记录</h1>
      </header>
      
      <div className="p-4">
        {/* Tabs */}
        <div className="flex justify-between bg-white p-1 rounded-full mb-4">
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

export default AssetHistory;

