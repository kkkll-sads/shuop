import React, { useState } from 'react';
import { ChevronLeft, CheckCircle2, Clock, Wallet, Zap, AlertCircle, ArrowRight } from 'lucide-react';

interface ReservationRecordPageProps {
    onBack: () => void;
}

type RecordStatus = 'pending' | 'success' | 'failed';

interface ReservationRecord {
    id: string;
    status: RecordStatus;
    productName: string;
    productImage: string;
    price: number;
    baseHashrate: number;
    extraHashrate: number;
    frozenAmount: number;
    submitTime: string;
    matchTimeTip?: string;
    zone: string; // 1k, 2k, 3k, 4k
}

// Mock Data
const MOCK_RECORDS: ReservationRecord[] = [
    {
        id: 'REV-20250515-001',
        status: 'pending',
        productName: '山河锦绣 · 主题典藏',
        productImage: 'https://images.unsplash.com/photo-1549281899-f75600a24107?auto=format&fit=crop&q=80&w=200',
        price: 1000,
        baseHashrate: 5.0,
        extraHashrate: 2.5,
        frozenAmount: 1000,
        submitTime: '2025-05-15 14:30:00',
        matchTimeTip: '预计撮合时间：2025-05-15 15:00:00',
        zone: '1k'
    },
    {
        id: 'REV-20250514-002',
        status: 'success',
        productName: '江南水乡 · 限量款',
        productImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=200',
        price: 544.98,
        baseHashrate: 5.0,
        extraHashrate: 5.0,
        frozenAmount: 544.98,
        submitTime: '2025-05-14 10:15:00',
        zone: '1k',
        matchTimeTip: '撮合成功时间：2025-05-14 11:00:00'
    },
    {
        id: 'REV-20250513-003',
        status: 'failed',
        productName: '赛博朋克 · 未知核心',
        productImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=200',
        price: 2500,
        baseHashrate: 10.0,
        extraHashrate: 1.0,
        frozenAmount: 2500,
        submitTime: '2025-05-13 16:45:00',
        zone: '2k',
        matchTimeTip: '撮合结束：2025-05-13 17:30:00'
    },
    {
        id: 'REV-20250512-004',
        status: 'pending',
        productName: '星际迷航 · 探索者',
        productImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=200',
        price: 4200,
        baseHashrate: 20.0,
        extraHashrate: 8.0,
        frozenAmount: 4200,
        submitTime: '2025-05-12 09:20:00',
        matchTimeTip: '预计撮合时间：2025-05-12 10:00:00',
        zone: '4k'
    }
];

const ReservationRecordPage: React.FC<ReservationRecordPageProps> = ({ onBack }) => {
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [zoneFilter, setZoneFilter] = useState<string>('all');

    const filteredRecords = MOCK_RECORDS.filter(record => {
        const matchStatus = statusFilter === 'all' || record.status === statusFilter;
        const matchZone = zoneFilter === 'all' || record.zone === zoneFilter;
        return matchStatus && matchZone;
    });

    const getStatusBadge = (status: RecordStatus) => {
        switch (status) {
            case 'pending':
                return <span className="text-xs font-bold px-2 py-0.5 rounded bg-orange-50 text-orange-500 border border-orange-100 flex items-center gap-1"><Clock size={10} /> 待匹配</span>;
            case 'success':
                return <span className="text-xs font-bold px-2 py-0.5 rounded bg-green-50 text-green-500 border border-green-100 flex items-center gap-1"><CheckCircle2 size={10} /> 中签</span>;
            case 'failed':
                return <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-50 text-gray-400 border border-gray-100 flex items-center gap-1"><AlertCircle size={10} /> 未中签</span>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm border-b border-gray-100">
                <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded-full">
                    <ChevronLeft size={24} className="text-gray-700" />
                </button>
                <h1 className="text-lg font-bold text-gray-900">申购记录</h1>
                <div className="w-8"></div>
            </header>

            {/* Filters */}
            <div className="sticky top-[53px] z-10 bg-white border-b border-gray-100 shadow-sm">
                {/* Status Tabs */}
                <div className="flex px-4 border-b border-gray-50">
                    {['all', 'pending', 'success', 'failed'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${statusFilter === status
                                    ? 'border-[#8B0000] text-[#8B0000]'
                                    : 'border-transparent text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {status === 'all' ? '全部' : status === 'pending' ? '待匹配' : status === 'success' ? '中签' : '未中签'}
                        </button>
                    ))}
                </div>
                {/* Zone Chips */}
                <div className="flex gap-2 p-3 overflow-x-auto scrollbar-none">
                    {['all', '1k', '2k', '3k', '4k'].map(zone => (
                        <button
                            key={zone}
                            onClick={() => setZoneFilter(zone)}
                            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${zoneFilter === zone
                                    ? 'bg-orange-50 border-orange-200 text-orange-600'
                                    : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            {zone === 'all' ? '全部金额' : `${zone}区`}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="p-4 space-y-4">
                {filteredRecords.length === 0 ? (
                    <div className="py-20 text-center text-gray-400">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock size={24} />
                        </div>
                        <p className="text-sm">暂无申购记录</p>
                    </div>
                ) : (
                    filteredRecords.map(record => (
                        <div key={record.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            {/* Header: ID + Status */}
                            <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-50">
                                <span className="text-xs text-gray-400 font-mono">{record.id}</span>
                                {getStatusBadge(record.status)}
                            </div>

                            {/* Product Info */}
                            <div className="flex gap-3 mb-4">
                                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                    <img src={record.productImage} alt={record.productName} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-gray-900 font-bold truncate text-sm mb-1">{record.productName}</h3>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded border border-orange-100 font-bold">{record.zone}区</span>
                                    </div>
                                    <div className="text-xs text-gray-400 flex items-center gap-1">
                                        <Clock size={10} />
                                        <span>提交: {record.submitTime.split(' ')[0]}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="bg-gray-50 rounded-lg p-3 grid grid-cols-2 gap-y-2 gap-x-4 mb-4">
                                <div className="flexjustify-between items-center">
                                    <span className="text-[10px] text-gray-500 flex items-center gap-1"><Zap size={10} /> 消耗算力</span>
                                    <span className="text-xs font-bold text-gray-900 font-mono">
                                        {record.baseHashrate} + <span className="text-orange-500">{record.extraHashrate}</span>
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-gray-500 flex items-center gap-1"><Wallet size={10} /> {record.status === 'failed' ? '解冻金额' : '冻结金额'}</span>
                                    <span className="text-xs font-bold text-gray-900 font-mono">¥{record.frozenAmount.toLocaleString()}</span>
                                </div>
                                <div className="col-span-2 text-[10px] text-gray-400 border-t border-gray-200/50 pt-2 mt-1">
                                    {record.matchTimeTip}
                                </div>
                            </div>

                            {/* Action Button */}
                            <div className="flex justify-end">
                                {record.status === 'pending' && (
                                    <button className="text-sm font-bold text-orange-500 bg-orange-50 px-4 py-2 rounded-lg w-full">等待撮合...</button>
                                )}
                                {record.status === 'success' && (
                                    <button className="text-sm font-bold text-white bg-[#8B0000] px-4 py-2 rounded-lg w-full flex items-center justify-center gap-1 shadow-md shadow-red-900/10">
                                        去持仓查看 <ArrowRight size={14} />
                                    </button>
                                )}
                                {record.status === 'failed' && (
                                    <button className="text-sm font-bold text-gray-500 bg-gray-100 px-4 py-2 rounded-lg w-full">
                                        查看详情 (算力已消耗)
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ReservationRecordPage;
