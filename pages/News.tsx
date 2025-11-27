import React, { useState, useMemo } from 'react';
import { ArrowRight, Trash2, FileText } from 'lucide-react';
import { NewsItem } from '../types';

interface NewsProps {
  newsList: NewsItem[];
  onNavigate: (id: string) => void;
  onMarkAllRead: () => void;
}

const News: React.FC<NewsProps> = ({ newsList, onNavigate, onMarkAllRead }) => {
  const [activeTab, setActiveTab] = useState<'announcement' | 'dynamics'>('announcement');

  const filteredNews = useMemo(() => {
    return newsList.filter(item => {
      if (activeTab === 'announcement') return item.type === 'announcement';
      return item.type === 'dynamic';
    });
  }, [activeTab, newsList]);

  return (
    <div className="pb-24 min-h-screen bg-gray-50">
      <header className="bg-white sticky top-0 z-10">
        <div className="flex items-center justify-center p-3 border-b border-gray-100 relative">
            <h1 className="font-bold text-lg">资讯</h1>
            <button 
                onClick={onMarkAllRead}
                className="absolute right-4 text-gray-500 active:text-gray-800 p-1 rounded-full hover:bg-gray-50 transition-colors"
                title="清除未读"
            >
                <Trash2 size={20} />
            </button>
        </div>
        <div className="flex">
            <button 
                onClick={() => setActiveTab('announcement')}
                className={`flex-1 py-3 text-sm font-medium relative transition-colors ${activeTab === 'announcement' ? 'text-blue-600' : 'text-gray-500'}`}
            >
                平台公告
                {activeTab === 'announcement' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-blue-600 rounded-full"></div>}
            </button>
            <button 
                onClick={() => setActiveTab('dynamics')}
                className={`flex-1 py-3 text-sm font-medium relative transition-colors ${activeTab === 'dynamics' ? 'text-blue-600' : 'text-gray-500'}`}
            >
                平台动态
                {activeTab === 'dynamics' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-blue-600 rounded-full"></div>}
            </button>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {filteredNews.length > 0 ? (
            filteredNews.map((item) => (
                <div 
                    key={item.id} 
                    className="bg-white rounded-xl p-4 shadow-sm relative cursor-pointer active:bg-gray-50 transition-colors"
                    onClick={() => onNavigate(item.id)}
                >
                    {item.isUnread && <div className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full ring-4 ring-white"></div>}
                    <div className="text-xs text-gray-400 mb-3">{item.date}</div>
                    <h3 className="text-sm text-gray-800 font-medium leading-relaxed mb-4 pr-4">
                        {item.title}
                    </h3>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                        <span className="text-xs text-gray-500">查看详情</span>
                        <ArrowRight size={14} className="text-gray-400" />
                    </div>
                </div>
            ))
        ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <FileText size={48} className="mb-2 opacity-20" />
                <p className="text-xs">暂无{activeTab === 'announcement' ? '公告' : '动态'}</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default News;