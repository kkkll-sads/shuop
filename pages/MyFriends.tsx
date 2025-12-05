import React, { useState, useEffect } from 'react';
import { UserPlus, ChevronRight } from 'lucide-react';
import SubPageLayout from '../components/SubPageLayout';
import { fetchTeamMembers, normalizeAssetUrl } from '../services/api';
import { TeamMember } from '../types';

interface MyFriendsProps {
  onBack: () => void;
  onNavigate?: (page: string) => void;
}

const MyFriends: React.FC<MyFriendsProps> = ({ onBack, onNavigate }) => {
  const [friends, setFriends] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const loadTeamMembers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchTeamMembers({ page: 1, page_size: 10 });
        if (response.code === 0 && response.data) {
          setFriends(response.data.list || []);
          setTotal(response.data.total || 0);
        } else {
          setError(response.msg || '获取好友列表失败');
        }
      } catch (err: any) {
        console.error('加载好友列表失败:', err);
        setError(err.message || '获取好友列表失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    loadTeamMembers();
  }, []);

  // 格式化日期
  const formatDate = (timestamp?: number, dateStr?: string) => {
    if (dateStr) return dateStr;
    if (timestamp) {
      const date = new Date(timestamp * 1000); // 假设是秒级时间戳
      return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
    }
    return '';
  };

  return (
    <SubPageLayout title="我的好友" onBack={onBack}>
      <div className="p-4">
        <div
          onClick={() => onNavigate?.('invite-friends')}
          className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm border border-gray-100 mb-4 active:bg-gray-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
              <UserPlus size={20} />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-800">邀请好友</div>
              <div className="text-xs text-gray-500">邀请好友加入，共享艺术价值</div>
            </div>
          </div>
          <ChevronRight size={16} className="text-gray-400" />
        </div>

        <h3 className="text-sm font-bold text-gray-800 mb-3 pl-1">好友列表 ({total})</h3>

        {loading ? (
          <div className="text-center py-8 text-gray-500">加载中...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : friends.length === 0 ? (
          <div className="text-center py-8 text-gray-400">暂无好友</div>
        ) : (
          <div className="space-y-3">
            {friends.map(friend => (
              <div key={friend.id} className="bg-white p-3 rounded-xl shadow-sm flex items-center gap-3">
                <img
                  src={normalizeAssetUrl(friend.avatar) || 'http://18.166.211.131/static/images/avatar.png'}
                  alt={friend.nickname || friend.username}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'http://18.166.211.131/static/images/avatar.png';
                  }}
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-800">{friend.nickname || friend.username}</div>
                  <div className="text-xs text-gray-400">
                    加入时间: {formatDate(friend.join_time, friend.join_date)}
                  </div>
                </div>
                <button className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full">
                  查看
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </SubPageLayout>
  );
};

export default MyFriends;
