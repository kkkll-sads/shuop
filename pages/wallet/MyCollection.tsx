import React, { useState, useEffect } from 'react';
import { FileText, ShoppingBag, ArrowRight, X, AlertCircle, CheckCircle } from 'lucide-react';
import SubPageLayout from '../../components/SubPageLayout';
import { LoadingSpinner, EmptyState, LazyImage } from '../../components/common';
import {
  getMyCollection,
  deliverCollectionItem,
  consignCollectionItem,
  fetchProfile,
  MyCollectionItem,
  AUTH_TOKEN_KEY,
  USER_INFO_KEY,
  normalizeAssetUrl,
} from '../../services/api';
import { UserInfo } from '../../types';

interface MyCollectionProps {
  onBack: () => void;
}

const MyCollection: React.FC<MyCollectionProps> = ({ onBack }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [myCollections, setMyCollections] = useState<MyCollectionItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [consignmentTicketCount, setConsignmentTicketCount] = useState<number>(0);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  // 弹窗状态
  const [showActionModal, setShowActionModal] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<MyCollectionItem | null>(null);
  const [actionTab, setActionTab] = useState<'delivery' | 'consignment'>('delivery');
  const [countdown, setCountdown] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // 加载用户信息和寄售券数量
  useEffect(() => {
    const loadUserInfo = async () => {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!token) return;

      try {
        const cached = localStorage.getItem(USER_INFO_KEY);
        if (cached) {
          try {
            const cachedUserInfo = JSON.parse(cached);
            setUserInfo(cachedUserInfo);
          } catch (e) {
            console.warn('解析本地用户信息失败:', e);
          }
        }

        const response = await fetchProfile(token);
        if (response.code === 1 && response.data?.userInfo) {
          setUserInfo(response.data.userInfo);
          localStorage.setItem(USER_INFO_KEY, JSON.stringify(response.data.userInfo));
        }

        const collectionRes = await getMyCollection({ page: 1, limit: 1, token });
        if (collectionRes.code === 1 && collectionRes.data) {
          const count = collectionRes.data.consignment_coupon ?? 0;
          setConsignmentTicketCount(count);
        }
      } catch (err) {
        console.error('加载用户信息失败:', err);
      }
    };

    loadUserInfo();
  }, []);

  useEffect(() => {
    loadData();
  }, [page]);

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
    } catch (e: any) {
      setError(e?.message || '加载数据失败');
    } finally {
      setLoading(false);
    }
  };

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

  // 获取寄售券数量
  const getConsignmentTicketCount = (): number => {
    return consignmentTicketCount;
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
      return null;
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

    const initialCountdown = calculateCountdown(selectedItem.buy_time);
    setCountdown(initialCountdown);

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

  // 如果曾经寄售过，强制切换到提货标签
  useEffect(() => {
    if (showActionModal && selectedItem) {
      if (isConsigning(selectedItem) || hasConsignedSuccessfully(selectedItem) || hasConsignedBefore(selectedItem)) {
        if (actionTab === 'consignment') {
          setActionTab('delivery');
        }
      }
    }
  }, [showActionModal, selectedItem]);

  // 当切换标签或选择的藏品变化时，重置错误信息
  useEffect(() => {
    if (!showActionModal || !selectedItem) {
      setActionError(null);
      return;
    }

    setActionError(null);
  }, [actionTab, showActionModal, selectedItem]);

  // 检查是否曾经寄售过
  const hasConsignedBefore = (item: MyCollectionItem): boolean => {
    // 只有 consignment_status 明确不为 0 时，才认为曾经寄售过
    // 0 = 未寄售，1 = 待审核，2 = 寄售中，3 = 寄售失败，4 = 已售出
    const status = item.consignment_status;
    return typeof status === 'number' && status !== 0;
  };

  // 检查是否已经寄售成功（已售出）
  const hasConsignedSuccessfully = (item: MyCollectionItem): boolean => {
    return item.consignment_status === 4;
  };

  // 检查是否正在寄售中
  const isConsigning = (item: MyCollectionItem): boolean => {
    return item.consignment_status === 2;
  };

  // 检查是否已提货
  const isDelivered = (item: MyCollectionItem): boolean => {
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
    if (isConsigning(item) || hasConsignedSuccessfully(item) || hasConsignedBefore(item)) {
      setActionTab('delivery');
    } else if (item.delivery_status === 0) {
      setActionTab('delivery');
    } else if (item.consignment_status === 0) {
      setActionTab('consignment');
    } else {
      setActionTab('delivery');
    }
    setActionError(null);
    setShowActionModal(true);
  };

  // 检查是否可以执行操作
  const canPerformAction = (): boolean => {
    if (!selectedItem) return false;

    if (isConsigning(selectedItem)) {
      return false;
    }

    if (hasConsignedSuccessfully(selectedItem)) {
      return false;
    }

    const collectionId = resolveCollectionId(selectedItem);
    if (collectionId === undefined || collectionId === null) {
      return false;
    }

    if (actionTab === 'delivery') {
      if (isDelivered(selectedItem)) {
        return false;
      }
      const timeCheck = check48Hours(selectedItem.buy_time);
      return timeCheck.passed;
    } else {
      const timeCheck = check48Hours(selectedItem.buy_time);
      const hasTicket = checkConsignmentTicket();
      return timeCheck.passed && hasTicket;
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
      if (isConsigning(selectedItem)) {
        alert('该藏品正在寄售中，无法提货');
        return;
      }

      if (hasConsignedSuccessfully(selectedItem)) {
        alert('该藏品已经寄售成功（已售出），无法提货');
        return;
      }

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
      if (isConsigning(selectedItem)) {
        alert('该藏品正在寄售中，无法再次寄售');
        return;
      }

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

      // 使用藏品原价作为寄售价格
      const priceValue = parseFloat(selectedItem.price || '0');
      if (Number.isNaN(priceValue) || priceValue <= 0) {
        setActionError('藏品价格无效，无法进行寄售');
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
          {item.order_no && (
            <div className="text-xs text-gray-400 mb-1">订单号: {item.order_no}</div>
          )}
          <div className="text-xs text-gray-500 mb-2">购买时间: {item.buy_time_text}</div>
          <div className="text-sm font-bold text-gray-900 mb-2">¥ {item.price}</div>

          <div className="flex gap-2 flex-wrap">
            {item.consignment_status === 4 ? (
              <div className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-600 border border-green-200">
                已售出
              </div>
            ) : item.consignment_status === 2 ? (
              <div className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                寄售中
              </div>
            ) : item.delivery_status === 1 ? (
              // 已提货：显示提货订单状态（待发货/待收货/已签收）
              <div className={`text-xs px-2 py-1 rounded-full ${item.delivery_status_text === '待发货'
                ? 'bg-blue-50 text-blue-600 border border-blue-200'
                : item.delivery_status_text === '待收货'
                  ? 'bg-yellow-50 text-yellow-600 border border-yellow-200'
                  : item.delivery_status_text === '已签收'
                    ? 'bg-green-50 text-green-600 border border-green-200'
                    : 'bg-green-50 text-green-600 border border-green-200'
                }`}>
                {item.delivery_status_text || '已提货'}
              </div>
            ) : hasConsignedBefore(item) ? (
              // 待提货：显示"待提货"和"待寄售"标签
              <>
                <div className="text-xs px-2 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-200">
                  待提货
                </div>
                <div className={`text-xs px-2 py-1 rounded-full ${item.consignment_status === 0
                  ? 'bg-gray-50 text-gray-600 border border-gray-200'
                  : item.consignment_status === 1
                    ? 'bg-yellow-50 text-yellow-600 border border-yellow-200'
                    : item.consignment_status === 3
                      ? 'bg-red-50 text-red-600 border border-red-200'
                      : 'bg-green-50 text-green-600 border border-green-200'
                  }`}>
                  {item.consignment_status_text || '待寄售'}
                </div>
              </>
            ) : (
              // 未提货：显示"未提货"和寄售状态
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

  return (
    <SubPageLayout title="我的藏品" onBack={onBack}>
      <div className="p-4">
        {loading && page === 1 ? (
          <LoadingSpinner text="加载中..." />
        ) : error ? (
          <EmptyState icon={<FileText size={48} className="text-gray-300" />} title="加载失败" description={error} />
        ) : myCollections.length === 0 ? (
          <EmptyState icon={<ShoppingBag size={48} className="text-gray-300" />} title="暂无藏品" description="您还没有任何藏品" />
        ) : (
          <>
            {myCollections.map(renderCollectionItem)}
            {hasMore && (
              <button
                onClick={() => setPage(prev => prev + 1)}
                disabled={loading}
                className="w-full py-2 text-sm text-blue-600 disabled:opacity-50"
              >
                {loading ? '加载中...' : '加载更多'}
              </button>
            )}
          </>
        )}
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
            <button
              type="button"
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600"
              onClick={() => setShowActionModal(false)}
            >
              <X size={20} />
            </button>

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
                {selectedItem.order_no && (
                  <div className="text-xs text-gray-400 mb-1">订单号: {selectedItem.order_no}</div>
                )}
                <div className="text-xs text-gray-500">购买时间: {selectedItem.buy_time_text}</div>
                <div className="text-sm font-bold text-gray-900 mt-1">¥ {selectedItem.price}</div>
              </div>
            </div>

            {/* 订单详情 */}
            {selectedItem.order_no && (
              <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-100">
                <div className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <FileText size={14} />
                  订单详情
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">订单号：</span>
                    <span className="text-gray-800 font-mono">{selectedItem.order_no}</span>
                  </div>
                  {selectedItem.order_status_text && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">订单状态：</span>
                      <span className="text-gray-800">{selectedItem.order_status_text}</span>
                    </div>
                  )}
                  {selectedItem.original_record?.pay_type_text && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">支付方式：</span>
                      <span className="text-gray-800">{selectedItem.original_record.pay_type_text}</span>
                    </div>
                  )}
                  {selectedItem.original_record?.quantity && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">购买数量：</span>
                      <span className="text-gray-800">{selectedItem.original_record.quantity}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {(() => {
              if (isConsigning(selectedItem) ||
                hasConsignedSuccessfully(selectedItem) ||
                isDelivered(selectedItem) ||
                hasConsignedBefore(selectedItem)) {
                return null;
              }

              return (
                <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
                  <button
                    onClick={() => setActionTab('delivery')}
                    className={`flex-1 py-2 text-xs rounded-md transition-colors ${actionTab === 'delivery'
                      ? 'bg-white text-blue-600 font-medium shadow-sm'
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

            <div className="space-y-3 mb-4">
              {actionTab === 'delivery' ? (
                <>
                  {isConsigning(selectedItem) && (
                    <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                      <AlertCircle size={16} />
                      <span>该藏品正在寄售中，无法提货</span>
                    </div>
                  )}

                  {!isConsigning(selectedItem) && hasConsignedSuccessfully(selectedItem) && (
                    <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                      <AlertCircle size={16} />
                      <span>该藏品已经寄售成功（已售出），无法提货</span>
                    </div>
                  )}

                  {!isConsigning(selectedItem) && !hasConsignedSuccessfully(selectedItem) && isDelivered(selectedItem) && (
                    <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                      <AlertCircle size={16} />
                      <span>该藏品已经提货，无法再次提货</span>
                    </div>
                  )}

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

                  {!isConsigning(selectedItem) && !hasConsignedSuccessfully(selectedItem) && !isDelivered(selectedItem) && hasConsignedBefore(selectedItem) && (
                    <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                      <AlertCircle size={16} />
                      <span>该藏品曾经寄售过，将执行强制提货</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {isConsigning(selectedItem) && (
                    <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                      <AlertCircle size={16} />
                      <span>该藏品正在寄售中，无法再次寄售</span>
                    </div>
                  )}

                  {!isConsigning(selectedItem) && hasConsignedSuccessfully(selectedItem) && (
                    <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                      <AlertCircle size={16} />
                      <span>该藏品已经寄售成功（已售出），无法再次寄售</span>
                    </div>
                  )}

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

                  {!isConsigning(selectedItem) && !hasConsignedSuccessfully(selectedItem) && (
                    <div className="bg-blue-50 px-3 py-2 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-blue-600">
                          <ShoppingBag size={16} />
                          <span>我的寄售券：</span>
                        </div>
                        <div className="text-sm font-bold text-blue-700">
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

            <button
              onClick={handleConfirmAction}
              disabled={actionLoading || !canPerformAction()}
              className={`w-full py-3 rounded-lg text-sm font-medium transition-colors ${!actionLoading && canPerformAction()
                ? actionTab === 'delivery'
                  ? 'bg-blue-600 text-white active:bg-blue-700'
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
    </SubPageLayout>
  );
};

export default MyCollection;

