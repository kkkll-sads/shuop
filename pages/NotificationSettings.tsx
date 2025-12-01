import React, { useEffect, useState } from 'react';
import { ChevronLeft } from 'lucide-react';

interface NotificationSettingsProps {
  onBack: () => void;
}

type NotificationSettingKey = 'banner' | 'sound' | 'vibration';

interface NotificationSettingState {
  banner: boolean;
  sound: boolean;
  vibration: boolean;
}

const STORAGE_KEY = 'cat_notification_settings';

const defaultState: NotificationSettingState = {
  banner: true,
  sound: true,
  vibration: true,
};

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ onBack }) => {
  const [settings, setSettings] = useState<NotificationSettingState>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        return { ...defaultState, ...JSON.parse(cached) };
      }
    } catch (error) {
      console.warn('读取通知设置失败:', error);
    }
    return defaultState;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.warn('保存通知设置失败:', error);
    }
  }, [settings]);

  const toggleSetting = (key: NotificationSettingKey) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const renderSwitch = (enabled: boolean) => (
    <span
      aria-hidden="true"
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-green-500' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
          enabled ? 'translate-x-5' : 'translate-x-1'
        }`}
      />
    </span>
  );

  const rows = [
    { key: 'banner' as const, label: '横幅消息通知' },
    { key: 'sound' as const, label: '系统声音' },
    { key: 'vibration' as const, label: '系统震动' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      <header className="bg-white px-4 py-3 flex items-center justify-center sticky top-0 z-10 shadow-sm">
        <button
          className="absolute left-0 ml-1 p-1 active:opacity-70"
          onClick={onBack}
          aria-label="返回"
        >
          <ChevronLeft size={22} className="text-gray-800" />
        </button>
        <h1 className="text-base font-bold text-gray-900">新消息通知</h1>
      </header>

      <main className="mt-3 bg-white divide-y divide-gray-100">
        {rows.map(({ key, label }) => (
          <button
            key={key}
            className="w-full px-4 py-4 flex items-center justify-between text-sm text-gray-900 active:bg-gray-50"
            onClick={() => toggleSetting(key)}
            aria-pressed={settings[key]}
          >
            <span>{label}</span>
            {renderSwitch(settings[key])}
          </button>
        ))}
      </main>

      <p className="px-4 pt-4 text-xs text-gray-400 leading-relaxed">
        开启后可第一时间掌握最新交易提醒、活动资讯。您可随时在此处调整通知方式。
      </p>
    </div>
  );
};

export default NotificationSettings;


