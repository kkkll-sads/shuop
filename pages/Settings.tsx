import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { USER_INFO_KEY, normalizeAssetUrl } from '../services/api';
import { UserInfo } from '../types';

interface SettingsProps {
  onBack: () => void;
  onLogout: () => void;
  onNavigate: (page: string) => void;
}

const maskMobile = (mobile?: string) => {
  if (!mobile) return '';
  if (mobile.length < 7) return mobile;
  return `${mobile.slice(0, 3)}****${mobile.slice(-4)}`;
};

const Settings: React.FC<SettingsProps> = ({ onBack, onLogout, onNavigate }) => {
  const userInfo: UserInfo | null = useMemo(() => {
    try {
      const cached = localStorage.getItem(USER_INFO_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      console.warn('解析本地用户信息失败:', e);
      return null;
    }
  }, []);

  const displayName = userInfo?.nickname || userInfo?.username || '用户';
  const displayAvatarText = displayName.slice(0, 1).toUpperCase();
  const displayAvatarUrl = normalizeAssetUrl(userInfo?.avatar);
  const displayMobile = maskMobile(userInfo?.mobile);

  const handleNotImplemented = () => {
    alert('该功能暂未开通，敬请期待');
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-safe">
      {/* Header */}
      <header className="bg-white px-4 py-3 flex items-center justify-center sticky top-0 z-10 shadow-sm">
        <button
          className="absolute left-0 ml-1 p-1 active:opacity-70"
          onClick={onBack}
        >
          <ChevronLeft size={22} className="text-gray-800" />
        </button>
        <h1 className="text-base font-bold text-gray-900">设置</h1>
      </header>

      {/* User summary */}
      <div className="bg-white mt-2 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-yellow-200 flex items-center justify-center text-lg font-bold text-yellow-700 overflow-hidden">
            {displayAvatarUrl ? (
              <img
                src={displayAvatarUrl}
                alt="用户头像"
                className="w-full h-full object-cover"
              />
            ) : (
              displayAvatarText
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">{displayName}</span>
            {displayMobile && (
              <span className="text-xs text-gray-400 mt-0.5">
                手机号：{displayMobile}
              </span>
            )}
          </div>
        </div>
        <button
          className="flex items-center text-xs text-gray-500 active:opacity-70"
          onClick={() => onNavigate('service-center:edit-profile')}
        >
          编辑
          <ChevronRight size={16} className="ml-0.5" />
        </button>
      </div>

      {/* Settings list */}
      <div className="mt-3 bg-white">
        {[
          {
            label: '重置登录密码',
            action: () => onNavigate('service-center:reset-login-password'),
            showArrow: true,
          },
          {
            label: '重置支付密码',
            action: () => onNavigate('service-center:reset-pay-password'),
            showArrow: true,
          },
          {
            label: '新消息通知',
            action: () => onNavigate('service-center:notification-settings'),
            showArrow: true,
          },
          {
            label: '账户注销',
            action: () => onNavigate('service-center:account-deletion'),
            showArrow: true,
          },
        ].map((item, index) => (
          <button
            key={item.label}
            className={`w-full px-4 py-3 flex items-center justify-between text-sm text-gray-800 active:bg-gray-50 ${index !== 3 ? 'border-b border-gray-100' : ''
              }`}
            onClick={item.action}
          >
            <span>{item.label}</span>
            {item.showArrow && (
              <ChevronRight size={16} className="text-gray-400" />
            )}
          </button>
        ))}
      </div>

      {/* Version & policies */}
      <div className="mt-3 bg-white">
        <div className="px-4 py-3 flex items-center justify-between text-sm text-gray-800 border-b border-gray-100">
          <span>当前版本号</span>
          <span className="text-gray-400 text-xs">2.2.1</span>
        </div>
        <button
          className="w-full px-4 py-3 flex items-center justify-between text-sm text-gray-800 border-b border-gray-100 active:bg-gray-50"
          onClick={() => onNavigate('privacy-policy')}
        >
          <span>隐私政策</span>
          <ChevronRight size={16} className="text-gray-400" />
        </button>
        <button
          className="w-full px-4 py-3 flex items-center justify-between text-sm text-gray-800 active:bg-gray-50"
          onClick={() => onNavigate('about-us')}
        >
          <span>关于我们</span>
          <ChevronRight size={16} className="text-gray-400" />
        </button>
      </div>

      {/* Logout button */}
      <div className="mt-8 px-4">
        <button
          className="w-full bg-orange-500 text-white text-sm font-semibold py-3 rounded-md active:opacity-80 shadow-sm"
          onClick={onLogout}
        >
          退出登录
        </button>
      </div>

    </div>
  );
};

export default Settings;


