import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface ServiceRechargeProps {
  onBack: () => void;
}

const ServiceRecharge: React.FC<ServiceRechargeProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white px-4 py-3 flex items-center sticky top-0 z-10 shadow-sm">
        <button onClick={onBack} className="absolute left-4 p-1">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-gray-800 w-full text-center">服务充值</h1>
      </header>

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-2">
          <div className="text-xs text-gray-500">当前服务费余额 (元)</div>
          <div className="text-2xl font-bold text-gray-900">¥ 0.00</div>
          <div className="text-[11px] text-gray-400">
            服务费主要用于平台服务、技术维护等相关支出，具体扣费规则以服务协议为准。
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">充值金额 (元)</label>
            <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50">
              <span className="text-gray-500 mr-1">¥</span>
              <input
                type="number"
                placeholder="请输入充值金额"
                className="flex-1 bg-transparent outline-none text-gray-900 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">支付方式</label>
            <div className="grid grid-cols-2 gap-3">
              <button className="border border-orange-500 text-orange-600 bg-orange-50 rounded-lg py-2 text-sm">
                余额支付
              </button>
              <button className="border border-gray-200 rounded-lg py-2 text-sm text-gray-700">
                其他方式
              </button>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400 leading-relaxed">
          完成充值即视为同意相关服务协议与费用说明。请在操作前仔细阅读平台公布的服务条款及风险提示。
        </p>

        <button className="w-full bg-orange-600 text-white rounded-full py-3 text-sm font-medium active:bg-orange-700">
          确认充值
        </button>
      </div>
    </div>
  );
};

export default ServiceRecharge;

