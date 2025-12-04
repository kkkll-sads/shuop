import React, { useState, useEffect } from 'react';
import { ChevronLeft, Share2, MoreHorizontal, ChevronRight } from 'lucide-react';
import { Product } from '../types';
import ProductSpecSheet from '../components/ProductSpecSheet';
import {
  fetchCollectionItemDetail,
  fetchCollectionItemOriginalDetail,
  fetchShopProductDetail,
  CollectionItemDetailData,
  ShopProductDetailData,
  normalizeAssetUrl,
} from '../services/api';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, onBack }) => {
  const [isSpecOpen, setIsSpecOpen] = useState(false);
  const [detailData, setDetailData] = useState<CollectionItemDetailData | ShopProductDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // 判断商品类型：默认为藏品商品（兼容旧数据）
  const isShopProduct = product.productType === 'shop';

  // 获取商品详情
  useEffect(() => {
    const loadDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        setCurrentImageIndex(0); // 重置图片索引
        
        let response;
        if (isShopProduct) {
          // 积分商城商品
          response = await fetchShopProductDetail(product.id);
        } else {
          // 藏品商城商品
          try {
            response = await fetchCollectionItemDetail(product.id);
            if (response.code !== 1 || !response.data) {
              console.warn('交易商品详情返回异常，尝试获取原始详情:', response);
              response = await fetchCollectionItemOriginalDetail(product.id);
            }
          } catch (detailError) {
            console.warn('交易商品详情接口异常，尝试原始详情:', detailError);
            response = await fetchCollectionItemOriginalDetail(product.id);
          }
        }
        
        if (response.code === 1 && response.data) {
          setDetailData(response.data);
        } else {
          setError(response.msg || '获取商品详情失败');
        }
      } catch (err: any) {
        console.error('加载商品详情失败:', err);
        // 优先使用接口返回的错误消息
        setError(err?.msg || err?.response?.msg || err?.message || '加载商品详情失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    loadDetail();
  }, [product.id, isShopProduct]);

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
            {loading ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <span className="text-gray-400 text-sm">加载中...</span>
              </div>
            ) : error ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            ) : (
              <>
                <img 
                    src={
                      (detailData as any)?.images && (detailData as any).images.length > 0
                        ? (detailData as any).images[currentImageIndex]
                        : (detailData as any)?.image || (detailData as any)?.thumbnail || product.image
                    } 
                    alt={product.title} 
                    className="w-full h-full object-contain"
                />
                {((detailData as any)?.images && (detailData as any).images.length > 1) && (
                  <>
                    {/* 图片切换箭头 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex((prev) => 
                          prev > 0 ? prev - 1 : (detailData as any).images!.length - 1
                        );
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 backdrop-blur-md text-white p-2 rounded-full hover:bg-black/50 transition-colors z-10"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex((prev) => 
                          prev < (detailData as any).images!.length - 1 ? prev + 1 : 0
                        );
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 backdrop-blur-md text-white p-2 rounded-full hover:bg-black/50 transition-colors z-10"
                    >
                      <ChevronRight size={20} />
                    </button>
                    {/* 图片计数器 */}
                    <div className="absolute bottom-4 right-4 bg-black/30 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full">
                      {currentImageIndex + 1}/{(detailData as any).images.length}
                    </div>
                  </>
                )}
              </>
            )}
        </div>

        {/* Product Info */}
        <div className="bg-white p-4 mb-2">
            <div className="flex items-baseline gap-2 mb-2">
                <span className="text-red-500 font-bold text-2xl">
                    {isShopProduct 
                      ? ((detailData as any)?.score_price ?? product.price)
                      : ((detailData as any)?.price ?? product.price)}
                </span>
                <span className="text-red-500 text-xs">
                  {isShopProduct ? '积分' : '元'}
                </span>
                {!isShopProduct && (detailData as any)?.status_text && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    {(detailData as any).status_text}
                  </span>
                )}
            </div>
            
            <h2 className="text-lg font-bold text-gray-800 mb-1">
                {(detailData as any)?.title || (detailData as any)?.name || product.title}{' '}
                <span className="text-gray-500 font-normal text-sm ml-1">
                    ({(detailData as any)?.artist || product.artist})
                </span>
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
            
            {/* Detail Content */}
            {loading ? (
              <div className="py-8 text-center text-gray-400 text-sm">
                加载详情中...
              </div>
            ) : error ? (
              <div className="py-8 text-center text-red-400 text-sm">
                {error}
              </div>
            ) : detailData ? (
              <div className="space-y-4">
                {/* 详情图片列表 */}
                {(detailData as any).images && (detailData as any).images.length > 0 ? (
                  (detailData as any).images.map((img: string, index: number) => (
                    <img 
                      key={index}
                      src={normalizeAssetUrl(img)} 
                      alt={`${(detailData as any).title || (detailData as any).name} - ${index + 1}`} 
                      className="w-full rounded-lg"
                    />
                  ))
                ) : (detailData as any).image ? (
                  <img 
                    src={normalizeAssetUrl((detailData as any).image)} 
                    alt={(detailData as any).title || (detailData as any).name} 
                    className="w-full rounded-lg"
                  />
                ) : (detailData as any).thumbnail ? (
                  <img 
                    src={normalizeAssetUrl((detailData as any).thumbnail)} 
                    alt={(detailData as any).name || product.title} 
                    className="w-full rounded-lg"
                  />
                ) : null}
                
                {/* 商品描述 */}
                {(detailData as any).description && (
                  <p className="text-sm text-gray-600 leading-relaxed px-2 whitespace-pre-wrap">
                    {(detailData as any).description}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <img src={product.image} alt="Detail 1" className="w-full rounded-lg" />
                <p className="text-sm text-gray-600 leading-relaxed px-2">
                  这是一幅由12著名艺术家{product.artist}创作的精品画作。
                  作品笔触细腻，意境深远，具有极高的收藏价值与艺术欣赏价值。
                  画面构图严谨，色彩层次丰富，展现了独特的艺术风格。
                </p>
              </div>
            )}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-3 pb-safe z-40 flex items-center justify-end max-w-md mx-auto">
          <button 
            onClick={() => setIsSpecOpen(true)}
            className="bg-blue-600 text-white text-sm font-bold px-8 py-2.5 rounded-md shadow-md shadow-blue-200 active:scale-95 transition-transform w-full sm:w-auto"
          >
            立即购买
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