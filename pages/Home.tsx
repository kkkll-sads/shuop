import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, Building2, Newspaper, Palette, Trophy } from 'lucide-react';
import { ARTISTS } from '../constants';
import { Tab, NewsItem, Banner } from '../types';
import { fetchBanners, normalizeAssetUrl } from '../services/api';

interface HomeProps {
  onNavigate: (page: string) => void;
  onSwitchTab: (tab: Tab) => void;
  announcements?: NewsItem[];
}

const Home: React.FC<HomeProps> = ({ onNavigate, onSwitchTab, announcements = [] }) => {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [noticeIndex, setNoticeIndex] = useState(0);
  const [banners, setBanners] = useState<Banner[]>([]);
  
  const touchStartRef = useRef(0);
  const touchEndRef = useRef(0);
  const bannerTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const noticeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Banner Auto-play
  const startBannerTimer = () => {
    if (!banners.length) return;
    if (bannerTimerRef.current) clearInterval(bannerTimerRef.current);
    bannerTimerRef.current = setInterval(() => {
        setCurrentBanner(prev => (prev + 1) % banners.length);
    }, 4000);
  };

  // Notice Auto-scroll
  useEffect(() => {
    if (!announcements.length) return;
    noticeTimerRef.current = setInterval(() => {
        setNoticeIndex(prev => (prev + 1) % announcements.length);
    }, 3000);
    return () => {
        if (noticeTimerRef.current) clearInterval(noticeTimerRef.current);
    };
  }, [announcements.length]);

  // Reset index when数据长度变化
  useEffect(() => {
    if (!announcements.length) {
      setNoticeIndex(0);
      return;
    }
    setNoticeIndex((prev) => prev % announcements.length);
  }, [announcements.length]);

  useEffect(() => {
    if (!banners.length) {
      if (bannerTimerRef.current) {
        clearInterval(bannerTimerRef.current);
        bannerTimerRef.current = null;
      }
      setCurrentBanner(0);
      return;
    }
    startBannerTimer();
    return () => {
        if (bannerTimerRef.current) clearInterval(bannerTimerRef.current);
    };
  }, [banners.length]);

  // 加载轮播图数据
  useEffect(() => {
    const loadBanners = async () => {
      try {
        const res = await fetchBanners({ page: 1, limit: 10 });
        if (res.code === 1 && res.data?.list?.length) {
          const mapped: Banner[] = res.data.list.map((item) => ({
            id: String(item.id),
            image: normalizeAssetUrl(item.image),
            tag: item.description || '',
            title: item.title || '',
          }));
          setBanners(mapped);
          setCurrentBanner(0);
        } else {
          setBanners([]);
          setCurrentBanner(0);
        }
      } catch (error) {
        console.error('加载轮播图失败:', error);
        setBanners([]);
        setCurrentBanner(0);
      }
    };

    loadBanners();
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.targetTouches[0].clientX;
    if (bannerTimerRef.current) clearInterval(bannerTimerRef.current); // Pause on touch
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!banners.length) {
      startBannerTimer();
      return;
    }
    if (!touchStartRef.current || !touchEndRef.current) {
        startBannerTimer();
        return;
    }
    
    const distance = touchStartRef.current - touchEndRef.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    } else if (isRightSwipe) {
      setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
    }
    
    // Reset
    touchStartRef.current = 0;
    touchEndRef.current = 0;
    startBannerTimer();
  };

  const quickActions = [
    { 
        label: '中心介绍', 
        icon: Building2, 
        color: 'text-blue-600', 
        action: () => onNavigate('home:about-us') 
    },
    { 
        label: '平台动态', 
        icon: Newspaper, 
        color: 'text-indigo-600', 
        action: () => onSwitchTab('news') 
    },
    { 
        label: '作家风采', 
        icon: Palette, 
        color: 'text-purple-600', 
        action: () => onNavigate('artist-showcase') 
    },
    { 
        label: '佳作展示', 
        icon: Trophy, 
        color: 'text-orange-600', 
        action: () => onNavigate('masterpiece-showcase') 
    },
  ];

  return (
    <div className="pb-24">
      {/* Header */}
      <header className="bg-white px-4 py-3 flex items-center justify-center sticky top-0 z-10 shadow-sm">
        <h1 className="text-lg font-bold text-gray-800">数权中心</h1>
      </header>

      {/* Banner Carousel */}
      <div className="p-4 bg-white pb-0">
        <div 
            className="w-full h-40 rounded-xl overflow-hidden relative shadow-md touch-pan-y"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <div 
                className="flex h-full transition-transform duration-500 ease-out" 
                style={{ transform: `translateX(-${currentBanner * 100}%)` }}
            >
                {banners.map((banner) => (
                    <div key={banner.id} className="w-full flex-shrink-0 relative h-full">
                        <img 
                            src={banner.image} 
                            alt={banner.title || "Banner"} 
                            className="w-full h-full object-cover"
                            draggable={false}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 to-transparent flex items-center p-4">
                            <div className="text-white">
                                {banner.tag && (
                                    <div className="bg-blue-600 text-xs inline-block px-2 py-0.5 rounded mb-2 backdrop-blur-sm bg-opacity-90">
                                        {banner.tag}
                                    </div>
                                )}
                                {banner.title && (
                                    <h2 className="font-bold text-xl shadow-black drop-shadow-md">{banner.title}</h2>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {banners.map((_, idx) => (
                    <div 
                        key={idx} 
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                            currentBanner === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/60'
                        }`} 
                    />
                ))}
            </div>
        </div>
        
        {/* Scrolling Notice */}
        <div 
            className={`flex items-center mt-3 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg transition-colors ${announcements.length ? 'cursor-pointer active:bg-gray-100' : 'opacity-60'}`}
            onClick={() => {
              if (announcements.length) {
                onNavigate(`news-detail:${announcements[noticeIndex]?.id}`);
              }
            }}
        >
            <span className="bg-blue-600 text-white px-1 rounded text-[10px] mr-2 flex-shrink-0 font-medium">平台资讯</span>
            <div className="flex-1 h-5 overflow-hidden relative">
                 <div 
                    className="absolute w-full transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateY(-${noticeIndex * 1.25}rem)` }} 
                 >
                    {(announcements.length ? announcements : [{ id: 'placeholder', title: '暂无公告' } as NewsItem]).map((item) => (
                        <div key={item.id} className="h-5 flex items-center w-full">
                            <span className="truncate text-gray-700">{item.title}</span>
                        </div>
                    ))}
                 </div>
            </div>
            <ChevronRight size={14} className="text-gray-400 flex-shrink-0 ml-1" />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white pb-4 pt-4">
        <div className="grid grid-cols-4 gap-4 px-4">
          {quickActions.map((item, index) => (
            <div 
                key={index} 
                className="flex flex-col items-center cursor-pointer active:opacity-70 transition-opacity"
                onClick={item.action}
            >
              <div className={`w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-2 ${item.color}`}>
                <item.icon size={24} />
              </div>
              <span className="text-xs text-gray-700">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Trading Zone Entrance */}
      <div className="px-4 py-2 bg-white mb-2">
        <div 
            className="w-full h-24 rounded-xl overflow-hidden relative shadow-md cursor-pointer transform transition active:scale-95 duration-200 group"
            onClick={() => onNavigate('trading-zone')}
        >
             {/* Dark tech background */}
            <img 
                src="https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&w=800&q=80" 
                alt="Trading Zone Background" 
                className="w-full h-full object-cover brightness-50 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-blue-900/40">
                <h2 className="text-2xl font-bold text-white tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">交易专区</h2>
                <div className="w-8 h-1 bg-blue-400 mt-2 rounded-full shadow-sm"></div>
            </div>
        </div>
      </div>

      {/* Artist Showcase */}
      <div className="mt-2 bg-white p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-gray-800 text-lg border-l-4 border-blue-600 pl-2">艺术家风采</h2>
          <button 
            onClick={() => onNavigate('artist-showcase')}
            className="text-gray-400 flex items-center text-xs"
          >
            更多 <ChevronRight size={16} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
            {ARTISTS.slice(0, 4).map((artist) => (
                <div 
                  key={artist.id} 
                  className="flex flex-col items-center active:scale-95 transition-transform cursor-pointer"
                  onClick={() => onNavigate(`artist-detail:${artist.id}`)}
                >
                    <div className="w-full aspect-square rounded-lg overflow-hidden mb-2 bg-gray-100">
                        <img src={artist.image} alt={artist.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-sm text-gray-700 font-medium">{artist.name}</span>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Home;