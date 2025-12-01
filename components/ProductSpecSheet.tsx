import React, { useState, useEffect } from 'react';
import { X, Minus, Plus } from 'lucide-react';
import { Product } from '../types';
import { createOrder, AUTH_TOKEN_KEY } from '../services/api';

interface ProductSpecSheetProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onSuccess?: () => void;
}

const ProductSpecSheet: React.FC<ProductSpecSheetProps> = ({ isOpen, onClose, product, onSuccess }) => {
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // In a real app, specs would come from the product data.
  // Mocking a spec based on the screenshot.
  const [selectedSpec, setSelectedSpec] = useState(`${product.title} (${product.artist})`);

  // 重置状态当弹窗关闭时
  useEffect(() => {
    if (!isOpen) {
      setQuantity(1);
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleQuantityChange = (delta: number) => {
    const newQty = quantity + delta;
    if (newQty >= 1) {
      setQuantity(newQty);
    }
  };

  const handleExchange = async () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    
    if (!token) {
      setError('请先登录后再进行兑换');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 将 product.id 转换为数字（如果后端需要）
      const productId = typeof product.id === 'string' ? parseInt(product.id, 10) : product.id;
      
      if (isNaN(productId)) {
        throw new Error('商品ID格式错误');
      }

      const response = await createOrder({
        items: [
          {
            product_id: productId,
            quantity: quantity,
          },
        ],
        pay_type: 'score', // 积分支付
        remark: '',
        token,
      });

      // 检查响应
      const isSuccess = response.code === 1 || response.code === 200;
      if (isSuccess) {
        if (onSuccess) {
          onSuccess();
        }
        onClose();
        // 显示后端返回的提示信息
        alert(response.msg || response.message || '兑换成功！');
      } else {
        const errorMsg =
          response.msg ||
          response.message ||
          `兑换失败 (code: ${response.code ?? '未知'})`;
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      console.error('兑换失败:', err);
      setError(err.message || '兑换失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Bottom Sheet */}
      <div className="bg-white w-full max-w-md rounded-t-2xl p-4 relative z-10 animate-in slide-in-from-bottom duration-300">
        {/* Header: Product Info */}
        <div className="flex gap-3 mb-6 relative">
          <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 -mt-8 border-4 border-white shadow-sm">
            <img 
              src={product.image} 
              alt={product.title} 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 pt-1">
            <div className="text-blue-500 font-bold text-lg">
              {product.price.toFixed(2)} <span className="text-xs">积分</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              已选: {selectedSpec}, {quantity}件
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 absolute right-0 top-0">
            <X size={20} />
          </button>
        </div>

        {/* Specs */}
        <div className="mb-6">
          <div className="text-sm font-medium text-gray-800 mb-3">规格</div>
          <div className="flex flex-wrap gap-2">
            <button 
              className={`px-4 py-1.5 text-xs rounded-md transition-colors ${
                selectedSpec === `${product.title} (${product.artist})`
                  ? 'bg-gray-100 text-gray-900 font-medium border border-gray-200' 
                  : 'bg-gray-50 text-gray-500 border border-transparent'
              }`}
              onClick={() => setSelectedSpec(`${product.title} (${product.artist})`)}
            >
              {product.title} ({product.artist})
            </button>
          </div>
        </div>

        {/* Quantity */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-sm font-medium text-gray-800">购买数量</div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleQuantityChange(-1)}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 active:bg-gray-200"
            >
              <Minus size={16} />
            </button>
            <span className="w-8 text-center font-medium text-gray-800">{quantity}</span>
            <button 
              onClick={() => handleQuantityChange(1)}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 active:bg-gray-200"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Action Button */}
        <button 
          onClick={handleExchange}
          disabled={isLoading}
          className={`w-full bg-blue-600 text-white font-bold py-3 rounded-full shadow-lg shadow-blue-200 active:scale-[0.99] transition-transform ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? '兑换中...' : '立即兑换'}
        </button>
      </div>
    </div>
  );
};

export default ProductSpecSheet;