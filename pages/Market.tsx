
import React, { useState, useMemo } from 'react';
import { Search, Filter, LayoutGrid, List } from 'lucide-react';
import { PRODUCTS } from '../constants';
import { Product } from '../types';

interface MarketProps {
    onProductSelect?: (product: Product) => void;
}

const Market: React.FC<MarketProps> = ({ onProductSelect }) => {
  const [activeFilter, setActiveFilter] = useState('comprehensive');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Categories Configuration
  const categories = [
      { id: 'all', label: '全部商品', icon: LayoutGrid },
      { id: 'painting', label: '文化艺术', icon: Filter },
      { id: 'intangible', label: '非遗产品', icon: List }, // Mock category for now
      { id: 'other', label: '其他产品', icon: LayoutGrid } // Mock category for now
  ];

  // Filtering Logic
  const filteredProducts = useMemo(() => {
      return PRODUCTS.filter(product => {
          // Filter by Search Query
          const matchesSearch = product.title.includes(searchQuery) || 
                                product.artist.includes(searchQuery);
          
          // Filter by Category
          // Note: existing mock data mostly has 'painting'.
          const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;

          return matchesSearch && matchesCategory;
      }).sort((a, b) => {
          // Sort Logic
          if (activeFilter === 'price_asc') return a.price - b.price;
          if (activeFilter === 'price_desc') return b.price - a.price;
          return 0; // Default order
      });
  }, [searchQuery, selectedCategory, activeFilter]);

  const handleFilterClick = (filter: string) => {
      if (filter === 'price') {
          // Toggle price sort
          setActiveFilter(prev => prev === 'price_asc' ? 'price_desc' : 'price_asc');
      } else {
          setActiveFilter(filter);
      }
  };

  return (
    <div className="pb-40 min-h-screen bg-gray-50">
      {/* Header & Search */}
      <div className="bg-white p-3 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
            <h1 className="font-bold text-lg text-gray-800 whitespace-nowrap">积分兑换</h1>
            <div className="flex-1 bg-gray-100 rounded-full flex items-center px-3 py-1.5 border border-gray-100 focus-within:border-blue-200 transition-colors">
                <Search size={16} className="text-gray-400 mr-2" />
                <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="请输入您要搜索的商品名称" 
                    className="bg-transparent border-none outline-none text-xs flex-1 text-gray-700 placeholder-gray-400"
                />
            </div>
            <button className="bg-blue-600 text-white text-xs px-4 py-1.5 rounded-full shadow-sm shadow-blue-200 active:bg-blue-700">
                搜索
            </button>
        </div>
        
        {/* Categories Icons */}
        <div className="grid grid-cols-4 gap-2 mb-2">
            {categories.map((cat) => (
                <div 
                    key={cat.id} 
                    className="flex flex-col items-center py-2 cursor-pointer active:opacity-60"
                    onClick={() => setSelectedCategory(cat.id)}
                >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-1 border transition-colors ${selectedCategory === cat.id ? 'border-blue-500 text-blue-500 bg-blue-50' : 'border-gray-200 text-gray-400'}`}>
                        <cat.icon size={20} />
                    </div>
                    <span className={`text-[10px] ${selectedCategory === cat.id ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>
                        {cat.label}
                    </span>
                </div>
            ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-between text-sm border-t border-gray-100 pt-3">
            {[
                { id: 'comprehensive', label: '综合' },
                { id: 'price', label: '价格' },
                { id: 'sales', label: '销量' },
                { id: 'new', label: '最新' }
            ].map((filter) => (
                <button 
                    key={filter.id}
                    onClick={() => handleFilterClick(filter.id)}
                    className={`flex items-center justify-center flex-1 py-1 ${
                        (activeFilter === filter.id || (filter.id === 'price' && activeFilter.startsWith('price'))) 
                        ? 'text-blue-600 font-bold' 
                        : 'text-gray-500'
                    }`}
                >
                    {filter.label}
                    {filter.id === 'price' && (
                        <div className="flex flex-col ml-1 -space-y-1">
                            <span className={`w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[4px] ${activeFilter === 'price_asc' ? 'border-b-blue-600' : 'border-b-gray-300'}`}></span>
                            <span className={`w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[4px] ${activeFilter === 'price_desc' ? 'border-t-blue-600' : 'border-t-gray-300'}`}></span>
                        </div>
                    )}
                </button>
            ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="p-3">
        {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
                {filteredProducts.map((product) => (
                    <div 
                        key={product.id} 
                        className="bg-white rounded-lg overflow-hidden shadow-sm active:scale-[0.98] transition-transform flex flex-col"
                        onClick={() => onProductSelect && onProductSelect(product)}
                    >
                        <div className="aspect-square bg-gray-100 relative">
                            <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-2.5 flex flex-col flex-1 justify-between">
                            <div className="mb-2">
                                <div className="text-sm text-gray-800 font-medium line-clamp-2 h-10 mb-1 leading-5">
                                    {product.title}
                                </div>
                                <div className="flex items-center text-xs text-gray-500">
                                    <span className="bg-gray-100 text-gray-400 px-1 rounded text-[10px] mr-1 flex-shrink-0">
                                        艺术家
                                    </span>
                                    <span className="truncate">{product.artist}</span>
                                </div>
                            </div>
                            <div className="text-red-500 font-bold text-base leading-none pt-1">
                                <span className="text-xs mr-0.5">¥</span>{product.price.toFixed(2)} 
                                <span className="text-[10px] font-normal text-gray-400 ml-1">积分</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <LayoutGrid size={40} className="mb-2 opacity-20" />
                <p className="text-xs">暂无相关商品</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Market;
