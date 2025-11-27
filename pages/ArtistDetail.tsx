import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Artist, Product } from '../types';
import { PRODUCTS } from '../constants';

interface ArtistDetailProps {
  artist: Artist;
  onBack: () => void;
  onProductSelect?: (product: Product) => void;
}

const ArtistDetail: React.FC<ArtistDetailProps> = ({ artist, onBack, onProductSelect }) => {
  // Find products by this artist (mock logic: simple string includes or exact match if we had normalized data)
  // Since mock data names might not match perfectly, we'll just show some random products for demo if no match,
  // or strictly filter. Let's strictly filter but rely on the mock data names being consistent.
  // For demo purposes, if we don't find any, we might show a few random ones to make the page look good.
  let artistWorks = PRODUCTS.filter(p => p.artist === artist.name);
  
  // Fallback for demo if no works found for specific artist in mock PRODUCTS
  if (artistWorks.length === 0) {
    artistWorks = PRODUCTS.slice(0, 4); 
  }

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

        {/* Works Section */}
        <div className="mb-4">
            <div className="flex items-center mb-3 px-1">
                <h3 className="font-bold text-gray-800 text-base border-l-4 border-blue-500 pl-2">代表作品</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
                {artistWorks.map((work) => (
                    <div 
                        key={work.id} 
                        className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 active:scale-[0.99] transition-transform"
                        onClick={() => onProductSelect && onProductSelect(work)}
                    >
                        <div className="aspect-square bg-gray-100 relative">
                            <img src={work.image} alt={work.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-2">
                            <div className="text-sm text-gray-800 font-medium truncate">{work.title}</div>
                            <div className="text-red-500 text-sm font-bold mt-1">
                                {work.price.toFixed(2)} <span className="text-[10px] font-normal text-gray-400">积分</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistDetail;