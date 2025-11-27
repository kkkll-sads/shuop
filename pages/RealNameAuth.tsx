
import React from 'react';
import { ShieldCheck, CreditCard, User } from 'lucide-react';
import SubPageLayout from '../components/SubPageLayout';

interface RealNameAuthProps {
  onBack: () => void;
}

const RealNameAuth: React.FC<RealNameAuthProps> = ({ onBack }) => {
  return (
    <SubPageLayout title="实名认证" onBack={onBack}>
      <div className="p-4">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg mb-6 flex items-center justify-between">
            <div>
                <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
                    <ShieldCheck size={24} />
                    已认证
                </h2>
                <p className="text-green-100 text-sm opacity-90">您的身份信息已通过审核</p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <ShieldCheck size={32} className="text-white" />
            </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                    <User size={16} />
                </div>
                <div className="flex-1">
                    <div className="text-xs text-gray-400 mb-0.5">真实姓名</div>
                    <div className="text-sm font-bold text-gray-800">吴菁菁</div>
                </div>
            </div>
            <div className="p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                    <CreditCard size={16} />
                </div>
                <div className="flex-1">
                    <div className="text-xs text-gray-400 mb-0.5">身份证号</div>
                    <div className="text-sm font-bold text-gray-800">330************017</div>
                </div>
            </div>
        </div>

        <div className="mt-8 text-center">
            <p className="text-xs text-gray-400 leading-5">
                信息安全保护中，身份信息仅用于合规监管认证。<br/>
                如需修改，请联系人工客服。
            </p>
        </div>
      </div>
    </SubPageLayout>
  );
};

export default RealNameAuth;
