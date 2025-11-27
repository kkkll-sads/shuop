import React, { useState } from 'react';
import { ChevronLeft, Share2, MoreHorizontal, ChevronRight } from 'lucide-react';
import { Product } from '../types';
import ProductSpecSheet from '../components/ProductSpecSheet';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, onBack }) => {
  const [isSpecOpen, setIsSpecOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 pb-safe relative">
      {/* Header - Transparent then white on scroll (simplified to white/fixed for now) */}
      <header className="fixed top-0 left-0 right-0 z-40 flex justify-between items-center px-4 py-3">
         {/* Background blur for visibility over image */}
         <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent pointer-events-none h-20"></div>
         
         <button 
            onClick={onBack}
            className="w-8 h-8 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm z-10"
         >
            <ChevronLeft size={20} className="text-gray-800" />
         </button>
         
         <h1 className="text-lg font-bold text-gray-800 opacity-0">商品详情</h1>
         
         <div className="flex gap-3 z-10">
            {/* Mock icons */}
         </div>
      </header>

      {/* Scrollable Content */}
      <div className="pb-20">
        {/* Product Image */}
        <div className="w-full aspect-square bg-white relative">
            <img 
                src={product.image} 
                alt={product.title} 
                className="w-full h-full object-contain"
            />
            <div className="absolute bottom-4 right-4 bg-black/30 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full">
                1/1
            </div>
        </div>

        {/* Product Info */}
        <div className="bg-white p-4 mb-2">
            <div className="flex items-baseline gap-2 mb-2">
                <span className="text-red-500 font-bold text-2xl">
                    {product.price.toFixed(2)}
                </span>
                <span className="text-red-500 text-xs">积分</span>
            </div>
            
            <h2 className="text-lg font-bold text-gray-800 mb-1">
                {product.title} <span className="text-gray-500 font-normal text-sm ml-1">({product.artist})</span>
            </h2>
        </div>

        {/* Spec Selector Row */}
        <div 
            className="bg-white p-4 mb-2 flex justify-between items-center cursor-pointer active:bg-gray-50"
            onClick={() => setIsSpecOpen(true)}
        >
            <span className="text-gray-500 text-sm">选择 规格</span>
            <ChevronRight size={16} className="text-gray-400" />
        </div>

        {/* Product Details Section Header */}
        <div className="bg-white p-4 min-h-[300px]">
            <div className="flex items-center justify-center mb-6">
                <div className="h-px w-12 bg-gray-200"></div>
                <span className="mx-4 text-sm text-gray-500">产品详情</span>
                <div className="h-px w-12 bg-gray-200"></div>
            </div>
            
            {/* Mock Detail Content */}
            <div className="space-y-4">
                <img src={product.image} alt="Detail 1" className="w-full rounded-lg" />
                <p className="text-sm text-gray-600 leading-relaxed px-2">
                    这是一幅由著名艺术家{product.artist}创作的精品画作。
                    作品笔触细腻，意境深远，具有极高的收藏价值与艺术欣赏价值。
                    画面构图严谨，色彩层次丰富，展现了独特的艺术风格。
                </p>
            </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-3 pb-safe z-40 flex items-center justify-end max-w-md mx-auto">
          <button 
            onClick={() => setIsSpecOpen(true)}
            className="bg-blue-600 text-white text-sm font-bold px-8 py-2.5 rounded-md shadow-md shadow-blue-200 active:scale-95 transition-transform w-full sm:w-auto"
          >
            立即兑换
          </button>
      </div>

      {/* Spec Sheet Modal */}
      <ProductSpecSheet 
        isOpen={isSpecOpen} 
        onClose={() => setIsSpecOpen(false)} 
        product={product}
      />
    </div>
  );
};

export default ProductDetail;