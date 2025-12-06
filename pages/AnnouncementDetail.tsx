/**
 * AnnouncementDetail - 公告/资讯详情页面
 * 
 * 使用 PageContainer 布局组件重构
 * 
 * @author 树交所前端团队
 * @version 2.0.0
 */

import React from 'react';
import { Clock } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import { EmptyState } from '../components/common';
import { NewsItem } from '../types';

/**
 * AnnouncementDetail 组件属性接口
 */
interface AnnouncementDetailProps {
  newsItem: NewsItem;
  onBack: () => void;
}

/**
 * AnnouncementDetail 公告/资讯详情页面组件
 */
const AnnouncementDetail: React.FC<AnnouncementDetailProps> = ({ newsItem, onBack }) => {
  /**
   * 渲染内容（将换行符转换为段落）
   */
  const renderContent = (content?: string) => {
    if (!content) return <EmptyState title="暂无内容" />;

    return content.split('\n\n').map((paragraph, index) => (
      <p key={index} className="mb-4 leading-7 text-justify">
        {paragraph}
      </p>
    ));
  };

  // 根据类型显示不同的标题
  const pageTitle = newsItem.type === 'announcement' ? '公告详情' : '资讯详情';

  return (
    <PageContainer title={pageTitle} onBack={onBack}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        {/* 标题 */}
        <h2 className="text-lg font-bold text-gray-900 mb-3 leading-snug">
          {newsItem.title}
        </h2>

        {/* 发布时间 */}
        <div className="flex items-center text-gray-400 text-xs mb-6 pb-4 border-b border-gray-50">
          <Clock size={12} className="mr-1.5" />
          <span>发布时间：{newsItem.date}</span>
        </div>

        {/* 内容 */}
        <div className="text-gray-700 text-sm">
          {renderContent(newsItem.content)}
        </div>
      </div>
    </PageContainer>
  );
};

export default AnnouncementDetail;