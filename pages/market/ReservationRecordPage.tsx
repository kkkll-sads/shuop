import React from 'react';
import { ChevronLeft, CheckCircle2, Clock } from 'lucide-react';

interface ReservationRecordPageProps {
    onBack: () => void;
}

const ReservationRecordPage: React.FC<ReservationRecordPageProps> = ({ onBack }) => {
    // Mock Data
    const record = {
        id: 'REV-20250515-001',
        status: 'pending', // pending, matched, missed
        productName: '山河锦绣 · 主题典藏',
        amount: 1000.00,
        hashrate: 7.5,
        time: '2025-05-15 14:30:00',
        matchTimeTip: '预计撮合时间：2025-05-15 15:00:00'
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded-full">
                    <ChevronLeft size={24} className="text-gray-700" />
                </button>
                <h1 className="text-lg font-bold text-gray-900">预约记录</h1>
                <div className="w-8"></div>
            </header>

            <div className="p-5">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center mb-6">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-500 mb-4">
                        <CheckCircle2 size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">预约提交成功</h2>
                    <p className="text-gray-500 text-sm mb-6">系统已接收您的申购请求，等待系统自动撮合</p>

                    <div className="bg-gray-50 rounded-xl p-4 w-full space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">状态</span>
                            <span className="font-bold text-orange-500 flex items-center gap-1">
                                <Clock size={14} />
                                待撮合
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">申购商品</span>
                            <span className="font-bold text-gray-900">{record.productName}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">冻结金额</span>
                            <span className="font-bold text-gray-900 font-mono">¥{record.amount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">消耗算力</span>
                            <span className="font-bold text-gray-900 font-mono">{record.hashrate}</span>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-100 w-full text-left">
                        <div className="text-xs text-orange-500 bg-orange-50 p-3 rounded-lg flex items-start gap-2">
                            <Clock size={14} className="mt-0.5 shrink-0" />
                            {record.matchTimeTip}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReservationRecordPage;
