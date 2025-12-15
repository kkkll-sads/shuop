import React, { useState, useEffect } from 'react';
import { ChevronLeft, Share2, ShoppingBag, Coins, CreditCard } from 'lucide-react';
import { LoadingSpinner, LazyImage } from '../../components/common';
import { Product } from '../../types';
import { fetchShopProductDetail, ShopProductDetailData } from '../../services/api';

interface PointsProductDetailProps {
    product: Product;
    onBack: () => void;
    onNavigate: (page: string) => void;
}

const PointsProductDetail: React.FC<PointsProductDetailProps> = ({ product, onBack, onNavigate }) => {
    const [detailData, setDetailData] = useState<ShopProductDetailData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadDetail = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetchShopProductDetail(product.id);
                if (response.code === 1 && response.data) {
                    setDetailData(response.data);
                } else {
                    setError(response.msg || '获取商品详情失败');
                }
            } catch (err) {
                setError('网络请求失败，请稍后重试');
            } finally {
                setLoading(false);
            }
        };
        loadDetail();
    }, [product.id]);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><LoadingSpinner /></div>;
    if (error) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">{error}</div>;

    const displayPrice = detailData?.score_price || detailData?.price || 0;
    const isScoreProduct = !!detailData?.score_price;

    return (
        <div className="min-h-screen bg-gray-50 pb-24 relative">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm px-4 py-3 flex justify-between items-center border-b border-gray-100">
                <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors text-gray-800">
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-lg font-bold text-gray-900">积分商品详情</h1>
                <button className="p-2 -mr-2 hover:bg-gray-100 rounded-full text-gray-800">
                    <Share2 size={20} />
                </button>
            </header>

            {/* Product Image */}
            <div className="aspect-square w-full bg-white relative">
                <LazyImage
                    src={detailData?.thumbnail || product.image || ''}
                    alt={detailData?.name || product.title}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Product Info */}
            <div className="bg-white p-4 mb-2">
                <div className="flex items-baseline gap-1 mb-2">
                    <div className="text-2xl font-bold text-orange-600 font-mono">
                        {isScoreProduct ? '' : '¥'}{displayPrice}
                    </div>
                    <span className="text-sm text-orange-500 font-medium">
                        {isScoreProduct ? '积分' : '元'}
                    </span>
                    {detailData?.price && isScoreProduct && (
                        <span className="text-xs text-gray-400 line-through ml-2">¥{detailData.price}</span>
                    )}
                </div>

                <h2 className="text-lg font-bold text-gray-900 leading-snug mb-2">
                    {detailData?.name || product.title}
                </h2>

                <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>库存: {detailData?.stock ?? '-'}</span>
                    <span>销量: {detailData?.sales ?? '-'}</span>
                </div>
            </div>

            {/* Description */}
            <div className="bg-white p-4 mb-20">
                <h3 className="font-bold text-gray-900 mb-3 border-l-4 border-orange-500 pl-2">商品详情</h3>
                <div
                    className="text-sm text-gray-600 leading-relaxed rich-text space-y-2"
                    dangerouslySetInnerHTML={{ __html: detailData?.description || '<p>暂无详情</p>' }}
                />
            </div>

            {/* Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 z-50 flex items-center gap-3 safe-area-bottom">
                <div className="flex flex-col items-center justify-center text-gray-500 px-2 min-w-[50px]">
                    <ShoppingBag size={20} />
                    <span className="text-[10px] mt-0.5">店铺</span>
                </div>

                <button
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-3 px-6 rounded-full shadow-lg shadow-orange-200 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                    onClick={() => {
                        // TODO: Implement Purchase Logic
                        // onNavigate(`order-confirm:${product.id}`); 
                        alert('如需购买，请对接后端创建订单接口');
                    }}
                >
                    {isScoreProduct ? <Coins size={18} /> : <CreditCard size={18} />}
                    {isScoreProduct ? '立即兑换' : '立即购买'}
                </button>
            </div>
        </div>
    );
};

export default PointsProductDetail;
