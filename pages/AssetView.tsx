
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Wallet, Receipt, CreditCard, FileText, Loader2, ShoppingBag, Package, ArrowRight, X, AlertCircle, CheckCircle } from 'lucide-react';
import {
  getBalanceLog,
  getMyOrderList,
  getMyWithdrawList,
  getMyCollection,
  deliverCollectionItem,
  consignCollectionItem,
  BalanceLogItem,
  RechargeOrderItem,
  WithdrawOrderItem,
  MyCollectionItem,
  AUTH_TOKEN_KEY,
  normalizeAssetUrl,
} from '../services/api';
import { Product } from '../types';

interface AssetViewProps {
  onBack: () => void;
  onNavigate: (page: string) => void;
  onProductSelect?: (product: Product) => void;
}

const AssetView: React.FC<AssetViewProps> = ({ onBack, onNavigate, onProductSelect }) => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [balanceLogs, setBalanceLogs] = useState<BalanceLogItem[]>([]);
  const [rechargeOrders, setRechargeOrders] = useState<RechargeOrderItem[]>([]);
  const [withdrawOrders, setWithdrawOrders] = useState<WithdrawOrderItem[]>([]);
  const [myCollections, setMyCollections] = useState<MyCollectionItem[]>([]);

  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);

  // 弹窗状态
  const [showActionModal, setShowActionModal] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<MyCollectionItem | null>(null);
  const [actionTab, setActionTab] = useState<'delivery' | 'consignment'>('delivery');

  // 寄售券数量（模拟数据，实际应从API获取）
  const [consignmentTicketCount, setConsignmentTicketCount] = useState<number>(0);

  // 48小时倒计时
  const [countdown, setCountdown] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
  // 寄售价格
  const [consignPrice, setConsignPrice] = useState<string>('');
  // 操作错误提示
  const [actionError, setActionError] = useState<string | null>(null);
  // 操作提交状态
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const tabs = ['余额明细', '拓展明细', '服务费明细', '我的藏品'];

  // Reset page when tab changes
  useEffect(() => {
    setPage(1);
    setBalanceLogs([]);
    setRechargeOrders([]);
    setWithdrawOrders([]);
    setMyCollections([]);
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
      } else if (activeTab === 3) {
        // 我的藏品
        const res = await getMyCollection({ page, limit: 10, token });
        if (res.code === 1 && res.data) {
          const list = res.data.list || [];
          if (page === 1) {
            setMyCollections(list);
          } else {
            setMyCollections(prev => [...prev, ...list]);
          }
          setHasMore((list.length || 0) >= 10 && res.data.has_more !== false);
          if (typeof res.data.consignment_coupon === 'number') {
            setConsignmentTicketCount(res.data.consignment_coupon);
          }
        } else {
          setError(res.msg || '获取我的藏品失败');
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
          <div className={`text-xs mt-1 ${item.status === 1 ? 'text-green-600' :
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
          <div className={`text-xs mt-1 ${item.status === 1 ? 'text-green-600' :
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

  // 检查是否满足48小时
  const check48Hours = (buyTime: number): { passed: boolean; hoursLeft: number } => {
    const now = Math.floor(Date.now() / 1000);
    const hoursPassed = (now - buyTime) / 3600;
    const hoursLeft = 48 - hoursPassed;
    return {
      passed: hoursPassed >= 48,
      hoursLeft: Math.max(0, Math.ceil(hoursLeft)),
    };
  };

  // 获取寄售券数量（模拟，实际应从API获取）
  const getConsignmentTicketCount = (): number => {
    // TODO: 从API获取用户寄售券数量
    return consignmentTicketCount; // 模拟：返回状态中的数量
  };

  // 检查是否有寄售券
  const checkConsignmentTicket = (): boolean => {
    return getConsignmentTicketCount() > 0;
  };

  // 计算48小时倒计时
  const calculateCountdown = (buyTime: number) => {
    const now = Math.floor(Date.now() / 1000);
    const elapsed = now - buyTime;
    const totalSeconds = 48 * 3600 - elapsed;

    if (totalSeconds <= 0) {
      return null; // 已超过48小时
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return { hours, minutes, seconds };
  };

  // 更新倒计时
  useEffect(() => {
    if (!showActionModal || !selectedItem || actionTab !== 'consignment') {
      setCountdown(null);
      return;
    }

    const timeCheck = check48Hours(selectedItem.buy_time);
    if (timeCheck.passed) {
      setCountdown(null);
      return;
    }

    // 立即计算一次
    const initialCountdown = calculateCountdown(selectedItem.buy_time);
    setCountdown(initialCountdown);

    // 每秒更新一次
    const interval = setInterval(() => {
      const newCountdown = calculateCountdown(selectedItem.buy_time);
      if (newCountdown) {
        setCountdown(newCountdown);
      } else {
        setCountdown(null);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [showActionModal, selectedItem, actionTab]);

  // 加载寄售券数量（模拟）
  useEffect(() => {
    // TODO: 从API获取寄售券数量
    // 模拟数据
    setConsignmentTicketCount(3); // 模拟有3张寄售券
  }, []);

  // 如果曾经寄售过，强制切换到提货标签
  useEffect(() => {
    if (showActionModal && selectedItem) {
      // 如果正在寄售中、已寄售成功、或曾经寄售过，强制切换到提货标签
      if (isConsigning(selectedItem) || hasConsignedSuccessfully(selectedItem) || hasConsignedBefore(selectedItem)) {
        if (actionTab === 'consignment') {
          setActionTab('delivery');
        }
      }
    }
  }, [showActionModal, selectedItem]);

  // 当切换标签或选择的藏品变化时，重置寄售价格与错误信息
  useEffect(() => {
    if (!showActionModal || !selectedItem) {
      setConsignPrice('');
      setActionError(null);
      return;
    }

    if (actionTab === 'consignment') {
      const priceValue = selectedItem.price
        ? Number(selectedItem.price)
        : 0;
      setConsignPrice(priceValue > 0 ? priceValue.toFixed(2) : '');
    }

    setActionError(null);
  }, [actionTab, showActionModal, selectedItem]);

  // 检查是否曾经寄售过
  const hasConsignedBefore = (item: MyCollectionItem): boolean => {
    // 如果寄售状态不是0（未寄售），说明曾经寄售过
    return item.consignment_status !== 0;
  };

  // 检查是否已经寄售成功（已售出）
  const hasConsignedSuccessfully = (item: MyCollectionItem): boolean => {
    // 寄售状态为4表示已售出（寄售成功）
    return item.consignment_status === 4;
  };

  // 检查是否正在寄售中
  const isConsigning = (item: MyCollectionItem): boolean => {
    // 寄售状态为2表示寄售中
    return item.consignment_status === 2;
  };

  // 检查是否已提货
  const isDelivered = (item: MyCollectionItem): boolean => {
    // 提货状态为1表示已提货
    return item.delivery_status === 1;
  };

  const resolveCollectionId = (item: MyCollectionItem): number | string | undefined => {
    return (
      item.user_collection_id ??
      item.original_record?.user_collection_id ??
      item.original_record?.order_id ??
      item.original_record?.id ??
      item.id ??
      item.item_id
    );
  };

  const handleItemClick = (item: MyCollectionItem) => {
    setSelectedItem(item);
    // 根据状态设置默认标签
    // 如果曾经寄售过、正在寄售中、或已寄售成功，只显示提货标签
    if (isConsigning(item) || hasConsignedSuccessfully(item) || hasConsignedBefore(item)) {
      setActionTab('delivery'); // 只显示提货
    } else if (item.delivery_status === 0) {
      setActionTab('delivery'); // 未提货，默认显示提货
    } else if (item.consignment_status === 0) {
      setActionTab('consignment'); // 已提货且未寄售，默认显示寄售
    } else {
      setActionTab('delivery'); // 其他情况默认显示提货
    }
    setActionError(null);
    setConsignPrice('');
    setShowActionModal(true);
  };

  // 检查是否可以执行操作
  const canPerformAction = (): boolean => {
    if (!selectedItem) return false;

    // 如果正在寄售中，不能提货也不能寄售
    if (isConsigning(selectedItem)) {
      return false;
    }

    // 如果已经寄售成功（已售出），不能提货也不能寄售
    if (hasConsignedSuccessfully(selectedItem)) {
      return false;
    }

    const collectionId = resolveCollectionId(selectedItem);
    if (collectionId === undefined || collectionId === null) {
      alert('无法获取藏品ID，无法继续操作');
      return;
    }

    if (actionTab === 'delivery') {
      // 如果已提货，不能再提货
      if (isDelivered(selectedItem)) {
        return false;
      }
      const timeCheck = check48Hours(selectedItem.buy_time);
      return timeCheck.passed; // 提货只需要满足48小时
    } else {
      // 寄售不需要先提货，提货和寄售可以独立选择
      const timeCheck = check48Hours(selectedItem.buy_time);
      const hasTicket = checkConsignmentTicket();
      return timeCheck.passed && hasTicket; // 寄售需要满足48小时且有寄售券
    }
  };

  const handleConfirmAction = () => {
    if (!selectedItem || actionLoading) return;

    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      alert('请先登录后再进行操作');
      return;
    }

    const runLoad = () => {
      setPage(1);
      loadData();
    };

    const collectionId = resolveCollectionId(selectedItem);
    if (collectionId === undefined || collectionId === null) {
      alert('无法获取藏品ID，无法继续操作');
      return;
    }

    if (actionTab === 'delivery') {
      // 提货逻辑
      // 检查是否正在寄售中
      if (isConsigning(selectedItem)) {
        alert('该藏品正在寄售中，无法提货');
        return;
      }

      // 检查是否已经寄售成功（已售出）
      if (hasConsignedSuccessfully(selectedItem)) {
        alert('该藏品已经寄售成功（已售出），无法提货');
        return;
      }

      // 检查是否已提货
      if (isDelivered(selectedItem)) {
        alert('该藏品已经提货，无法再次提货');
        return;
      }

      const timeCheck = check48Hours(selectedItem.buy_time);
      if (!timeCheck.passed) {
        alert(`提货需要满足购买后48小时，还需等待 ${timeCheck.hoursLeft} 小时`);
        return;
      }

      const hasConsigned = hasConsignedBefore(selectedItem);
      if (hasConsigned) {
        // 如果寄售过（但不是已售出），强制提货
        if (confirm('该藏品曾经寄售过，确定要强制提货吗？')) {
          setActionLoading(true);
          deliverCollectionItem({
            user_collection_id: collectionId,
            address_id: null,
            token,
          })
            .then((res) => {
              alert(res.msg || '提货申请已提交');
              setShowActionModal(false);
              setSelectedItem(null);
              runLoad();
            })
            .catch((err: any) => {
              alert(err?.msg || err?.message || '提货申请失败');
            })
            .finally(() => setActionLoading(false));
        }
      } else {
        setActionLoading(true);
        deliverCollectionItem({
          user_collection_id: collectionId,
          address_id: null,
          token,
        })
          .then((res) => {
            alert(res.msg || '提货申请已提交');
            setShowActionModal(false);
            setSelectedItem(null);
            runLoad();
          })
          .catch((err: any) => {
            alert(err?.msg || err?.message || '提货申请失败');
          })
          .finally(() => setActionLoading(false));
      }
    } else {
      // 寄售逻辑
      // 检查是否正在寄售中
      if (isConsigning(selectedItem)) {
        alert('该藏品正在寄售中，无法再次寄售');
        return;
      }

      // 检查是否已经寄售成功（已售出）
      if (hasConsignedSuccessfully(selectedItem)) {
        alert('该藏品已经寄售成功（已售出），无法再次寄售');
        return;
      }

      const timeCheck = check48Hours(selectedItem.buy_time);
      if (!timeCheck.passed) {
        alert(`寄售需要满足购买后48小时，还需等待 ${timeCheck.hoursLeft} 小时`);
        return;
      }

      const hasTicket = checkConsignmentTicket();
      if (!hasTicket) {
        alert('您没有寄售券，无法进行寄售');
        return;
      }

      const priceValue = parseFloat(consignPrice || '0');
      if (Number.isNaN(priceValue) || priceValue <= 0) {
        setActionError('请输入有效的寄售价格');
        return;
      }

      setActionLoading(true);
      consignCollectionItem({
        user_collection_id: collectionId,
        price: priceValue,
        token,
      })
        .then((res) => {
          alert(res.msg || '寄售申请已提交');
          setShowActionModal(false);
          setSelectedItem(null);
          runLoad();
        })
        .catch((err: any) => {
          const msg = err?.msg || err?.message || '寄售申请失败';
          setActionError(msg);
        })
        .finally(() => setActionLoading(false));
    }
  };

  const renderCollectionItem = (item: MyCollectionItem) => (
    <div
      key={item.id}
      className="bg-white rounded-lg p-4 mb-3 shadow-sm cursor-pointer active:bg-gray-50 transition-colors"
      onClick={() => handleItemClick(item)}
    >
      <div className="flex gap-3">
        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={normalizeAssetUrl(item.image)}
            alt={item.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150';
            }}
          />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-1">
            <div className="text-sm font-medium text-gray-800 flex-1">{item.title}</div>
            <ArrowRight size={16} className="text-gray-400 ml-2 flex-shrink-0" />
          </div>
          <div className="text-xs text-gray-500 mb-2">购买时间: {item.buy_time_text}</div>
          <div className="text-sm font-bold text-gray-900 mb-2">¥ {item.price}</div>

          <div className="flex gap-2 flex-wrap">
            {/* 如果已售出，只显示"已售出"标签 */}
            {item.consignment_status === 4 ? (
              <div className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-600 border border-green-200">
                已售出
              </div>
            ) : item.consignment_status === 2 ? (
              /* 如果正在寄售中，只显示"寄售中"标签 */
              <div className="text-xs px-2 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-200">
                寄售中
              </div>
            ) : item.delivery_status === 1 ? (
              /* 如果已提货且未寄售，只显示"已提货"标签 */
              <div className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-600 border border-green-200">
                ✓ 已提货
              </div>
            ) : hasConsignedBefore(item) ? (
              /* 如果曾经寄售过（需要强制提货），只显示"待提货"标签 */
              <div className="text-xs px-2 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-200">
                待提货
              </div>
            ) : (
              /* 未提货且未寄售过，显示提货状态和寄售状态 */
              <>
                <div className="text-xs px-2 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-200">
                  ○ 未提货
                </div>
                <div className={`text-xs px-2 py-1 rounded-full ${item.consignment_status === 0
                    ? 'bg-gray-50 text-gray-600 border border-gray-200'
                    : item.consignment_status === 1
                      ? 'bg-yellow-50 text-yellow-600 border border-yellow-200'
                      : item.consignment_status === 3
                        ? 'bg-red-50 text-red-600 border border-red-200'
                        : 'bg-green-50 text-green-600 border border-green-200'
                  }`}>
                  {item.consignment_status_text || '未寄售'}
                </div>
              </>
            )}
          </div>
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
              className="w-full py-2 text-sm text-orange-600 disabled:opacity-50"
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
              className="w-full py-2 text-sm text-orange-600 disabled:opacity-50"
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
              className="w-full py-2 text-sm text-orange-600 disabled:opacity-50"
            >
              {loading ? '加载中...' : '加载更多'}
            </button>
          )}
        </div>
      );
    } else {
      // 我的藏品（activeTab === 3）
      if (myCollections.length === 0) {
        return (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <div className="w-16 h-16 mb-4 border-2 border-gray-200 rounded-lg flex items-center justify-center">
              <ShoppingBag size={32} className="opacity-50" />
            </div>
            <span className="text-xs">暂无藏品</span>
          </div>
        );
      }
      return (
        <div>
          {myCollections.map(renderCollectionItem)}
          {hasMore && (
            <button
              onClick={() => setPage(prev => prev + 1)}
              disabled={loading}
              className="w-full py-2 text-sm text-orange-600 disabled:opacity-50"
            >
              {loading ? '加载中...' : '加载更多'}
            </button>
          )}
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
          className="absolute right-4 text-sm text-orange-600"
        >
          历史记录
        </button>
      </header>
      <div className="p-4">
        {/* Asset Card */}
        <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl p-6 text-white shadow-lg mb-6 relative overflow-hidden">
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
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: '余额充值', icon: Wallet, page: 'asset:balance-recharge' },
            { label: '余额提现', icon: Receipt, page: 'asset:balance-withdraw' },
            { label: '拓展提现', icon: Receipt, page: 'asset:extension-withdraw' },
            { label: '服务充值', icon: CreditCard, page: 'asset:service-recharge' }
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
              className={`flex-1 py-2 text-xs rounded-full transition-colors ${idx === activeTab ? 'bg-orange-100 text-orange-600 font-bold' : 'text-gray-500'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        {renderContent()}
      </div>

      {/* 操作弹窗 */}
      {showActionModal && selectedItem && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setShowActionModal(false)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-sm w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 关闭按钮 */}
            <button
              type="button"
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600"
              onClick={() => setShowActionModal(false)}
            >
              <X size={20} />
            </button>

            {/* 藏品信息 */}
            <div className="flex gap-3 mb-4">
              <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={normalizeAssetUrl(selectedItem.image)}
                  alt={selectedItem.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150';
                  }}
                />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-800 mb-1">{selectedItem.title}</div>
                <div className="text-xs text-gray-500">购买时间: {selectedItem.buy_time_text}</div>
                <div className="text-sm font-bold text-gray-900 mt-1">¥ {selectedItem.price}</div>
              </div>
            </div>

            {/* 标签切换 */}
            {(() => {
              // 如果正在寄售中、已寄售成功、已提货、或曾经寄售过，不显示任何标签
              if (isConsigning(selectedItem) ||
                hasConsignedSuccessfully(selectedItem) ||
                isDelivered(selectedItem) ||
                hasConsignedBefore(selectedItem)) {
                return null;
              }

              // 显示提货和寄售两个标签
              return (
                <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
                  <button
                    onClick={() => setActionTab('delivery')}
                    className={`flex-1 py-2 text-xs rounded-md transition-colors ${actionTab === 'delivery'
                        ? 'bg-white text-orange-600 font-medium shadow-sm'
                        : 'text-gray-600'
                      }`}
                  >
                    提货
                  </button>
                  <button
                    onClick={() => setActionTab('consignment')}
                    className={`flex-1 py-2 text-xs rounded-md transition-colors ${actionTab === 'consignment'
                        ? 'bg-white text-orange-600 font-medium shadow-sm'
                        : 'text-gray-600'
                      }`}
                  >
                    寄售
                  </button>
                </div>
              );
            })()}

            {/* 检查信息显示 */}
            <div className="space-y-3 mb-4">
              {actionTab === 'delivery' ? (
                <>
                  {/* 寄售中检查（优先级最高） */}
                  {isConsigning(selectedItem) && (
                    <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                      <AlertCircle size={16} />
                      <span>该藏品正在寄售中，无法提货</span>
                    </div>
                  )}

                  {/* 已寄售成功检查 */}
                  {!isConsigning(selectedItem) && hasConsignedSuccessfully(selectedItem) && (
                    <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                      <AlertCircle size={16} />
                      <span>该藏品已经寄售成功（已售出），无法提货</span>
                    </div>
                  )}

                  {/* 已提货检查 */}
                  {!isConsigning(selectedItem) && !hasConsignedSuccessfully(selectedItem) && isDelivered(selectedItem) && (
                    <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                      <AlertCircle size={16} />
                      <span>该藏品已经提货，无法再次提货</span>
                    </div>
                  )}

                  {/* 48小时检查 */}
                  {!isConsigning(selectedItem) && !hasConsignedSuccessfully(selectedItem) && !isDelivered(selectedItem) && (() => {
                    const timeCheck = check48Hours(selectedItem.buy_time);
                    return timeCheck.passed ? (
                      <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                        <CheckCircle size={16} />
                        <span>已满足48小时提货条件</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
                        <AlertCircle size={16} />
                        <span>还需等待 {timeCheck.hoursLeft} 小时才能提货</span>
                      </div>
                    );
                  })()}

                  {/* 寄售历史检查 */}
                  {!isConsigning(selectedItem) && !hasConsignedSuccessfully(selectedItem) && !isDelivered(selectedItem) && hasConsignedBefore(selectedItem) && (
                    <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                      <AlertCircle size={16} />
                      <span>该藏品曾经寄售过，将执行强制提货</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* 寄售中检查（优先级最高） */}
                  {isConsigning(selectedItem) && (
                    <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                      <AlertCircle size={16} />
                      <span>该藏品正在寄售中，无法再次寄售</span>
                    </div>
                  )}

                  {/* 已寄售成功检查 */}
                  {!isConsigning(selectedItem) && hasConsignedSuccessfully(selectedItem) && (
                    <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                      <AlertCircle size={16} />
                      <span>该藏品已经寄售成功（已售出），无法再次寄售</span>
                    </div>
                  )}

                  {/* 48小时倒计时 */}
                  {!isConsigning(selectedItem) && !hasConsignedSuccessfully(selectedItem) && (() => {
                    const timeCheck = check48Hours(selectedItem.buy_time);
                    if (timeCheck.passed) {
                      return (
                        <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                          <CheckCircle size={16} />
                          <span>已满足48小时寄售条件</span>
                        </div>
                      );
                    } else {
                      return (
                        <div className="bg-orange-50 px-3 py-2 rounded-lg">
                          <div className="flex items-center gap-2 text-xs text-orange-600 mb-1">
                            <AlertCircle size={16} />
                            <span>距离可寄售时间还有：</span>
                          </div>
                          {countdown ? (
                            <div className="text-sm font-bold text-orange-700 text-center">
                              {String(countdown.hours).padStart(2, '0')}:
                              {String(countdown.minutes).padStart(2, '0')}:
                              {String(countdown.seconds).padStart(2, '0')}
                            </div>
                          ) : (
                            <div className="text-xs text-orange-600 text-center">
                              计算中...
                            </div>
                          )}
                        </div>
                      );
                    }
                  })()}

                  {/* 寄售券数量显示 */}
                  {!isConsigning(selectedItem) && !hasConsignedSuccessfully(selectedItem) && (
                    <div className="bg-orange-50 px-3 py-2 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-orange-600">
                          <ShoppingBag size={16} />
                          <span>我的寄售券：</span>
                        </div>
                        <div className="text-sm font-bold text-orange-700">
                          {getConsignmentTicketCount()} 张
                        </div>
                      </div>
                      {getConsignmentTicketCount() === 0 && (
                        <div className="text-xs text-red-600 mt-1">
                          您没有寄售券，无法进行寄售
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>


            {actionError && (
              <div className="text-xs text-red-600 mb-2">{actionError}</div>
            )}

            {/* 确认按钮 */}
            <button
              onClick={handleConfirmAction}
              disabled={actionLoading || !canPerformAction()}
              className={`w-full py-3 rounded-lg text-sm font-medium transition-colors ${!actionLoading && canPerformAction()
                  ? actionTab === 'delivery'
                    ? 'bg-orange-600 text-white active:bg-orange-700'
                    : 'bg-orange-600 text-white active:bg-orange-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
              {actionLoading
                ? '提交中...'
                : actionTab === 'delivery'
                  ? '确认提货'
                  : '确认寄售'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetView;
