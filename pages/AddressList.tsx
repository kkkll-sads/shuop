
import React from 'react';
import { Plus, MapPin, Pencil, Trash2 } from 'lucide-react';
import SubPageLayout from '../components/SubPageLayout';

interface AddressListProps {
  onBack: () => void;
}

const AddressList: React.FC<AddressListProps> = ({ onBack }) => {
  const addresses = [
    {
      id: 1,
      name: '吴菁菁',
      phone: '138****8888',
      tag: '家',
      detail: '浙江省 杭州市 西湖区 文三路 123号 创业大厦',
      isDefault: true
    },
    {
      id: 2,
      name: '吴菁菁',
      phone: '138****8888',
      tag: '公司',
      detail: '浙江省 杭州市 滨江区 长河街道 456号',
      isDefault: false
    }
  ];

  return (
    <SubPageLayout title="收货地址" onBack={onBack}>
      <div className="p-4 space-y-4 pb-24">
        {addresses.map((addr) => (
          <div key={addr.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">{addr.name}</span>
                <span className="text-gray-500 text-sm">{addr.phone}</span>
                {addr.isDefault && (
                  <span className="bg-red-50 text-red-500 text-[10px] px-2 py-0.5 rounded-full">默认</span>
                )}
                {addr.tag && (
                  <span className="bg-blue-50 text-blue-500 text-[10px] px-2 py-0.5 rounded-full">{addr.tag}</span>
                )}
              </div>
              <button className="text-gray-400 p-1">
                <Pencil size={16} />
              </button>
            </div>
            <div className="text-sm text-gray-600 leading-relaxed pr-8 mb-3">
              {addr.detail}
            </div>
            <div className="border-t border-gray-50 pt-3 flex justify-between items-center">
                <div className="flex items-center gap-2" onClick={() => {}}>
                    <div className={`w-4 h-4 rounded-full border ${addr.isDefault ? 'border-red-500 bg-red-500' : 'border-gray-300'}`}></div>
                    <span className="text-xs text-gray-500">默认地址</span>
                </div>
                <button className="flex items-center gap-1 text-xs text-gray-500">
                    <Trash2 size={14} />
                    删除
                </button>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 pb-safe max-w-md mx-auto">
        <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-full flex items-center justify-center gap-2 active:scale-[0.99] transition-transform shadow-lg shadow-blue-100">
          <Plus size={20} />
          新增收货地址
        </button>
      </div>
    </SubPageLayout>
  );
};

export default AddressList;
