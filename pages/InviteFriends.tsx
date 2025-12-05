import React, { useState } from 'react';
import { ChevronLeft, Copy, Share2, QrCode } from 'lucide-react';
import SubPageLayout from '../components/SubPageLayout';

interface InviteFriendsProps {
    onBack: () => void;
}

const InviteFriends: React.FC<InviteFriendsProps> = ({ onBack }) => {
    const [inviteCode] = useState('888888'); // Mock invite code
    const [inviteLink] = useState('https://cultural-asset.com/register?code=888888'); // Mock link

    const copyToClipboard = async (text: string, type: 'code' | 'link') => {
        try {
            await navigator.clipboard.writeText(text);
            alert(`${type === 'code' ? '邀请码' : '链接'}已复制!`);
        } catch (err) {
            console.error('Failed to copy:', err);
            // Fallback for older browsers or non-secure contexts
            const textArea = document.createElement("textarea");
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                alert(`${type === 'code' ? '邀请码' : '链接'}已复制!`);
            } catch (err) {
                console.error('Fallback copy failed', err);
            }
            document.body.removeChild(textArea);
        }
    };

    return (
        <SubPageLayout title="邀请好友" onBack={onBack} bgColor="bg-gray-50">
            <div className="relative min-h-[80vh] flex flex-col items-center pt-8 px-6">

                {/* Top Gradient Background */}
                <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-[#FFD6A5]/30 to-transparent pointer-events-none" />

                {/* QR Code Section */}
                <div className="relative bg-white p-8 rounded-3xl shadow-xl flex flex-col items-center w-full max-w-xs mb-8 z-10 border border-orange-100">
                    <div className="w-56 h-56 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 overflow-hidden p-2">
                        <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(inviteLink)}`}
                            alt="邀请二维码"
                            className="w-full h-full object-cover rounded-xl mix-blend-multiply"
                        />
                    </div>
                    <p className="text-gray-500 text-sm text-center font-medium">
                        扫码注册，加入我们
                    </p>
                </div>
                <div className="w-full max-w-xs mb-10 z-10">
                    <div className="text-sm text-gray-500 mb-3 font-medium ml-2">我的邀请码</div>
                    <div
                        onClick={() => copyToClipboard(inviteCode, 'code')}
                        className="bg-white border border-orange-200 rounded-2xl p-5 flex items-center justify-between active:bg-orange-50 transition-all cursor-pointer shadow-sm hover:shadow-md"
                    >
                        <span className="text-3xl font-bold text-gray-800 tracking-widest font-mono">{inviteCode}</span>
                        <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                            <Copy size={22} />
                        </div>
                    </div>
                </div>

                {/* Share Button */}
                <button
                    onClick={() => copyToClipboard(inviteLink, 'link')}
                    className="w-full max-w-xs bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-orange-200 flex items-center justify-center gap-3 active:scale-95 transition-transform z-10"
                >
                    <Share2 size={22} />
                    <span>分享链接</span>
                </button>

            </div>
        </SubPageLayout>
    );
};

export default InviteFriends;
