
import React from 'react';
import { ArrowLeft, Wallet, Receipt, CreditCard, FileText } from 'lucide-react';

interface AssetViewProps {
  onBack: () => void;
}

const AssetView: React.FC<AssetViewProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white px-4 py-3 flex items-center sticky top-0 z-10">
          <button onClick={onBack} className="absolute left-4 p-1"><ArrowLeft size={20} /></button>
          <h1 className="text-lg font-bold text-gray-800 w-full text-center">我的资产</h1>
          <button className="absolute right-4 text-sm text-blue-600">历史记录</button>
      </header>
      <div className="p-4">
           {/* Asset Card */}
           <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-6 text-white shadow-lg mb-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                  <div className="text-sm opacity-90 mb-1">可用余额 (元)</div>
                  <div className="text-4xl font-bold mb-6">¥ 0.00</div>
                  
                  <div className="w-full h-px bg-white opacity-20 mb-4"></div>
                  
                  <div className="flex justify-between text-sm">
                      <div>
                          <div className="opacity-70 text-xs mb-1">充值服务费</div>
                          <div className="font-medium">0.00</div>
                      </div>
                      <div>
                          <div className="opacity-70 text-xs mb-1">拓展服务费</div>
                          <div className="font-medium">0.00</div>
                      </div>
                      <div>
                          <div className="opacity-70 text-xs mb-1">赠送服务费</div>
                          <div className="font-medium">0.00</div>
                      </div>
                  </div>
              </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-4 gap-4 mb-8">
              {[
                  {label: '余额充值', icon: Wallet},
                  {label: '余额提现', icon: Receipt},
                  {label: '拓展提现', icon: Receipt},
                  {label: '服务充值', icon: CreditCard}
              ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mb-2 text-gray-700">
                          <item.icon size={20} />
                      </div>
                      <span className="text-xs text-gray-600">{item.label}</span>
                  </div>
              ))}
          </div>

          {/* Tabs */}
          <div className="flex justify-between bg-white p-1 rounded-full mb-8">
              {['余额明细', '拓展明细', '服务费明细', '赠送服务'].map((tab, idx) => (
                  <button key={idx} className={`flex-1 py-2 text-xs rounded-full ${idx === 1 ? 'bg-blue-100 text-blue-600 font-bold' : 'text-gray-500'}`}>
                      {tab}
                  </button>
              ))}
          </div>

          {/* Empty State */}
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <div className="w-16 h-16 mb-4 border-2 border-gray-200 rounded-lg flex items-center justify-center">
                  <FileText size={32} className="opacity-50" />
              </div>
              <span className="text-xs">暂无数据</span>
          </div>
      </div>
    </div>
  );
};

export default AssetView;
