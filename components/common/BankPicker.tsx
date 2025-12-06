import React, { useState, useEffect, useMemo } from 'react';
import { X, Check, Building2 } from 'lucide-react';
import { getBanks } from '../../utils/banks';

interface BankPickerProps {
    /** 是否显示 */
    visible: boolean;
    /** 关闭回调 */
    onClose: () => void;
    /** 确认回 - 返回选中的银行名称 */
    onConfirm: (bankName: string) => void;
    /** 默认选中的银行 */
    initialBank?: string;
}

/**
 * 银行选择器组件
 * 
 * 底部弹出的滚动选择器，用于选择银行
 * 
 * @example
 * ```tsx
 * <BankPicker
 *   visible={showPicker}
 *   onClose={() => setShowPicker(false)}
 *   onConfirm={(bank) => {
 *     setBankName(bank);
 *     setShowPicker(false);
 *   }}
 *   initialBank={bankName}
 * />
 * ```
 */
const BankPicker: React.FC<BankPickerProps> = ({
    visible,
    onClose,
    onConfirm,
    initialBank = '',
}) => {
    // 动画状态
    const [animating, setAnimating] = useState(false);
    const [render, setRender] = useState(false);

    // 选择状态
    const [selectedBank, setSelectedBank] = useState<string>('');

    // 数据源
    const banks = useMemo(() => getBanks(), []);

    // 处理显示/隐藏动画
    useEffect(() => {
        if (visible) {
            setRender(true);
            requestAnimationFrame(() => setAnimating(true));

            if (initialBank && banks.includes(initialBank)) {
                setSelectedBank(initialBank);
            }
        } else {
            setAnimating(false);
            const timer = setTimeout(() => setRender(false), 300);
            return () => clearTimeout(timer);
        }
    }, [visible, initialBank, banks]);

    // 处理点击确认
    const handleConfirm = () => {
        if (selectedBank) {
            onConfirm(selectedBank);
        }
    };

    if (!render) return null;

    return (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
            {/* 遮罩层 */}
            <div
                className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${animating ? 'opacity-100' : 'opacity-0'
                    }`}
                onClick={onClose}
            />

            {/* 内容区域 */}
            <div
                className={`relative bg-white rounded-t-2xl w-full max-h-[70vh] flex flex-col transition-transform duration-300 ease-out ${animating ? 'translate-y-0' : 'translate-y-full'
                    }`}
            >
                {/* 标题栏 */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <button
                        onClick={onClose}
                        className="text-gray-400 p-1 active:bg-gray-50 rounded-full"
                    >
                        <X size={20} />
                    </button>
                    <span className="text-base font-bold text-gray-800">选择银行</span>
                    <button
                        onClick={handleConfirm}
                        className="text-orange-600 font-medium text-sm p-1 active:opacity-70"
                    >
                        确定
                    </button>
                </div>

                {/* 滚动选择区域 */}
                <div className="flex-1 overflow-y-auto min-h-[300px] overscroll-contain bg-white pb-safe">
                    {banks.map(bank => (
                        <div
                            key={bank}
                            onClick={() => setSelectedBank(bank)}
                            className={`px-5 py-3.5 text-sm flex items-center justify-between cursor-pointer border-b border-gray-50 active:bg-gray-50 transition-colors ${bank === selectedBank
                                    ? 'text-orange-600 font-medium bg-orange-50/20'
                                    : 'text-gray-700'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <Building2 size={18} className={bank === selectedBank ? 'text-orange-500' : 'text-gray-300'} />
                                <span>{bank}</span>
                            </div>
                            {bank === selectedBank && <Check size={18} className="text-orange-500" />}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BankPicker;
