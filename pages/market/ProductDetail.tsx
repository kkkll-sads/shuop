
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Share2, Copy, Shield, FileText, Lock, Fingerprint, Award, Gavel } from 'lucide-react';
import { LoadingSpinner, LazyImage } from '../../components/common';
import { Product } from '../../types';
import {
  fetchCollectionItemDetail,
  fetchCollectionItemOriginalDetail,
  fetchShopProductDetail,
  CollectionItemDetailData,
  ShopProductDetailData,
} from '../../services/api';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, onBack }) => {
  const [detailData, setDetailData] = useState<CollectionItemDetailData | ShopProductDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isShopProduct = product.productType === 'shop';

  useEffect(() => {
    const loadDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        let response;
        if (isShopProduct) {
          response = await fetchShopProductDetail(product.id);
        } else {
          try {
            response = await fetchCollectionItemDetail(product.id);
            if (response.code !== 1 || !response.data) {
              response = await fetchCollectionItemOriginalDetail(product.id);
            }
          } catch (err) {
            response = await fetchCollectionItemOriginalDetail(product.id);
          }
        }

        if (response.code === 1 && response.data) {
          setDetailData(response.data);
        } else {
          setError(response.msg || '获取证书详情失败');
        }
      } catch (err: any) {
        setError('数据同步延迟，请重试');
      } finally {
        setLoading(false);
      }
    };

    loadDetail();
  }, [product.id, isShopProduct]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]"><LoadingSpinner /></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] text-gray-500">{error}</div>;

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-gray-900 font-serif pb-24 relative overflow-hidden">
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]"></div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#FDFBF7]/90 backdrop-blur-sm px-4 py-4 flex justify-between items-center border-b border-amber-900/5">
        <button onClick={onBack} className="p-2 hover:bg-black/5 rounded-full transition-colors text-gray-800">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-gray-900">数字权益证书</h1>
        <button className="p-2 hover:bg-black/5 rounded-full text-gray-800">
          <Share2 size={20} />
        </button>
      </header>

      {/* Certificate Container */}
      <div className="p-5">
        <div className="bg-white relative shadow-2xl shadow-gray-200/50 rounded-sm overflow-hidden border-[6px] border-double border-amber-900/10 p-6 md:p-8">

          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
            <Shield size={200} />
          </div>

          {/* Top Logo Area */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-50 text-amber-900 mb-3 border border-amber-100">
              <Award size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-wide mb-1">数字产权登记证书</h2>
            <div className="text-[10px] text-gray-400 uppercase tracking-[0.2em]">Digital Property Rights Certificate</div>
          </div>

          {/* Asset Image (Stamp Style) */}
          <div className="relative w-full aspect-[16/9] bg-gray-50 mb-8 border border-gray-100 p-2 shadow-inner">
            <div className="w-full h-full relative overflow-hidden grayscale-[20%] hover:grayscale-0 transition-all duration-500">
              <LazyImage src={product.image} className="w-full h-full object-cover" />
              {/* Official Stamp */}
              <div className="absolute -right-4 -bottom-4 w-24 h-24 border-[3px] border-red-800 rounded-full flex items-center justify-center opacity-80 -rotate-12 mix-blend-multiply z-10 pointer-events-none">
                <div className="w-[90%] h-[90%] border border-red-800 rounded-full flex items-center justify-center text-center">
                  <span className="text-[10px] font-bold text-red-800 transform scale-75 leading-tight">
                    数权中心<br />已确权<br />VERIFIED
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Certificate Fields */}
          <div className="space-y-6 relative z-10 font-sans">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1 tracking-wider">Asset Name / 资产名称</label>
              <div className="text-lg font-bold text-gray-900 font-serif leading-tight">
                {product.title}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1 tracking-wider">Issue Date / 登记日</label>
                <div className="text-sm font-bold text-gray-800">
                  2025-12-12
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1 tracking-wider">Asset Type / 类型</label>
                <div className="text-sm font-bold text-gray-800">
                  产业数据资产包
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div className="flex items-start gap-3 mb-3">
                <Shield size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-0.5">Asset Anchor / 资产锚定</label>
                  <div className="text-sm font-medium text-gray-800">
                    涉及农户/合作社：238户 (数据已脱敏)
                    <span className="inline-block ml-1 text-[10px] text-amber-600 border border-amber-200 px-1 rounded bg-white">隐私保护</span>
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1 leading-tight">
                    * 根据《数据安全法》及商业保密协议，底层隐私信息已做Hash脱敏处理，仅持有人可申请解密查看。
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">Blockchain Fingerprint / 存证指纹</label>
              <div className="bg-gray-900 text-green-500 font-mono text-[10px] p-3 rounded break-all leading-relaxed relative group cursor-pointer hover:bg-gray-800 transition-colors">
                <Copy size={12} className="absolute right-2 top-2 text-gray-500 group-hover:text-green-400" />
                <div className="flex items-center gap-2 mb-1 text-gray-500 font-sans font-bold">
                  <Fingerprint size={12} />
                  <span className="uppercase">Ethereum Mainnet</span>
                </div>
                0x7d9a8b1c4e2f3a6b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6
              </div>
            </div>

            <div className="text-center pt-4">
              <label className="block text-xs font-bold text-gray-300 uppercase mb-1 tracking-[0.3em]">Certificate Number</label>
              <div className="text-base font-bold text-amber-900/80 font-mono">
                37-DATA-2025-{product.id.toString().padStart(6, '0')}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-gray-100 z-50 flex items-center justify-between gap-4">
        <div className="text-left">
          <div className="text-xs text-gray-400 uppercase font-bold">Starting Bid / 起拍价</div>
          <div className="text-xl font-bold text-gray-900 font-mono flex items-baseline">
            <span className="text-sm">¥</span>
            {product.price.toLocaleString()}
          </div>
        </div>
        <button className="flex-1 bg-[#8B0000] text-amber-100 hover:bg-[#A00000] transition-colors py-3.5 rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-900/20 active:scale-[0.98]">
          <Gavel size={18} />
          参与竞价摘牌
        </button>
      </div>

    </div>
  );
};

export default ProductDetail;