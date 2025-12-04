import React, { useState, useEffect } from 'react';
import { ShieldCheck, Loader2, FileText, TrendingUp, Award, Gift } from 'lucide-react';
import SubPageLayout from '../components/SubPageLayout';
import { AUTH_TOKEN_KEY, fetchProfile } from '../services/api';
import { UserInfo } from '../types';

interface CumulativeRightsProps {
  onBack: () => void;
}

const CumulativeRights: React.FC<CumulativeRightsProps> = ({ onBack }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!token) {
        setError('请先登录');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetchProfile(token);
        if (response.code === 1 && response.data?.userInfo) {
          setUserInfo(response.data.userInfo);
        } else {
          setError(response.msg || '获取权益信息失败');
        }
      } catch (err: any) {
        setError(err?.msg || err?.message || '获取权益信息失败');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const formatAmount = (value?: string | number) => {
    if (value === undefined || value === null) return '0.00';
    const num = Number(value);
    if (Number.isNaN(num)) return String(value);
    return num.toFixed(2);
  };

  // 计算累计收益（静态收益 + 动态收益）
  const totalIncome = userInfo 
    ? (parseFloat(userInfo.static_income || '0') + parseFloat(userInfo.dynamic_income || '0'))
    : 0;

  const rightsData = [
    {
      icon: Award,
      label: '累计充值',
      value: `¥ ${formatAmount(userInfo?.money || 0)}`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: '当前可用余额',
    },
    {
      icon: TrendingUp,
      label: '累计收益',
      value: `¥ ${formatAmount(totalIncome)}`,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: '静态收益 + 动态收益',
    },
    {
      icon: Gift,
      label: '可提现余额',
      value: `¥ ${formatAmount(userInfo?.withdrawable_money || 0)}`,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: '可提现的金额',
    },
    {
      icon: ShieldCheck,
      label: '当前积分',
      value: userInfo?.score?.toString() || '0',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: '当前拥有的积分',
    },
  ];

  return (
    <SubPageLayout title="累计权益" onBack={onBack}>
      <div className="p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Loader2 size={32} className="animate-spin mb-4" />
            <span className="text-xs">加载中...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-red-400">
            <div className="w-16 h-16 mb-4 border-2 border-red-200 rounded-lg flex items-center justify-center">
              <FileText size={32} className="opacity-50" />
            </div>
            <span className="text-xs">{error}</span>
          </div>
        ) : (
          <>
            {/* 权益概览卡片 */}
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-6 text-white shadow-lg mb-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck size={24} />
                  <div className="text-sm opacity-90">累计权益</div>
                </div>
                <div className="text-2xl font-bold mb-4">权益总览</div>
                <div className="text-sm opacity-80">
                  查看您的累计权益统计信息
                </div>
              </div>
            </div>

            {/* 权益统计 */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {rightsData.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl p-4 shadow-sm"
                >
                  <div className={`w-12 h-12 rounded-full ${item.bgColor} flex items-center justify-center mb-3`}>
                    <item.icon size={24} className={item.color} />
                  </div>
                  <div className="text-xs text-gray-500 mb-1">{item.label}</div>
                  <div className={`text-lg font-bold ${item.color} mb-1`}>
                    {item.value}
                  </div>
                  {item.description && (
                    <div className="text-xs text-gray-400">{item.description}</div>
                  )}
                </div>
              ))}
            </div>

            {/* 权益说明 */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-sm font-bold text-gray-800 mb-3 border-l-4 border-blue-300 pl-2">
                权益说明
              </div>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                  <div>可用余额：您当前账户中可用的资金余额</div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
                  <div>累计收益：您的静态收益和动态收益的总和</div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 flex-shrink-0"></div>
                  <div>可提现余额：您可以申请提现的金额</div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0"></div>
                  <div>当前积分：您当前拥有的积分数量</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </SubPageLayout>
  );
};

export default CumulativeRights;

