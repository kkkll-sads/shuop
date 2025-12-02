import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface BalanceWithdrawProps {
  onBack: () => void;
}

const BalanceWithdraw: React.FC<BalanceWithdrawProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white px-4 py-3 flex items-center sticky top-0 z-10 shadow-sm">
        <button onClick={onBack} className="absolute left-4 p-1">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-gray-800 w-full text-center">余额提现</h1>
      </header>

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>可提现余额 (元)</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">¥ 0.00</div>
          <div className="text-[11px] text-gray-400">
            单笔提现金额及次数可能受银行或支付机构限制，以实际处理结果为准。
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
              <button className="ml-2 text-xs text-blue-600">全部提现</button>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">收款账户</label>
            <button className="w-full flex justify-between items-center border rounded-lg px-3 py-2 bg-gray-50 text-sm text-gray-700">
              <span>请选择绑定的银行卡</span>
              <span className="text-xs text-blue-600">去管理</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-400 leading-relaxed">
          预计到账时间：1-3个工作日。节假日顺延。提现期间请保持预留手机号畅通，以便银行或平台核实信息。
        </p>

        <button className="w-full bg-blue-600 text-white rounded-full py-3 text-sm font-medium active:bg-blue-700">
          提交提现申请
        </button>
      </div>
    </div>
  );
};

export default BalanceWithdraw;


