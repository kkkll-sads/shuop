import React, { useEffect, useState } from 'react';
import SubPageLayout from '../components/SubPageLayout';
import { fetchUserAgreementPage, PageContent } from '../services/api';

interface UserAgreementProps {
  onBack: () => void;
}

const UserAgreement: React.FC<UserAgreementProps> = ({ onBack }) => {
  const [page, setPage] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchPage = async () => {
      setLoading(true);
      setError(null);
      try {
        const json = await fetchUserAgreementPage();

        if (!cancelled) {
          if (json.code === 1 && json.data) {
            setPage(json.data);
          } else {
            setError(json.msg || '加载失败，请稍后重试');
          }
        }
      } catch (e: any) {
        if (!cancelled) {
          console.error('加载用户协议失败:', e);
          setError('网络异常，请检查网络后重试');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchPage();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SubPageLayout title={page?.title || '用户协议'} onBack={onBack}>
      <div className="p-4 m-4 bg-white rounded-xl shadow-sm border border-gray-100">
        {loading && (
          <div className="py-10 text-center text-gray-400 text-sm">正在加载...</div>
        )}

        {!loading && error && (
          <div className="py-10 text-center text-red-500 text-sm">{error}</div>
        )}

        {!loading && !error && page?.content && (
          <div
            className="prose prose-sm max-w-none text-gray-800"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        )}

        <div className="mt-8 pt-4 border-t border-gray-100 text-center text-xs text-gray-400">
          <p>Copyright © 2025 数权中心. All rights reserved.</p>
          <p className="mt-1">版本 v1.0.2</p>
        </div>
      </div>
    </SubPageLayout>
  );
};

export default UserAgreement;


