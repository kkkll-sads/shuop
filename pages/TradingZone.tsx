
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock } from 'lucide-react';
import { Product } from '../types';

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

interface TradingItem {
  id: string;
  title: string;
  image: string;
  price: number;
}

const SESSIONS: TradingSession[] = [
  {
    id: '1',
    title: '富春山居图',
    image: 'https://picsum.photos/seed/landscape1/600/300',
    startTime: '09:00',
    endTime: '11:00',
  },
  {
    id: '2',
    title: '杭州西湖',
    image: 'https://picsum.photos/seed/landscape2/600/300',
    startTime: '14:00',
    endTime: '16:00',
  },
  {
    id: '3',
    title: '不忘初心（全天场）',
    image: 'https://picsum.photos/seed/landscape3/600/300',
    startTime: '00:00',
    endTime: '23:59', // 基本保证每天都有一个「未结束」的专场
  },
];

// 模拟每个专场下的在售藏品数据（参考积分商城样式，一排三个）
const TRADING_ITEMS: TradingItem[] = [
  {
    id: 'p1',
    title: '富春山居图 · 预售版',
    image: 'https://picsum.photos/seed/trade1/400/400',
    price: 1688,
  },
  {
    id: 'p2',
    title: '西湖十景 · 数字藏品',
    image: 'https://picsum.photos/seed/trade2/400/400',
    price: 888,
  },
  {
    id: 'p3',
    title: '不忘初心 · 典藏版',
    image: 'https://picsum.photos/seed/trade3/400/400',
    price: 1280,
  },
  {
    id: 'p4',
    title: '江南水乡 · 限量款',
    image: 'https://picsum.photos/seed/trade4/400/400',
    price: 520,
  },
  {
    id: 'p5',
    title: '华夏古韵 · 纸本设色',
    image: 'https://picsum.photos/seed/trade5/400/400',
    price: 1999,
  },
  {
    id: 'p6',
    title: '山河锦绣 · 主题典藏',
    image: 'https://picsum.photos/seed/trade6/400/400',
    price: 980,
  },
];

const TradingZone: React.FC<TradingZoneProps> = ({ onBack, onProductSelect }) => {
  const [now, setNow] = useState(new Date());
  const [selectedSession, setSelectedSession] = useState<TradingSession | null>(null);
  const [priceFilter, setPriceFilter] = useState<'all' | '0-1k' | '1-4k' | '4-8k' | '8k+'>('all');

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleBack = () => {
    if (selectedSession) {
      setSelectedSession(null);
    } else {
      onBack();
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
                <span className="text-[11px] text-gray-400">共 {TRADING_ITEMS.length} 件</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {TRADING_ITEMS.filter((item) => {
                  if (priceFilter === 'all') return true;
                  if (priceFilter === '0-1k') return item.price < 1000;
                  if (priceFilter === '1-4k') return item.price >= 1000 && item.price < 4000;
                  if (priceFilter === '4-8k') return item.price >= 4000 && item.price < 8000;
                  return item.price >= 8000;
                }).map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-50 rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(15,23,42,0.08)] active:scale-[0.97] transition-transform cursor-pointer flex flex-col relative"
                    onClick={() => {
                      if (!onProductSelect) return;
                      const product: Product = {
                        id: item.id,
                        title: item.title,
                        artist: selectedSession ? selectedSession.title : '交易专区',
                        price: item.price,
                        image: item.image,
                        category: '交易专区',
                      };
                      onProductSelect(product);
                    }}
                  >
                    {/* 顶部“交易开始”角标 */}
                    <div className="absolute top-0 left-0 z-10">
                      <div className="bg-blue-500 text-[10px] text-white px-2 py-0.5 rounded-br-lg rounded-tl-none rounded-tr-none">
                        交易开始
                      </div>
                    </div>
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
                      <div className="text-[11px] text-red-500 font-bold">
                        <span className="text-[9px] mr-0.5">¥</span>
                        {item.price.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
            {SESSIONS.map((session) => {
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
                          onClick={() => setSelectedSession(session)}
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
            })}
          </>
        )}
      </div>
    </div>
  );
};

export default TradingZone;
