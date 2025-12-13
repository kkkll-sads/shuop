import React, { useState, useRef } from 'react';
import { ChevronLeft, Plus, XCircle, AlertCircle, History, Check, Image as ImageIcon } from 'lucide-react';

interface ClaimStationProps {
    onBack?: () => void;
}

interface ClaimRecord {
    id: string;
    type: string;
    amount: number;
    status: 'audit' | 'success' | 'rejected'; // audit: 审核中, success: 成功, rejected: 驳回
    time: string;
    reason?: string;
}

const ClaimStation: React.FC<ClaimStationProps> = ({ onBack }) => {
    // 1: 实名, 2: 凭证, 3: 审核, 4: 结果
    const [step] = useState(2);
    const [form, setForm] = useState({
        type: 'screenshot',
        amount: '',
        images: [] as string[],
    });
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<ClaimRecord[]>([
        { id: '1', type: 'balance', amount: 5000.00, status: 'audit', time: '2023-10-27 10:00' },
        { id: '2', type: 'transfer', amount: 948.00, status: 'success', time: '2023-10-26 14:30' },
        { id: '3', type: 'other', amount: 3000.00, status: 'rejected', time: '2023-10-25 09:15', reason: '审核失败为什么...' },
    ]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const currentCount = form.images.length;
            const newFiles = Array.from(files);

            // Calculate how many more we can add
            const remainingSlots = 8 - currentCount;
            const filesToAdd = newFiles.slice(0, remainingSlots);

            const newImages = filesToAdd.map(file => URL.createObjectURL(file as any));
            setForm(prev => ({ ...prev, images: [...prev.images, ...newImages] }));

            if (newFiles.length > remainingSlots) {
                alert('最多只能上传8张凭证');
            }
        }
    };

    const handleSubmit = () => {
        if (!form.amount || parseFloat(form.amount) <= 0) {
            alert('请输入有效的确权金额');
            return;
        }
        if (form.images.length === 0) {
            alert('请上传凭证截图');
            return;
        }

        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            const newRecord: ClaimRecord = {
                id: Date.now().toString(),
                type: form.type === 'screenshot' ? 'balance' : form.type,
                amount: parseFloat(form.amount),
                status: 'audit',
                time: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-').slice(0, 16)
            };
            setHistory([newRecord, ...history]);
            alert('提交成功！请等待人工复核');
            setForm({ type: 'screenshot', amount: '', images: [] });
        }, 1500);
    };

    const getStatusTag = (status: string) => {
        switch (status) {
            case 'audit':
                return <span className="text-xs px-2 py-1 rounded bg-[#FDE68A] text-[#92400E] font-medium">AI审计中</span>;
            case 'success':
                return <span className="text-xs px-2 py-1 rounded bg-[#DEF7EC] text-[#03543F] font-medium">确权成功</span>;
            case 'rejected':
                return <span className="text-xs px-2 py-1 rounded bg-[#FDE8E8] text-[#9B1C1C] font-medium">审核失败</span>;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#FFF8F0] pb-24 font-sans">
            {/* Header */}
            <header className="bg-[#D48E58] px-4 py-3 flex items-center justify-center sticky top-0 z-20 shadow-sm text-white">
                {onBack && (
                    <button className="absolute left-4 p-1 active:opacity-70" onClick={onBack}>
                        <ChevronLeft size={24} className="text-white" />
                    </button>
                )}
                <h1 className="text-lg font-bold">数链确权·资产复苏计划</h1>
            </header>

            {/* Steps */}
            <div className="bg-[#FFF8F0] pt-6 pb-2 px-6">
                <div className="flex items-center justify-between relative">
                    {/* Background Line */}
                    <div className="absolute top-3 left-0 w-full h-1 bg-[#FFE4C4] -z-10 rounded-full"></div>

                    {[
                        { label: '实名认证', status: 'done' },
                        { label: '上传凭证', status: 'active' },
                        { label: '等待审核', status: 'wait' },
                        { label: '确权成功', status: 'wait' },
                    ].map((s, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-2">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 bg-[#FFF8F0] 
                                ${s.status === 'done' ? 'border-[#D48E58] bg-[#D48E58]' :
                                    s.status === 'active' ? 'border-[#D48E58]' : 'border-[#FFE4C4]'}
                             `}>
                                {s.status === 'done' && <Check size={14} className="text-white" />}
                                {s.status === 'active' && <div className="w-2.5 h-2.5 rounded-full bg-[#D48E58]"></div>}
                            </div>
                            <span className={`text-xs font-medium ${s.status === 'active' || s.status === 'done' ? 'text-[#8B4513]' : 'text-[#D2B48C]'}`}>
                                {s.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <main className="px-4 py-4 space-y-6">
                {/* Form Card */}
                <div className="bg-[#FFF] rounded-xl p-5 shadow-sm border border-[#FFE4C4]">

                    <div className="space-y-5">
                        {/* Type Select */}
                        <div>
                            <h3 className="text-[#8B4513] font-bold text-sm mb-2 border-l-4 border-[#D48E58] pl-2">凭证类型</h3>
                            <div className="relative">
                                <select
                                    className="w-full appearance-none bg-white border border-[#D48E58] text-[#5C3D2E] text-sm rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#D48E58] shadow-sm"
                                    value={form.type}
                                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                                >
                                    <option value="screenshot">余额截图</option>
                                    <option value="transfer">转账记录</option>
                                    <option value="other">其他凭证</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#D48E58]">
                                    <ChevronLeft size={20} className="-rotate-90" />
                                </div>
                            </div>
                        </div>

                        {/* Amount Input */}
                        <div>
                            <input
                                type="number"
                                className="w-full bg-white border border-[#D48E58] text-[#5C3D2E] text-sm rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#D48E58] shadow-sm placeholder-[#D2B48C]"
                                placeholder="确权金额"
                                value={form.amount}
                                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                            />
                            <p className="mt-2 text-xs text-[#8B4513]">提示：请严格按照截图金额填写，虚假申报将导致封号</p>
                        </div>

                        {/* Upload */}
                        <div>
                            <h3 className="text-[#8B4513] font-bold text-sm mb-2 border-l-4 border-[#D48E58] pl-2">凭证上传</h3>
                            <div className="grid grid-cols-4 gap-3">
                                {form.images.map((img, idx) => (
                                    <div key={idx} className="aspect-square rounded-lg bg-[#FFF8F0] border border-[#FFE4C4] overflow-hidden relative group">
                                        <img src={img} alt="preview" className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}
                                            className="absolute top-0.5 right-0.5 bg-black/40 text-white rounded-full p-0.5"
                                        >
                                            <XCircle size={12} />
                                        </button>
                                    </div>
                                ))}

                                {form.images.length < 8 && (
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="aspect-square rounded-lg bg-[#D48E58] flex items-center justify-center text-white hover:opacity-90 transition-opacity shadow-sm"
                                    >
                                        <Plus size={24} />
                                    </button>
                                )}

                                {/* Placeholder logic: Show 2nd slot if only 0 images uploaded to satisfy "Display two" look initially */}
                                {form.images.length === 0 && (
                                    <div className="aspect-square rounded-lg bg-[#FFF8F0] border border-[#FFE4C4] flex items-center justify-center">
                                        <ImageIcon size={24} className="text-[#FFE4C4]" />
                                    </div>
                                )}

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className={`w-full py-3.5 rounded-lg text-base font-bold text-white shadow-md transition-all active:scale-[0.98] mt-4 
                                ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-[#AAAAAA] to-[#888888]'}`}
                            style={{ background: loading ? '#ccc' : 'linear-gradient(90deg, #9ca3af 0%, #6b7280 100%)' }}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    正在上链提交... <span className="animate-spin">◌</span>
                                </span>
                            ) : '提交'}
                        </button>
                    </div>
                </div>

                {/* History List */}
                <div className="space-y-4">
                    <h3 className="font-bold text-[#5C3D2E] text-base px-1">历史记录区</h3>

                    {history.map((record, idx) => (
                        <div key={record.id} className="bg-[#FFF] p-4 rounded-xl shadow-sm border border-[#FFE4C4] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-[#5C3D2E] font-medium min-w-[4rem]">Record {history.length - idx}</span>
                                {getStatusTag(record.status)}
                            </div>

                            <div className="flex-1 text-right">
                                {record.status === 'audit' && (
                                    <span className="text-[#5C3D2E] text-sm">标签：AI审计中</span>
                                )}
                                {record.status === 'success' && (
                                    <span className="text-[#5C3D2E] text-sm font-medium">金额：${record.amount.toFixed(2)}</span>
                                )}
                                {record.status === 'rejected' && (
                                    <div className="flex items-center justify-end gap-2 text-sm text-[#5C3D2E]">
                                        <span className="truncate max-w-[8rem]" title={record.reason}>原因：{record.reason}</span>
                                        <button className="text-[#8B4513] border border-[#8B4513] px-2 py-0.5 rounded textxs">重新编辑</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default ClaimStation;
