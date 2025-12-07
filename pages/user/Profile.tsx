
import React, { useEffect, useMemo, useState } from 'react';
import { Settings, MessageSquare, ShieldCheck, CreditCard, MapPin, Users, UserCheck, HelpCircle, FileText, HeadphonesIcon, ChevronRight, Wallet, Receipt, Box, Gem, Sprout, Award, CalendarCheck, Newspaper } from 'lucide-react';
import { formatAmount } from '../../utils/format';
import { AUTH_TOKEN_KEY, USER_INFO_KEY, fetchProfile, normalizeAssetUrl } from '../../services/api';
import { UserInfo } from '../../types';

// Helper for custom coin icon
const CoinsIcon = ({ size, className }: { size: number, className: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="8" cy="8" r="6" />
    <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
    <path d="M7 6h1v4" />
    <path d="m16.71 13.88.7.71-2.82 2.82" />
  </svg>
);

interface ProfileProps {
  onNavigate: (path: string) => void;
}

const Profile: React.FC<ProfileProps> = ({ onNavigate }) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(() => {
    try {
      const cached = localStorage.getItem(USER_INFO_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.warn('解析本地用户信息失败:', error);
      return null;
    }
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      setError('未检测到登录信息，请重新登录');
      return;
    }

    let isMounted = true;
    const loadProfile = async () => {
      setLoading(true);
      try {
        const response = await fetchProfile(token);
        if (!isMounted) return;

        if (response.code === 1 && response.data?.userInfo) {
          setUserInfo(response.data.userInfo);
          localStorage.setItem(USER_INFO_KEY, JSON.stringify(response.data.userInfo));
          setError(null);
        } else {
          setError(response.msg || '获取用户信息失败');
        }
      } catch (err: any) {
        if (!isMounted) return;
        // 优先使用接口返回的错误消息
        setError(err?.msg || err?.response?.msg || err?.message || '获取个人信息失败');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);


  const displayName = userInfo?.nickname || userInfo?.username || '用户';
  const displayAvatarText = displayName.slice(0, 1).toUpperCase();
  const displayAvatarUrl = normalizeAssetUrl(userInfo?.avatar);

  // 根据 user_type 显示用户类型
  const getUserTypeLabel = (userType?: number): string => {
    if (userType === undefined || userType === null) return '--';
    switch (userType) {
      case 0:
        return '新用户';
      case 1:
        return '普通用户';
      case 2:
        return '交易用户';
      default:
        return '--';
    }
  };
  const displayId = getUserTypeLabel(userInfo?.user_type);


  const stats = useMemo(() => ([
    { label: '可用余额', val: formatAmount(userInfo?.money) },
    { label: '提现余额', val: formatAmount(userInfo?.withdrawable_money) },
    { label: '服务费余额', val: formatAmount(userInfo?.service_fee_balance) },
  ]), [userInfo]);

  return (
    <div className="pb-24 min-h-screen bg-gray-50">
      {/* Top Background Gradient */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-[#FFD6A5] to-gray-50 z-0" />

      {/* User Header */}
      <div className="pt-12 pb-16 px-6 relative z-10">

        <div className="flex items-center justify-between text-gray-800 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-orange-100 border-2 border-white flex items-center justify-center text-2xl font-bold text-orange-600 overflow-hidden shadow-sm">
              {displayAvatarUrl ? (
                <img
                  src={displayAvatarUrl}
                  alt="用户头像"
                  className="w-full h-full object-cover"
                />
              ) : (
                displayAvatarText || '用'
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold">{displayName}</h2>
              <div className="flex items-center gap-2 mt-2">
                {/* User Status Badge */}
                <div className="flex items-center bg-white border border-orange-200 rounded-full p-0.5 pr-3 shadow-sm inline-flex">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center mr-1.5 shadow-inner">
                    {(() => {
                      const statusConfig = {
                        0: { icon: Sprout, color: 'text-green-100' },
                        1: { icon: UserCheck, color: 'text-blue-100' },
                        2: { icon: Gem, color: 'text-yellow-100' }
                      }[userInfo?.user_type ?? -1] || { icon: UserCheck, color: 'text-white' };
                      const Icon = statusConfig.icon;
                      return <Icon size={12} className={`${statusConfig.color} fill-current`} />;
                    })()}
                  </div>
                  <span className="text-xs font-bold text-orange-600">{displayId}</span>
                </div>

                {/* Agent Badge - 根据 agent_review_status 显示 */}
                {(() => {
                  const agentStatus = userInfo?.agent_review_status;
                  // 只有已通过(1)时才显示代理标签
                  if (agentStatus === 1) {
                    return (
                      <div className="flex items-center bg-white border border-red-200 rounded-full p-0.5 pr-3 shadow-sm inline-flex">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center mr-1.5 shadow-inner">
                          <Award size={12} className="text-white fill-white" />
                        </div>
                        <span className="text-xs font-bold text-red-600">代理</span>
                      </div>
                    );
                  }
                  // 待审核(0)时显示待审核标签
                  if (agentStatus === 0) {
                    return (
                      <div className="flex items-center bg-white border border-yellow-200 rounded-full p-0.5 pr-3 shadow-sm inline-flex">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center mr-1.5 shadow-inner">
                          <Award size={12} className="text-white fill-white" />
                        </div>
                        <span className="text-xs font-bold text-yellow-600">待审核</span>
                      </div>
                    );
                  }
                  // 已拒绝(2)时显示已拒绝标签
                  if (agentStatus === 2) {
                    return (
                      <div className="flex items-center bg-white border border-gray-200 rounded-full p-0.5 pr-3 shadow-sm inline-flex">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center mr-1.5 shadow-inner">
                          <Award size={12} className="text-white fill-white" />
                        </div>
                        <span className="text-xs font-bold text-gray-600">已拒绝</span>
                      </div>
                    );
                  }
                  // 未申请(-1)或其他情况不显示
                  return null;
                })()}
              </div>

            </div>
          </div>
          <div className="flex gap-3 text-gray-600">
            <button onClick={() => onNavigate('service-center:message')}><MessageSquare size={20} /></button>
            <button onClick={() => onNavigate('service-center:settings')}><Settings size={20} /></button>
          </div>
        </div>

        {/* Stats Overlay */}
        <div className="flex justify-between text-gray-800 px-2">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center cursor-pointer" onClick={() => idx === 0 && onNavigate('asset-view')}>
              <span className="text-lg font-bold mb-1">{stat.val}</span>
              <span className="text-xs text-gray-500">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {error && !userInfo && !error.includes('登录态过期') && (
        <div className="mx-4 mt-4 bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg shadow-sm">
          {error}
        </div>
      )}

      <div className="px-4 -mt-8 relative z-10">
        {/* My Assets Section - Explicit Entry */}
        <div
          className="bg-white rounded-xl p-4 shadow-sm mb-4 flex justify-between items-center cursor-pointer active:bg-gray-50 transition-colors"
          onClick={() => onNavigate('asset-view')}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
              <Wallet size={20} strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-800">我的资产</div>
              <div className="text-xs text-gray-500">查看余额、积分与资金明细</div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-400">详情</span>
            <ChevronRight size={16} className="text-gray-400" />
          </div>
        </div>

        {/* Convenient Services */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <div className="font-bold text-gray-800 text-sm mb-4 border-l-4 border-orange-300 pl-2">便捷服务</div>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: '余额充值', icon: Wallet, color: 'text-orange-500', action: () => onNavigate('asset-view') },
              { label: '每日签到', icon: CalendarCheck, color: 'text-red-500', action: () => onNavigate('sign-in') },
              { label: '余额提现', icon: Receipt, color: 'text-orange-500', action: () => onNavigate('asset-view') },
              { label: '商品寄售', icon: Receipt, color: 'text-orange-500', action: () => onNavigate('order-list:transaction:0') },
              { label: '积分兑换', icon: CoinsIcon, color: 'text-orange-500', action: () => onNavigate('switch-to-market') }, // Link to Market for points exchange
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center cursor-pointer active:opacity-60" onClick={item.action}>
                <item.icon size={24} className={`${item.color} mb-2`} strokeWidth={1.5} />
                <span className="text-xs text-gray-600">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Rights Management */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <div className="font-bold text-gray-800 text-sm mb-4 border-l-4 border-orange-300 pl-2">权益管理</div>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: '资产明细', icon: FileText, action: () => onNavigate('asset-view') },
              { label: '累计权益', icon: ShieldCheck, action: () => onNavigate('cumulative-rights') },
              { label: '寄售券', icon: Receipt, action: () => onNavigate('consignment-voucher') },
              { label: '我的藏品', icon: Box, action: () => onNavigate('my-collection') },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center cursor-pointer active:opacity-60" onClick={item.action}>
                <item.icon size={24} className="text-gray-600 mb-2" strokeWidth={1.5} />
                <span className="text-xs text-gray-600">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Service Management */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <div className="font-bold text-gray-800 text-sm mb-4 border-l-4 border-orange-300 pl-2">服务管理</div>
          <div className="grid grid-cols-4 gap-y-6 gap-x-4">
            {[
              { label: '实名认证', icon: UserCheck, action: () => onNavigate('real-name-auth') },
              { label: '卡号管理', icon: CreditCard, action: () => onNavigate('card-management') },
              { label: '收货地址', icon: MapPin, action: () => onNavigate('address-list') },
              { label: '我的好友', icon: Users, action: () => onNavigate('my-friends') },
              { label: '代理认证', icon: UserCheck, action: () => onNavigate('agent-auth') },
              { label: '帮助中心', icon: HelpCircle, action: () => onNavigate('help-center') },
              { label: '规则协议', icon: FileText, action: () => onNavigate('profile:user-agreement') },
              { label: '用户问卷', icon: FileText, action: () => onNavigate('user-survey') },
              { label: '在线客服', icon: HeadphonesIcon, action: () => onNavigate('online-service') },
              { label: '平台资讯', icon: Newspaper, action: () => onNavigate('news-center') },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center cursor-pointer active:opacity-60" onClick={item.action}>
                <item.icon size={24} className="text-gray-600 mb-2" strokeWidth={1.5} />
                <span className="text-xs text-gray-600">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
