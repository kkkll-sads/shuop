
import React, { useState, useEffect } from 'react';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Market from './pages/Market';
import News from './pages/News';
import Orders from './pages/Orders';
import OrderListPage from './pages/OrderListPage';
import Profile from './pages/Profile';
import AssetView from './pages/AssetView';
import AddressList from './pages/AddressList';
import RealNameAuth from './pages/RealNameAuth';
import MyFriends from './pages/MyFriends';
import TradingZone from './pages/TradingZone';
import AnnouncementDetail from './pages/AnnouncementDetail';
import AboutUs from './pages/AboutUs';
import ArtistShowcase from './pages/ArtistShowcase';
import ArtistDetail from './pages/ArtistDetail';
import MasterpieceShowcase from './pages/MasterpieceShowcase';
import PrivacyPolicy from './pages/PrivacyPolicy';
import UserAgreement from './pages/UserAgreement';
import ProductDetail from './pages/ProductDetail';
import Settings from './pages/Settings';
import ResetLoginPassword from './pages/ResetLoginPassword';
import ResetPayPassword from './pages/ResetPayPassword';
import EditProfile from './pages/EditProfile';
import Login from './pages/Login';
import Register from './pages/Register';
import NotificationSettings from './pages/NotificationSettings';
import AccountDeletion from './pages/AccountDeletion';
import ForgotPassword from './pages/ForgotPassword';
import CardManagement from './pages/CardManagement';
import AgentAuth from './pages/AgentAuth';
import HelpCenter from './pages/HelpCenter';
import UserSurvey from './pages/UserSurvey';
import OnlineService from './pages/OnlineService';
import { Tab, Product, NewsItem, LoginSuccessPayload } from './types';
import { ARTISTS } from './constants';
import { AUTH_TOKEN_KEY, USER_INFO_KEY, fetchAnnouncements, AnnouncementItem } from './services/api';

const STORAGE_KEY = 'cat_read_news_ids';
const AUTH_KEY = 'cat_is_logged_in';

const getReadNewsIds = (): string[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};

const saveReadNewsIds = (ids: string[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
};

const App: React.FC = () => {
  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem(AUTH_KEY) === 'true';
  });

  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [subPage, setSubPage] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Initialize news list based on storage
  const [newsList, setNewsList] = useState<NewsItem[]>([]);

  // 将公告接口返回的数据转换为前端使用的 NewsItem 结构
  const mapAnnouncementToNewsItem = (item: AnnouncementItem, readIds: string[], newsType: 'announcement' | 'dynamic'): NewsItem => {
    const id = String(item.id);
    const isRead = readIds.includes(id);

    // 简单将 HTML 内容转换为纯文本并保留段落换行
    let content = item.content || '';
    // 将常见块级标签转换为换行
    content = content
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/li>/gi, '\n')
      .replace(/<\/h[1-6]>/gi, '\n\n');
    // 去掉其余 HTML 标签
    content = content.replace(/<\/?[^>]+(>|$)/g, '');

    return {
      id,
      date: item.createtime || '',
      title: item.title || '',
      isUnread: !isRead,
      type: newsType,
      content,
    };
  };

  // 首次加载时从接口获取平台公告和平台动态列表
  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        const readIds = getReadNewsIds();
        
        // 同时请求平台公告（normal）和平台动态（important）
        const [announcementRes, dynamicRes] = await Promise.all([
          fetchAnnouncements({ page: 1, limit: 10, type: 'normal' }),
          fetchAnnouncements({ page: 1, limit: 10, type: 'important' }),
        ]);

        const announcementList = announcementRes.data?.list ?? [];
        const dynamicList = dynamicRes.data?.list ?? [];

        // 合并两种类型的数据
        const allMapped = [
          ...announcementList.map((item) => mapAnnouncementToNewsItem(item, readIds, 'announcement')),
          ...dynamicList.map((item) => mapAnnouncementToNewsItem(item, readIds, 'dynamic')),
        ];

        setNewsList(allMapped);
      } catch (error) {
        console.error('加载资讯失败:', error);
      }
    };

    loadAnnouncements();
  }, []);

  const handleLogin = (payload?: LoginSuccessPayload) => {
    setIsLoggedIn(true);
    localStorage.setItem(AUTH_KEY, 'true');
    if (payload?.token) {
      localStorage.setItem(AUTH_TOKEN_KEY, payload.token);
    }
    if (payload?.userInfo) {
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(payload.userInfo));
    }
    setSubPage(null);
    setActiveTab('home');
    setSelectedProduct(null);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_INFO_KEY);
    setSubPage(null);
    setActiveTab('home');
    setSelectedProduct(null);
  };

  // Helper to navigate to product detail
  const handleProductSelect = (product: Product) => {
      setSelectedProduct(product);
      setSubPage('product-detail');
  };

  // Helper to mark all news as read
  const handleMarkAllRead = () => {
      const allIds = newsList.map(n => n.id);
      // Merge with existing read IDs in storage to preserve history if news list changes
      const currentReadIds = getReadNewsIds();
      const newReadIds = Array.from(new Set([...currentReadIds, ...allIds]));
      
      saveReadNewsIds(newReadIds);
      setNewsList(prev => prev.map(item => ({ ...item, isUnread: false })));
  };

  // Effect to mark single item as read when opening detail
  useEffect(() => {
    if (subPage && subPage.startsWith('news-detail:')) {
        const id = subPage.split(':')[1];
        
        setNewsList(prev => {
            // Check if we need to update state
            const target = prev.find(p => p.id === id);
            if (target && target.isUnread) {
                return prev.map(item => 
                    item.id === id ? { ...item, isUnread: false } : item
                );
            }
            return prev;
        });

        // Update storage
        const readIds = getReadNewsIds();
        if (!readIds.includes(id)) {
            saveReadNewsIds([...readIds, id]);
        }
    }
  }, [subPage]);

  // Authentication Gate
  if (!isLoggedIn) {
      if (subPage === 'register') {
          return (
            <Register 
                onBack={() => setSubPage(null)} 
                onRegisterSuccess={() => setSubPage(null)}
                onNavigateUserAgreement={() => setSubPage('user-agreement')}
                onNavigatePrivacyPolicy={() => setSubPage('privacy-policy')}
            />
          );
      }
      if (subPage === 'privacy-policy') {
          return (
            <PrivacyPolicy
              onBack={() => setSubPage(null)}
            />
          );
      }
      if (subPage === 'user-agreement') {
          return (
            <UserAgreement
              onBack={() => setSubPage(null)}
            />
          );
      }
      if (subPage === 'forgot-password') {
          return (
            <ForgotPassword
              onBack={() => setSubPage(null)}
            />
          );
      }
      return (
        <Login 
            onLogin={handleLogin} 
            onNavigateRegister={() => setSubPage('register')} 
            onNavigateUserAgreement={() => setSubPage('user-agreement')}
            onNavigatePrivacyPolicy={() => setSubPage('privacy-policy')}
            onNavigateForgotPassword={() => setSubPage('forgot-password')}
        />
      );
  }

  const renderContent = () => {
    // Handle Product Detail Page
    if (subPage === 'product-detail' && selectedProduct) {
        return (
            <ProductDetail 
                product={selectedProduct} 
                onBack={() => {
                    setSubPage(null);
                    setSelectedProduct(null);
                }} 
            />
        );
    }

    // Handle Announcement Detail Page: "news-detail:ID"
    if (subPage?.startsWith('news-detail:')) {
        const newsId = subPage.split(':')[1];
        const newsItem = newsList.find(item => item.id === newsId);
        if (newsItem) {
            // 根据新闻项类型保存标签页状态，确保返回时显示正确的标签
            const targetTab = newsItem.type === 'announcement' ? 'announcement' : 'dynamics';
            try {
              localStorage.setItem('cat_news_active_tab', targetTab);
            } catch (e) {
              // 忽略存储错误
            }
            return <AnnouncementDetail newsItem={newsItem} onBack={() => setSubPage(null)} />;
        }
    }

    // Handle Artist Detail Page: "artist-detail:ID"
    if (subPage?.startsWith('artist-detail:')) {
        const artistId = subPage.split(':')[1];
        const artist = ARTISTS.find(a => a.id === artistId);
        if (artist) {
            return (
                <ArtistDetail 
                    artist={artist} 
                    onBack={() => setSubPage(null)}
                    onProductSelect={handleProductSelect}
                />
            );
        }
    }

    // Handle Order List Page: "order-list:category:tabIndex"
    if (subPage?.startsWith('order-list:')) {
      const [_, category, tabIndex] = subPage.split(':');
      return (
        <OrderListPage 
          category={category} 
          initialTab={parseInt(tabIndex, 10)} 
          onBack={() => setSubPage(null)} 
        />
      );
    }

    // Sub page Routing
    switch (subPage) {
      case 'service-center:settings':
        return (
          <Settings
            onBack={() => setSubPage(null)}
            onLogout={handleLogout}
            onNavigate={(page) => setSubPage(page)}
          />
        );
      case 'service-center:reset-login-password':
        return <ResetLoginPassword onBack={() => setSubPage('service-center:settings')} />;
      case 'service-center:reset-pay-password':
        return <ResetPayPassword onBack={() => setSubPage('service-center:settings')} />;
      case 'service-center:notification-settings':
        return <NotificationSettings onBack={() => setSubPage('service-center:settings')} />;
      case 'service-center:account-deletion':
        return <AccountDeletion onBack={() => setSubPage('service-center:settings')} />;
      case 'service-center:edit-profile':
        return (
          <EditProfile
            onBack={() => setSubPage('service-center:settings')}
            onLogout={handleLogout}
          />
        );
      case 'card-management':
        return <CardManagement onBack={() => setSubPage(null)} />;
      case 'trading-zone':
        return <TradingZone onBack={() => setSubPage(null)} />;
      case 'about-us':
        return <AboutUs onBack={() => setSubPage('service-center:settings')} />;
      case 'privacy-policy':
        return (
          <PrivacyPolicy onBack={() => setSubPage('service-center:settings')} />
        );
      case 'artist-showcase':
        return (
            <ArtistShowcase 
                onBack={() => setSubPage(null)} 
                onArtistSelect={(id) => setSubPage(`artist-detail:${id}`)}
            />
        );
      case 'masterpiece-showcase':
        return <MasterpieceShowcase onBack={() => setSubPage(null)} />;
      case 'asset-view':
        return <AssetView onBack={() => setSubPage(null)} />;
      case 'address-list':
        return <AddressList onBack={() => setSubPage(null)} />;
      case 'real-name-auth':
        return <RealNameAuth onBack={() => setSubPage(null)} />;
      case 'my-friends':
        return <MyFriends onBack={() => setSubPage(null)} />;
      case 'agent-auth':
        return <AgentAuth onBack={() => setSubPage(null)} />;
      case 'help-center':
        return <HelpCenter onBack={() => setSubPage(null)} />;
      case 'profile:user-agreement':
        return <UserAgreement onBack={() => setSubPage(null)} />;
      case 'user-survey':
        return <UserSurvey onBack={() => setSubPage(null)} />;
      case 'online-service':
        return <OnlineService onBack={() => setSubPage(null)} />;
    }

    // Tab Routing
    switch (activeTab) {
      case 'home':
        return (
          <Home 
            onNavigate={(page) => setSubPage(page)} 
            onSwitchTab={(tab) => setActiveTab(tab)}
            announcements={newsList}
          />
        );
      case 'market':
        return <Market onProductSelect={handleProductSelect} />;
      case 'news':
        return (
            <News 
                newsList={newsList}
                onNavigate={(id) => {
                  // 根据新闻项类型保存标签页状态，确保返回时显示正确的标签
                  const newsItem = newsList.find(item => item.id === id);
                  if (newsItem) {
                    const targetTab = newsItem.type === 'announcement' ? 'announcement' : 'dynamics';
                    try {
                      localStorage.setItem('cat_news_active_tab', targetTab);
                    } catch (e) {
                      // 忽略存储错误
                    }
                  }
                  setSubPage(`news-detail:${id}`);
                }} 
                onMarkAllRead={handleMarkAllRead}
            />
        );
      case 'orders':
        return <Orders onNavigate={(page) => setSubPage(page)} />;
      case 'profile':
        return <Profile onNavigate={(page) => setSubPage(page)} />;
      default:
        return (
          <Home 
            onNavigate={(page) => setSubPage(page)} 
            onSwitchTab={(tab) => setActiveTab(tab)}
          />
        );
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen font-sans antialiased text-gray-900 max-w-md mx-auto relative shadow-2xl">
      <div className="min-h-screen bg-gray-50 pb-safe">
        {renderContent()}
      </div>
      {/* Hide BottomNav when in a sub-page */}
      {!subPage && <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />}
    </div>
  );
};

export default App;
