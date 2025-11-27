
import React from 'react';
import { Users, UserPlus, ChevronRight } from 'lucide-react';
import SubPageLayout from '../components/SubPageLayout';

interface MyFriendsProps {
  onBack: () => void;
}

const MyFriends: React.FC<MyFriendsProps> = ({ onBack }) => {
  const friends = [
    { id: 1, name: '张三', date: '2023-11-01', avatar: 'https://picsum.photos/seed/u1/100' },
    { id: 2, name: '李四', date: '2023-10-24', avatar: 'https://picsum.photos/seed/u2/100' },
    { id: 3, name: '王五', date: '2023-10-15', avatar: 'https://picsum.photos/seed/u3/100' },
  ];

  return (
    <SubPageLayout title="我的好友" onBack={onBack}>
      <div className="p-4">
        <div className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm border border-gray-100 mb-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <UserPlus size={20} />
                </div>
                <div>
                    <div className="text-sm font-bold text-gray-800">邀请好友</div>
                    <div className="text-xs text-gray-500">邀请好友加入，共享艺术价值</div>
                </div>
            </div>
            <ChevronRight size={16} className="text-gray-400" />
        </div>

        <h3 className="text-sm font-bold text-gray-800 mb-3 pl-1">好友列表 ({friends.length})</h3>
        
        <div className="space-y-3">
            {friends.map(friend => (
                <div key={friend.id} className="bg-white p-3 rounded-xl shadow-sm flex items-center gap-3">
                    <img src={friend.avatar} alt={friend.name} className="w-10 h-10 rounded-full object-cover" />
                    <div className="flex-1">
                        <div className="text-sm font-medium text-gray-800">{friend.name}</div>
                        <div className="text-xs text-gray-400">加入时间: {friend.date}</div>
                    </div>
                    <button className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full">
                        查看
                    </button>
                </div>
            ))}
        </div>
      </div>
    </SubPageLayout>
  );
};

export default MyFriends;
