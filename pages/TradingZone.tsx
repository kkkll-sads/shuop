
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock } from 'lucide-react';
import { Product } from '../types';
import {
  fetchCollectionSessions,
  fetchCollectionSessionDetail,
  fetchCollectionItemsBySession,
  CollectionSessionItem,
  CollectionItem,
  getConsignmentList,
  ConsignmentItem,
} from '../services/api';

interface TradingZoneProps {
  onBack: () => void;
  onProductSelect?: (product: Product) => void;
}

interface TradingSession {
  id: string;
  title: string;
  image: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
}

type TradingDisplayItem = CollectionItem & {
  source?: 'collection' | 'consignment';
  consignment_id?: number;
  displayKey: string;
  hasStockInfo?: boolean;
};

type ConsignmentRecord = ConsignmentItem & {
  consignment_id?: number;
  consignment_price?: number;
  session_id?: number | string;
};


const TradingZone: React.FC<TradingZoneProps> = ({ onBack, onProductSelect }) => {
  const [now, setNow] = useState(new Date());
  const [selectedSession, setSelectedSession] = useState<TradingSession | null>(null);
  const [priceFilter, setPriceFilter] = useState<'all' | '0-1k' | '1-4k' | '4-8k' | '8k+'>('all');
  const [sessions, setSessions] = useState<TradingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tradingItems, setTradingItems] = useState<TradingDisplayItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemsError, setItemsError] = useState<string | null>(null);

  const mapCollectionItems = (items: CollectionItem[] = []): TradingDisplayItem[] =>
    items.map((item) => ({
      ...item,
      price: typeof item.price === 'number' ? item.price : Number(item.price) || 0,
      stock: typeof item.stock === 'number' ? item.stock : 0,
      source: 'collection',
      displayKey: `collection-${item.id}`,
      hasStockInfo: true,
    }));

  const mapConsignmentItems = (items: ConsignmentRecord[] = [], sessionId: string): TradingDisplayItem[] =>
    items
      .filter((item) => String(item.session_id ?? '') === sessionId)
      .map((item) => {
        const resolvedId =
          typeof item.item_id === 'number'
            ? item.item_id
            : typeof item.id === 'number'
            ? item.id
            : Number(item.item_id ?? item.id ?? item.consignment_id ?? Date.now());
        const resolvedPrice =
          typeof item.consignment_price === 'number'
            ? item.consignment_price
            : typeof item.price === 'number'
            ? item.price
            : Number(item.consignment_price ?? item.price ?? 0) || 0;

        const hasStockInfo = typeof (item as any).stock === 'number';
        const resolvedStock = hasStockInfo ? Number((item as any).stock) : 1; // 默认视为可售 1 件

        return {
          id: resolvedId,
          session_id: Number(item.session_id ?? sessionId),
          title: item.title,
          image: item.image,
          price: resolvedPrice,
          stock: resolvedStock,
          sales: Number((item as any).sales ?? 0),
          source: 'consignment',
          consignment_id: (item as any).consignment_id ?? resolvedId,
          displayKey: `consignment-${(item as any).consignment_id ?? resolvedId}`,
          hasStockInfo,
        };
      });

  // 获取专场列表
  useEffect(() => {
    const loadSessions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchCollectionSessions();
        if (response.code === 1 && response.data?.list) {
          const sessionList: TradingSession[] = response.data.list.map((item: CollectionSessionItem) => ({
            id: String(item.id),
            title: item.title,
            image: item.image,
            startTime: item.start_time,
            endTime: item.end_time,
          }));
          setSessions(sessionList);
        } else {
          setError(response.msg || '获取专场列表失败');
        }
      } catch (err: any) {
        console.error('加载专场列表失败:', err);
        // 优先使用接口返回的错误消息
        setError(err?.msg || err?.response?.msg || err?.message || '加载专场列表失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleBack = () => {
    if (selectedSession) {
      setSelectedSession(null);
      setTradingItems([]);
      setItemsError(null);
    } else {
      onBack();
    }
  };

  const handleSessionSelect = async (session: TradingSession) => {
    try {
      setItemsLoading(true);
      setItemsError(null);

      const [_, itemsResult, consignmentResult] = await Promise.allSettled([
        fetchCollectionSessionDetail(session.id),
        fetchCollectionItemsBySession(session.id, {
          page: 1,
          limit: 100,
        }),
        getConsignmentList({
          page: 1,
          limit: 100,
        }),
      ]);

      const combinedItems: TradingDisplayItem[] = [];
      const tempErrors: string[] = [];

      if (itemsResult.status === 'fulfilled') {
        const response = itemsResult.value;
        if (response.code === 1 && response.data?.list) {
          combinedItems.push(...mapCollectionItems(response.data.list));
        } else {
          tempErrors.push(response.msg || '获取商品列表失败');
        }
      } else if (itemsResult.reason) {
        const message =
          itemsResult.reason?.msg ||
          itemsResult.reason?.message ||
          (typeof itemsResult.reason === 'string' ? itemsResult.reason : '');
        tempErrors.push(message || '获取商品列表失败');
      }

      if (consignmentResult.status === 'fulfilled') {
        const response = consignmentResult.value;
        if (response.code === 1 && response.data?.list) {
          combinedItems.push(...mapConsignmentItems(response.data.list as ConsignmentRecord[], session.id));
        } else if (response.msg) {
          tempErrors.push(response.msg);
        }
      } else if (consignmentResult.reason) {
        const message =
          consignmentResult.reason?.msg ||
          consignmentResult.reason?.message ||
          (typeof consignmentResult.reason === 'string' ? consignmentResult.reason : '');
        if (message && /登录/.test(message)) {
          console.warn('获取寄售列表失败（未登录或无权限）:', message);
        } else if (message) {
          tempErrors.push(message);
        }
      }

      setTradingItems(combinedItems);
      setSelectedSession(session);

      if (!combinedItems.length && tempErrors.length) {
        setItemsError(tempErrors.join('；'));
      } else {
        setItemsError(null);
      }
    } catch (err: any) {
      console.error('获取专场数据失败:', err);
      setItemsError(err?.msg || err?.response?.msg || err?.message || '加载专场数据失败，请稍后重试');
      setSelectedSession(session);
    } finally {
      setItemsLoading(false);
    }
  };

  const getSessionStatus = (session: TradingSession) => {
    const [startH, startM] = session.startTime.split(':').map(Number);
    const [endH, endM] = session.endTime.split(':').map(Number);

    const startDate = new Date(now);
    startDate.setHours(startH, startM, 0, 0);

    const endDate = new Date(now);
    endDate.setHours(endH, endM, 0, 0);

    // If currently past the end time for today, it's ended
    // If we wanted to handle "tomorrow's session", we would check date logic, 
    // but for a daily trading view, "ended" is correct for the rest of the day.
    
    if (now < startDate) {
      return { status: 'waiting', target: startDate };
    } else if (now >= startDate && now < endDate) {
      return { status: 'active', target: endDate };
    } else {
      return { status: 'ended', target: null };
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 0) return "00:00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const filteredTradingItems = tradingItems.filter((item) => {
    const priceValue = typeof item.price === 'number' ? item.price : Number(item.price) || 0;
    if (priceFilter === 'all') return true;
    if (priceFilter === '0-1k') return priceValue < 1000;
    if (priceFilter === '1-4k') return priceValue >= 1000 && priceValue < 4000;
    if (priceFilter === '4-8k') return priceValue >= 4000 && priceValue < 8000;
    return priceValue >= 8000;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      <header className="bg-white px-4 py-3 flex items-center sticky top-0 z-10 shadow-sm">
        <button onClick={handleBack} className="absolute left-4 p-1 text-gray-600">
            <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-gray-800 w-full text-center">
          {selectedSession ? `${selectedSession.title} · 专场详情` : '交易专区'}
        </h1>
      </header>
      
      <div className="p-4 space-y-4">
        {selectedSession ? (
          <>
            {/* 顶部蓝色头部 + 倒计时（参考截图） */}
            <div className="w-full rounded-xl overflow-hidden shadow-md bg-blue-500 text-white">
              <div className="px-4 pt-3 pb-3 flex items-center justify-between">
                <div className="text-left">
                  <p className="text-xs opacity-90 mb-0.5">商品专区</p>
                  <p className="text-sm font-semibold truncate max-w-[8rem]">
                    {selectedSession.title}
                  </p>
                </div>
                <div className="flex flex-col items-end text-xs">
                  {(() => {
                    const { target } = getSessionStatus(selectedSession);
                    let display = '00:00:00';
                    if (target) {
                      const diff = target.getTime() - now.getTime();
                      display = formatDuration(diff);
                    }
                    return (
                      <>
                        <span className="mb-1">距离本场次结束</span>
                        <div className="flex items-center bg-white rounded-md px-1.5 py-0.5 text-blue-600 font-mono text-xs gap-0.5 shadow-sm">
                          {display.split('').map((ch, idx) =>
                            ch === ':' ? (
                              <span key={idx} className="px-0.5">
                                :
                              </span>
                            ) : (
                              <span
                                key={idx}
                                className="w-4 h-5 rounded-[3px] bg-blue-500 text-white flex items-center justify-center text-[11px]"
                              >
                                {ch}
                              </span>
                            ),
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* 价格区间 Tabs */}
              <div className="bg-blue-400/95 px-4 pb-2">
                <div className="flex justify-between text-xs text-white/80">
                  {[
                    { id: 'all', label: '全部' },
                    { id: '0-1k', label: '0–1K' },
                    { id: '1-4k', label: '1–4K' },
                    { id: '4-8k', label: '4–8K' },
                    { id: '8k+', label: '8K+' },
                  ].map((tab) => {
                    const active = priceFilter === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setPriceFilter(tab.id as any)}
                        className={`flex-1 text-center py-1 mx-0.5 rounded-full border border-white/40 ${
                          active ? 'bg-white text-blue-500 font-semibold' : 'bg-transparent'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 专场内在售藏品（参考积分商城，一排三个） */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-blue-500 rounded-full" />
                  <span className="text-sm font-bold text-gray-800">场内在售藏品</span>
                </div>
                <span className="text-[11px] text-gray-400">
                  {itemsLoading ? '加载中...' : `共 ${tradingItems.length} 件`}
                </span>
              </div>

              {itemsLoading ? (
                <div className="py-8 text-center text-gray-500 text-sm">
                  加载商品中...
                </div>
              ) : itemsError ? (
                <div className="py-8 text-center text-red-500 text-sm">
                  {itemsError}
                </div>
              ) : filteredTradingItems.length === 0 ? (
                <div className="py-8 text-center text-gray-500 text-sm">
                  暂无商品
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {filteredTradingItems.map((item) => {
                    const priceValue = typeof item.price === 'number' ? item.price : Number(item.price) || 0;
                    const stockValue = typeof item.stock === 'number' ? item.stock : null;
                    const showStock = (item.hasStockInfo ?? (stockValue !== null)) && stockValue !== null;
                    const isSoldOut = showStock && stockValue <= 0;
                    const itemKey =
                      item.displayKey || `${item.source ?? 'collection'}-${item.consignment_id ?? item.id}`;
                    return (
                      <div
                        key={itemKey}
                        className={`bg-gray-50 rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(15,23,42,0.08)] active:scale-[0.97] transition-transform flex flex-col relative ${
                          isSoldOut ? 'opacity-60 pointer-events-none' : 'cursor-pointer'
                        }`}
                        onClick={() => {
                          if (!onProductSelect || isSoldOut) return;
                          const product: Product = {
                            id: String(item.id),
                            title: item.title,
                            artist: selectedSession ? selectedSession.title : '交易专区',
                            price: priceValue,
                            image: item.image,
                            category: '交易专区',
                            productType: 'collection', // 标记为藏品商城商品
                            consignmentId: item.source === 'consignment' ? item.consignment_id : undefined,
                          };
                          onProductSelect(product);
                        }}
                      >
                        {/* 顶部"交易开始"角标 */}
                        <div className="absolute top-0 left-0 z-10">
                          <div className="bg-blue-500 text-[10px] text-white px-2 py-0.5 rounded-br-lg rounded-tl-none rounded-tr-none">
                            交易开始
                          </div>
                        </div>
                        {isSoldOut && (
                          <div className="absolute inset-0 z-20 flex items-center justify-center">
                            <span className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full">
                              已售罄
                            </span>
                          </div>
                        )}
                        <div className="w-full aspect-[3/4] bg-gray-100">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="px-1.5 pt-1.5 pb-2 flex-1 flex flex-col justify-between">
                          <div className="h-8 mb-1">
                            <p className="text-[11px] text-gray-800 font-medium line-clamp-2 leading-4">
                              {item.title}
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-[11px] text-red-500 font-bold">
                              <span className="text-[9px] mr-0.5">¥</span>
                              {priceValue.toFixed(2)}
                            </div>
                            {showStock && (
                              <div className="text-[10px] text-gray-500">
                                库存 {Math.max(stockValue, 0)}
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
          </>
        ) : (
          <>
            {/* Blue Banner */}
            <div className="w-full h-40 rounded-xl overflow-hidden relative shadow-md bg-blue-600">
              <img 
                  src="https://picsum.photos/seed/banner1/800/400" 
                  alt="Banner" 
                  className="w-full h-full object-cover opacity-50 mix-blend-overlay"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-transparent flex flex-col justify-center p-6">
                  <h2 className="font-bold text-2xl text-white mb-2 shadow-black drop-shadow-md">文化商品数字化交易</h2>
                  <p className="text-blue-100 text-xs">畅游万亿蓝海市场 共享无限行业空间</p>
              </div>
            </div>

            {/* Session List */}
            {loading ? (
              <div className="bg-white rounded-xl p-8 text-center text-gray-500">
                加载中...
              </div>
            ) : error ? (
              <div className="bg-white rounded-xl p-8 text-center text-red-500">
                {error}
              </div>
            ) : sessions.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center text-gray-500">
                暂无专场数据
              </div>
            ) : (
              sessions.map((session) => {
              const { status, target } = getSessionStatus(session);
              
              let timerDisplay = null;
              if (target) {
                const diff = target.getTime() - now.getTime();
                timerDisplay = formatDuration(diff);
              }

              return (
                <div key={session.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                  <div className="relative h-40">
                      <img src={session.image} className="w-full h-full object-cover" alt={session.title} />
                      <div className="absolute top-3 left-0 bg-blue-500 text-white text-xs px-3 py-1 rounded-r-full">
                        交易时间: {session.startTime} - {session.endTime}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                        <div className="text-white font-bold text-2xl drop-shadow-md font-serif tracking-wide">
                          {session.title}
                        </div>
                      </div>
                      
                      {/* Status Badge Overlay if Active */}
                      {status === 'active' && (
                        <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded animate-pulse">
                          进行中
                        </div>
                      )}
                  </div>
                  
                  <div className="p-3 flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        {status === 'waiting' && (
                          <>
                            <Clock size={14} className="text-blue-500" />
                            <div className="text-blue-500 text-sm font-medium">
                              距交易开始: <span className="font-mono font-bold">{timerDisplay}</span>
                            </div>
                          </>
                        )}
                        {status === 'active' && (
                          <>
                             <Clock size={14} className="text-green-600" />
                             <div className="text-green-600 text-sm font-medium">
                              距交易结束: <span className="font-mono font-bold">{timerDisplay}</span>
                            </div>
                          </>
                        )}
                        {status === 'ended' && (
                          <div className="text-gray-400 text-sm font-medium">
                            今日交易已结束
                          </div>
                        )}
                      </div>

                      {/* Button Logic */}
                      {status === 'waiting' && (
                        <button className="bg-orange-500 text-white text-sm px-5 py-1.5 rounded-full font-medium shadow-sm opacity-90 cursor-not-allowed">
                          等待开始
                        </button>
                      )}
                      {status === 'active' && (
                        <button
                          className="bg-green-600 text-white text-sm px-5 py-1.5 rounded-full font-medium shadow-md active:scale-95 transition-transform"
                          onClick={() => handleSessionSelect(session)}
                        >
                          进入交易
                        </button>
                      )}
                      {status === 'ended' && (
                        <button className="bg-gray-200 text-gray-400 text-sm px-5 py-1.5 rounded-full font-medium cursor-not-allowed">
                          交易结束
                        </button>
                      )}
                  </div>
                </div>
              );
            })
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TradingZone;
