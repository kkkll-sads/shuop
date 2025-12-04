
import React from 'react';
import SubPageLayout from '../components/SubPageLayout';
import { ARTISTS } from '../constants';

interface ArtistShowcaseProps {
  onBack: () => void;
  onArtistSelect?: (artistId: string) => void;
}

const ArtistShowcase: React.FC<ArtistShowcaseProps> = ({ onBack, onArtistSelect }) => {
  return (
    <SubPageLayout title="艺术家风采" onBack={onBack}>
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {ARTISTS.map((artist) => (
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
                  <span className="inline-block px-2 py-0.5 bg-orange-50 text-orange-600 text-[10px] font-medium rounded-full mb-1.5 max-w-full truncate">
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
        </div>
      </div>
    </SubPageLayout>
  );
};

export default ArtistShowcase;
