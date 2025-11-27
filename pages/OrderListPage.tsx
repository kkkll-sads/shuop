import React, { useState } from 'react';
import { Package } from 'lucide-react';
import SubPageLayout from '../components/SubPageLayout';
import { Order } from '../types';
import { MOCK_ORDERS } from '../constants';

interface OrderListPageProps {
  category: string; // product, transaction, delivery, points
  initialTab: number;
  onBack: () => void;
}

const OrderListPage: React.FC<OrderListPageProps> = ({ category, initialTab, onBack }) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  const getPageConfig = () => {
    switch (category) {
      case 'product':
        return {
          title: '商品订单',
          tabs: ['买入订单', '卖出订单']
        };
      case 'transaction':
        return {
          title: '交易订单',
          tabs: ['待寄售', '寄售中', '寄售失败']
        };
      case 'delivery':
        return {
          title: '提货订单',
          tabs: ['待发货', '待收货', '已签收']
        };
      case 'points':
        return {
          title: '积分订单',
          tabs: ['待付款', '待发货', '待收货', '已完成']
        };
      default:
        return { title: '订单列表', tabs: [] };
    }
  };

  const config = getPageConfig();

  const filteredOrders = MOCK_ORDERS.filter(
    order => order.type === category && order.subStatusIndex === activeTab
  );

  return (
    <SubPageLayout title={config.title} onBack={onBack}>
      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 sticky top-12 z-20">
        <div className="flex overflow-x-auto no-scrollbar">
          {config.tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`flex-1 min-w-[80px] py-3 text-sm font-medium relative whitespace-nowrap ${
                activeTab === index ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              {tab}
              {activeTab === index && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-blue-600 rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Order List */}
      <div className="p-4 space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-50">
              <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-50">
                <span className="text-xs text-gray-500">{order.date}</span>
                <span className="text-xs font-medium text-blue-600">{order.status}</span>
              </div>
              
              <div className="flex gap-3">
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={order.productImage} alt={order.productName} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-800 mb-1">{order.productName}</h3>
                  <div className="text-xs text-gray-400 mb-2">数量: {order.quantity}</div>
                  <div className="flex justify-between items-end">
                     <div className="text-sm font-bold text-gray-900">¥ {order.total.toFixed(2)}</div>
                     {/* Mock Action Button based on status could go here */}
                     <button className="px-3 py-1 rounded-full border border-gray-200 text-xs text-gray-600 active:bg-gray-50">
                        查看详情
                     </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Package size={48} className="mb-2 opacity-20" />
            <p className="text-xs">暂无订单数据</p>
          </div>
        )}
      </div>
    </SubPageLayout>
  );
};

export default OrderListPage;