import React from 'react';
import { ShoppingCart, Truck, Coins, Clock, Package, XCircle, CheckCircle, FileText, ArrowRightLeft } from 'lucide-react';

interface OrdersProps {
  onNavigate?: (path: string) => void;
}

interface OrderSectionProps {
  title: string;
  items: {
    icon: React.ElementType;
    label: string;
    actionKey: string; // Used for navigation routing
  }[];
  onItemClick: (key: string) => void;
}

const OrderSection: React.FC<OrderSectionProps> = ({ title, items, onItemClick }) => (
  <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
    <div className="flex items-center mb-4 border-l-4 border-orange-600 pl-2">
      <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
    </div>
    <div className={`grid grid-cols-${items.length > 4 ? 4 : items.length} gap-4`}>
      {items.map((item, index) => (
        <div
          key={index}
          className="flex flex-col items-center cursor-pointer active:opacity-70"
          onClick={() => onItemClick(item.actionKey)}
        >
          <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center mb-2">
            <item.icon size={20} className="text-orange-500" />
          </div>
          <span className="text-xs text-gray-600">{item.label}</span>
        </div>
      ))}
    </div>
  </div>
);

const Orders: React.FC<OrdersProps> = ({ onNavigate }) => {
  const handleNav = (key: string) => {
    if (onNavigate) {
      onNavigate(`order-list:${key}`);
    }
  };

  return (
    <div className="pb-24 min-h-screen bg-gray-50">
      <header className="bg-white px-4 py-3 flex items-center justify-center sticky top-0 z-10 shadow-sm">
        <h1 className="text-lg font-bold text-gray-800">订单中心</h1>
      </header>

      <div className="p-4 space-y-4">
        <OrderSection
          title="商品订单"
          onItemClick={handleNav}
          items={[
            { icon: ShoppingCart, label: '买入订单', actionKey: 'product:0' },
            { icon: ArrowRightLeft, label: '卖出订单', actionKey: 'product:1' }
          ]}
        />

        <OrderSection
          title="交易订单"
          onItemClick={handleNav}
          items={[
            { icon: ShoppingCart, label: '待寄售', actionKey: 'transaction:0' },
            { icon: Clock, label: '寄售中', actionKey: 'transaction:1' },
            { icon: XCircle, label: '寄售失败', actionKey: 'transaction:2' }
          ]}
        />

        <OrderSection
          title="提货订单"
          onItemClick={handleNav}
          items={[
            { icon: Package, label: '待发货', actionKey: 'delivery:0' },
            { icon: Truck, label: '待收货', actionKey: 'delivery:1' },
            { icon: CheckCircle, label: '已签收', actionKey: 'delivery:2' }
          ]}
        />

        <OrderSection
          title="积分订单"
          onItemClick={handleNav}
          items={[
            { icon: Coins, label: '待付款', actionKey: 'points:0' },
            { icon: Package, label: '待发货', actionKey: 'points:1' },
            { icon: Truck, label: '待收货', actionKey: 'points:2' },
            { icon: CheckCircle, label: '已完成', actionKey: 'points:3' }
          ]}
        />
      </div>
    </div>
  );
};

export default Orders;