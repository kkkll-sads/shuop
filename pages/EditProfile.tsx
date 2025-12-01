import React, { useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AUTH_TOKEN_KEY, USER_INFO_KEY, uploadImage, updateAvatar, updateNickname } from '../services/api';
import { UserInfo } from '../types';

interface EditProfileProps {
  onBack: () => void;
  onLogout: () => void;
}

const EditProfile: React.FC<EditProfileProps> = ({ onBack, onLogout }) => {
  const cachedUser: UserInfo | null = useMemo(() => {
    try {
      const cached = localStorage.getItem(USER_INFO_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      console.warn('解析本地用户信息失败:', e);
      return null;
    }
  }, []);

  const [userInfo, setUserInfo] = useState<UserInfo | null>(cachedUser);
  const [nickname, setNickname] = useState<string>(cachedUser?.nickname || cachedUser?.username || '');
  const [avatarPreview, setAvatarPreview] = useState<string>(cachedUser?.avatar || '');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayName = nickname || userInfo?.nickname || userInfo?.username || '用户';
  const displayAvatarText = displayName.slice(0, 1).toUpperCase();

  const handleSave = async () => {
    if (!userInfo) {
      onBack();
      return;
    }

    const finalNickname = nickname.trim() || userInfo.nickname;
    setSaving(true);

    try {
      await updateNickname({
        nickname: finalNickname,
        token: userInfo.token || localStorage.getItem(AUTH_TOKEN_KEY) || '',
      });

      const updated: UserInfo = {
        ...userInfo,
        nickname: finalNickname,
      };

      setUserInfo(updated);
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(updated));
      alert('保存成功');
      onBack();
    } catch (error: any) {
      console.error('昵称更新失败:', error);
      alert(error?.message || '昵称保存失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarClick = () => {
    if (!userInfo) {
      alert('请先登录后再修改头像');
      return;
    }
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file || !userInfo) {
      event.target.value = '';
      return;
    }

    setAvatarUploading(true);

    try {
      const uploadRes = await uploadImage(file);
      const avatarPath =
        uploadRes.data?.url ||
        uploadRes.data?.path ||
        uploadRes.data?.filepath ||
        '';
      const avatarUrl =
        uploadRes.data?.fullurl ||
        uploadRes.data?.fullUrl ||
        uploadRes.data?.url ||
        '';

      if (!avatarPath && !avatarUrl) {
        throw new Error('上传返回结果为空，请重试');
      }

      const token = userInfo.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';

      await updateAvatar({
        avatar: avatarPath || avatarUrl,
        avatar_url: avatarUrl,
        token,
      });

      const updatedUser: UserInfo = {
        ...userInfo,
        avatar: avatarUrl || avatarPath,
      };

      setUserInfo(updatedUser);
      setAvatarPreview(updatedUser.avatar || '');
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(updatedUser));
      alert('头像更新成功');
    } catch (error: any) {
      console.error('修改头像失败:', error);
      alert(error?.message || '头像修改失败，请稍后重试');
    } finally {
      setAvatarUploading(false);
      event.target.value = '';
    }
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
        <h1 className="text-base font-bold text-gray-900">编辑资料</h1>
      </header>

      {/* Avatar row */}
      <div className="bg-white mt-2">
        <button
          className="w-full px-4 py-3 flex items-center justify-between active:bg-gray-50 disabled:opacity-50"
          onClick={handleAvatarClick}
          disabled={avatarUploading}
        >
          <span className="text-sm text-gray-800">头像</span>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-200 overflow-hidden flex items-center justify-center text-base font-bold text-yellow-700">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="用户头像"
                  className="w-full h-full object-cover"
                />
              ) : (
                displayAvatarText
              )}
            </div>
            
            <ChevronRight size={16} className="text-gray-400" />
          </div>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />
      </div>

      {/* Nickname row */}
      <div className="bg-white mt-2">
        <div className="px-4 py-3 flex items-center border-t border-gray-100">
          <span className="text-sm text-gray-800 w-14">昵称</span>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="请输入昵称"
            className="flex-1 text-sm text-gray-900 outline-none bg-transparent"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-8 px-4 space-y-3">
        <button
          className="w-full bg-blue-500 text-white text-sm font-semibold py-3 rounded-md active:opacity-80 shadow-sm"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? '保存中...' : '保存'}
        </button>
        <button
          className="w-full bg-white text-blue-500 border border-blue-400 text-sm font-semibold py-3 rounded-md active:bg-blue-50"
          onClick={onLogout}
        >
          退出登录
        </button>
      </div>
    </div>
  );
};

export default EditProfile;


