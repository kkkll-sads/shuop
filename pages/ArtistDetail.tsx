import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Artist } from '../types';
import {
  normalizeAssetUrl,
  fetchArtistDetail,
  fetchArtists,
  ArtistDetailData,
  ArtistWorkItem,
  ArtistListData,
} from '../services/api';

interface ArtistDetailProps {
  artistId: string;
  onBack: () => void;
}

const ArtistDetail: React.FC<ArtistDetailProps> = ({ artistId, onBack }) => {
  const [artist, setArtist] = useState<Artist | null>(null);
  const [works, setWorks] = useState<ArtistWorkItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        let targetId: string | number | undefined = artistId;

        // 兜底：如果没有传入 artistId，则从列表接口中取第一个艺术家
        if (!targetId) {
          try {
            const listRes = await fetchArtists({ page: 1, limit: 1 });
            const data: ArtistListData | undefined = listRes.data;
            const first = data?.list?.[0];
            if (first) {
              targetId = first.id;
            } else {
              setError('未找到任何艺术家数据');
              return;
            }
          } catch (e) {
            console.error('兜底获取艺术家列表失败:', e);
            setError('未找到有效的艺术家ID');
            return;
          }
        }

        const res = await fetchArtistDetail(targetId);
        if (!isMounted) return;
        if (res.code !== 1 || !res.data) {
          setError(res.msg || '艺术家数据加载失败');
          return;
        }
        const data: ArtistDetailData = res.data;
        setArtist({
          id: String(data.id),
          name: data.name,
          image: normalizeAssetUrl(data.image),
          title: data.title,
          bio: data.bio,
        });
        setWorks((data.works || []).map((w) => ({
          ...w,
          image: normalizeAssetUrl(w.image),
        })));
      } catch (e: any) {
        console.error('加载艺术家详情失败:', e);
        setError(e?.message || '加载艺术家详情失败');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [artistId]);

  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      <header className="bg-white px-4 py-3 flex items-center sticky top-0 z-30 shadow-sm">
        <button 
          onClick={onBack} 
          className="absolute left-4 p-1 text-gray-600 active:bg-gray-100 rounded-full"
        >
            <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-gray-800 w-full text-center">艺术家详情</h1>
      </header>

      <div className="p-4">
        {loading && !artist && (
          <div className="text-center text-xs text-gray-400 py-8">加载中...</div>
        )}
        {error && !artist && (
          <div className="text-center text-xs text-red-400 py-8">{error}</div>
        )}
        {artist && (
        <>
        {/* Profile Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center mb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-4 border-gray-50 shadow-inner">
                <img src={artist.image} alt={artist.name} className="w-full h-full object-cover" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">{artist.name}</h2>
            {artist.title && (
                <span className="inline-block bg-blue-50 text-blue-600 text-xs px-3 py-1 rounded-full font-medium mb-4">
                    {artist.title}
                </span>
            )}
            
            <div className="w-full h-px bg-gray-100 mb-4"></div>
            
            <div className="text-left w-full">
                <h3 className="font-bold text-sm text-gray-800 mb-2 border-l-4 border-blue-500 pl-2">艺术家简介</h3>
                <p className="text-sm text-gray-600 leading-relaxed text-justify">
                    {artist.bio || "暂无简介"}
                </p>
            </div>
        </div>
        </>
        )}
        {artist && (
        <>
        {/* Works Section */}
        <div className="mb-4">
            <div className="flex items-center mb-3 px-1">
                <h3 className="font-bold text-gray-800 text-base border-l-4 border-blue-500 pl-2">代表作品</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
                {works.map((work) => (
                    <div 
                        key={work.id} 
                        className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 active:scale-[0.99] transition-transform"
                    >
                        <div className="aspect-square bg-gray-100 relative">
                            <img src={work.image} alt={work.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-2">
                            <div className="text-sm text-gray-800 font-medium truncate">{work.title}</div>
                            {work.description && (
                              <div className="text-[11px] text-gray-500 mt-1 line-clamp-2">
                                {work.description}
                              </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            {!works.length && (
              <div className="text-center text-xs text-gray-400 py-6">
                暂无代表作品数据
              </div>
            )}
        </div>
        </>
        )}
      </div>
    </div>
  );
};

export default ArtistDetail;