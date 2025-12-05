import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface ExtensionWithdrawProps {
  onBack: () => void;
}

const ExtensionWithdraw: React.FC<ExtensionWithdrawProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white px-4 py-3 flex items-center sticky top-0 z-10 shadow-sm">
        <button onClick={onBack} className="absolute left-4 p-1">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-gray-800 w-full text-center">拓展提现</h1>
      </header>

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>可提现拓展服务费 (元)</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">¥ 0.00</div>
          <div className="text-[11px] text-gray-400">
            拓展收益按平台规则结算后方可申请提现，具体结算周期以公告为准。
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">提现金额 (元)</label>
            <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50">
              <span className="text-gray-500 mr-1">¥</span>
              <input
                type="number"
                placeholder="请输入提现金额"
                className="flex-1 bg-transparent outline-none text-gray-900 text-sm"
              />
              <button className="ml-2 text-xs text-orange-600">全部提现</button>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">收款账户</label>
            <button className="w-full flex justify-between items-center border rounded-lg px-3 py-2 bg-gray-50 text-sm text-gray-700">
              <span>请选择收款账户</span>
              <span className="text-xs text-orange-600">去设置</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-400 leading-relaxed">
          为保障资金安全，平台可能会对部分高频或大额提现订单进行人工或电话核实，请您留意来电与站内消息。
        </p>

        <button className="w-full bg-orange-600 text-white rounded-full py-3 text-sm font-medium active:bg-orange-700">
          提交提现申请
        </button>
      </div>
    </div>
  );
};

export default ExtensionWithdraw;


