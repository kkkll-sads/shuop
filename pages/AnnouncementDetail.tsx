import React from 'react';
import { Clock } from 'lucide-react';
import { NewsItem } from '../types';
import SubPageLayout from '../components/SubPageLayout';

interface AnnouncementDetailProps {
  newsItem: NewsItem;
  onBack: () => void;
}

const AnnouncementDetail: React.FC<AnnouncementDetailProps> = ({ newsItem, onBack }) => {
  // Helper to render content with newlines as paragraphs
  const renderContent = (content?: string) => {
    if (!content) return <p className="text-gray-400 text-center py-8">暂无内容</p>;
    
    return content.split('\n\n').map((paragraph, index) => (
      <p key={index} className="mb-4 leading-7 text-justify">
        {paragraph}
      </p>
    ));
  };

  return (
    <SubPageLayout title={newsItem.type === 'announcement' ? "公告详情" : "资讯详情"} onBack={onBack}>
      <div className="p-4 m-4 bg-white rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-3 leading-snug">{newsItem.title}</h2>
        
        <div className="flex items-center text-gray-400 text-xs mb-6 pb-4 border-b border-gray-50">
            <Clock size={12} className="mr-1.5" />
            <span>发布时间：{newsItem.date}</span>
        </div>
        
        <div className="text-gray-700 text-sm">
            {renderContent(newsItem.content)}
            
        
        </div>
      </div>
    </SubPageLayout>
  );
};

export default AnnouncementDetail;