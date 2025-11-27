
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock } from 'lucide-react';

interface TradingZoneProps {
  onBack: () => void;
}

interface TradingSession {
  id: string;
  title: string;
  image: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
}

const SESSIONS: TradingSession[] = [
  {
    id: '1',
    title: '富春山居图',
    image: 'https://picsum.photos/seed/landscape1/600/300',
    startTime: '11:00',
    endTime: '11:30'
  },
  {
    id: '2',
    title: '杭州西湖',
    image: 'https://picsum.photos/seed/landscape2/600/300',
    startTime: '14:00',
    endTime: '14:30'
  },
  {
    id: '3',
    title: '不忘初心',
    image: 'https://picsum.photos/seed/landscape3/600/300',
    startTime: '16:00',
    endTime: '16:30'
  }
];

const TradingZone: React.FC<TradingZoneProps> = ({ onBack }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
        <button onClick={onBack} className="absolute left-4 p-1 text-gray-600">
            <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-gray-800 w-full text-center">交易专区</h1>
      </header>
      
      <div className="p-4 space-y-4">
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
                     <button className="bg-green-600 text-white text-sm px-5 py-1.5 rounded-full font-medium shadow-md active:scale-95 transition-transform">
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
      </div>
    </div>
  );
};

export default TradingZone;
