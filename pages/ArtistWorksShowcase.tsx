import React, { useEffect, useState } from 'react';
import SubPageLayout from '../components/SubPageLayout';
import {
  ArtistAllWorkItem,
  ArtistAllWorksListData,
  fetchArtistAllWorks,
  normalizeAssetUrl,
} from '../services/api';

interface ArtistWorksShowcaseProps {
  onBack: () => void;
  onNavigateToArtist: (artistId: number | string) => void;
}

// 简单随机打乱数组
function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const ArtistWorksShowcase: React.FC<ArtistWorksShowcaseProps> = ({
  onBack,
  onNavigateToArtist,
}) => {
  const [works, setWorks] = useState<ArtistAllWorkItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const loadPage = async (targetPage: number) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchArtistAllWorks({ page: targetPage, limit: 50 });
      const data: ArtistAllWorksListData | undefined = res.data;
      const list: ArtistAllWorkItem[] = data?.list ?? [];
      setTotal(data?.total ?? 0);
      // 随机挑选若干条展示
      const randomized = shuffleArray(list).slice(0, limit).map((item) => ({
        ...item,
        image: normalizeAssetUrl(item.image),
      }));
      setWorks(randomized);
      setPage(targetPage);
    } catch (e: any) {
      console.error('加载艺术佳作列表失败:', e);
      setError(e?.message || '加载佳作列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      if (!isMounted) return;
      await loadPage(1);
    };
    init();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChangeBatch = async () => {
    // 根据 total 计算最大页数，超过则从第 1 页重新开始
    const maxPage =
      total && limit ? Math.max(1, Math.ceil(total / limit)) : page + 1;
    let nextPage = page + 1;
    if (nextPage > maxPage) {
      nextPage = 1;
    }
    await loadPage(nextPage);
  };

  return (
    <SubPageLayout title="佳作鉴赏" onBack={onBack}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-500">
            精选艺术家佳作 · 随机展示
          </span>
          <button
            type="button"
            onClick={handleChangeBatch}
            className="text-xs text-blue-600 px-2 py-1 rounded-full border border-blue-100 bg-blue-50 active:bg-blue-100"
          >
            换一批
          </button>
        </div>
        {loading && !works.length && (
          <div className="text-center text-xs text-gray-400 py-8">加载中...</div>
        )}
        {error && !works.length && (
          <div className="text-center text-xs text-red-400 py-8">{error}</div>
        )}
        {!loading && !error && !works.length && (
          <div className="text-center text-xs text-gray-400 py-8">暂无作品数据</div>
        )}
        {works.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {works.map((work) => (
              <div
                key={work.id}
                className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 active:scale-[0.99] transition-transform cursor-pointer flex flex-col"
                onClick={() => onNavigateToArtist(work.artist_id)}
              >
                <div className="aspect-[4/5] bg-gray-100 relative">
                  <img
                    src={work.image}
                    alt={work.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-3 flex-1 flex flex-col">
                  <div className="text-xs text-blue-600 font-medium truncate mb-1">
                    {work.artist_title
                      ? `${work.artist_name}｜${work.artist_title}`
                      : work.artist_name}
                  </div>
                  <div className="text-sm text-gray-900 font-semibold truncate mb-1">
                    {work.title}
                  </div>
                  {work.description && (
                    <div className="text-[11px] text-gray-500 leading-snug line-clamp-2">
                      {work.description}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SubPageLayout>
  );
};

export default ArtistWorksShowcase;


