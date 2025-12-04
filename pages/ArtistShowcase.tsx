
import React, { useEffect, useState } from 'react';
import SubPageLayout from '../components/SubPageLayout';
import { Artist } from '../types';
import { ArtistApiItem, fetchArtists, normalizeAssetUrl } from '../services/api';

interface ArtistShowcaseProps {
  onBack: () => void;
  onArtistSelect?: (artistId: string) => void;
}

const ArtistShowcase: React.FC<ArtistShowcaseProps> = ({ onBack, onArtistSelect }) => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetchArtists({ page: 1, limit: 50 });
        if (!isMounted) return;
        const list: ArtistApiItem[] = res.data?.list ?? [];
        const mapped: Artist[] = list.map((a) => ({
          id: String(a.id),
          name: a.name,
          image: normalizeAssetUrl(a.image),
          title: a.title,
          bio: a.bio,
        }));
        setArtists(mapped);
      } catch (e) {
        console.error('加载艺术家列表失败:', e);
        setArtists([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <SubPageLayout title="艺术家风采" onBack={onBack}>
      <div className="p-4">
        {loading && !artists.length ? (
          <div className="text-center text-xs text-gray-400 py-8">加载中...</div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
          {artists.map((artist) => (
            <div 
                key={artist.id} 
                className="flex flex-col bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 active:scale-95 transition-all duration-200 cursor-pointer group"
                onClick={() => onArtistSelect && onArtistSelect(artist.id)}
            >
              <div className="w-full aspect-[4/5] bg-gray-100 relative overflow-hidden">
                <img 
                  src={artist.image} 
                  alt={artist.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  loading="lazy"
                />
                {/* Gradient overlay for better text contrast if we wanted text over image, but here we stick to clean separation */}
              </div>
              
              <div className="p-3 flex flex-col items-center text-center flex-1 justify-center">
                {artist.title ? (
                  <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-medium rounded-full mb-1.5 max-w-full truncate">
                    {artist.title}
                  </span>
                ) : (
                   /* Spacer to keep alignment if no title */
                   <div className="h-5 mb-1.5"></div>
                )}
                <span className="text-base font-bold text-gray-900 truncate w-full">
                  {artist.name}
                </span>
              </div>
            </div>
          ))}
          {!artists.length && (
            <div className="col-span-2 text-center text-xs text-gray-400 py-8">
              暂无艺术家数据
            </div>
          )}
          </div>
        )}
      </div>
    </SubPageLayout>
  );
};

export default ArtistShowcase;
