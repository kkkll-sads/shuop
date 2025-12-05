import React, { useState, useEffect } from 'react';
import { ChevronLeft, Gift, CalendarCheck, Users, Wallet, Info, X, History, ChevronRight as ChevronRightIcon, ChevronLeft as ChevronLeftIcon } from 'lucide-react';
import { 
  fetchPaymentAccountList, 
  PaymentAccountItem, 
  submitWithdraw, 
  AUTH_TOKEN_KEY,
  fetchSignInRules,
  fetchSignInInfo,
  doSignIn,
  getSignInRecords,
  fetchSignInProgress,
  fetchPromotionCard,
  SignInRulesData,
  SignInInfoData,
  SignInRecordItem,
  SignInProgressData
} from '../services/api';

interface SignInProps {
    onBack: () => void;
    onNavigate?: (page: string) => void;
}

const SignIn: React.FC<SignInProps> = ({ onBack, onNavigate }) => {
    const [balance, setBalance] = useState<number>(0);
    const [hasSignedIn, setHasSignedIn] = useState<boolean>(false);
    const [showRedPacket, setShowRedPacket] = useState<boolean>(false);
    const [showCalendar, setShowCalendar] = useState<boolean>(false);
    const [redPacketAmount, setRedPacketAmount] = useState<number>(0);
    const [inviteCount, setInviteCount] = useState<number>(0);
    const [signedInDates, setSignedInDates] = useState<string[]>([]);
    const [activityInfo, setActivityInfo] = useState<SignInRulesData | null>(null);
    const [progressInfo, setProgressInfo] = useState<SignInProgressData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // Withdrawal State
    const [showAccountModal, setShowAccountModal] = useState<boolean>(false);
    const [accounts, setAccounts] = useState<PaymentAccountItem[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<PaymentAccountItem | null>(null);
    const [loadingAccounts, setLoadingAccounts] = useState<boolean>(false);
    const [payPassword, setPayPassword] = useState<string>('');
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [withdrawError, setWithdrawError] = useState<string | null>(null);

    // Calendar state
    const [currentDate, setCurrentDate] = useState(new Date());

    // Load data from API
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const token = localStorage.getItem(AUTH_TOKEN_KEY);
            
            try {
                // Load activity rules (no token required)
                const rulesRes = await fetchSignInRules();
                if (rulesRes.code === 0 && rulesRes.data) {
                    setActivityInfo(rulesRes.data);
                }

                // Load sign-in info (requires token)
                if (token) {
                    const [infoRes, progressRes, promotionRes] = await Promise.all([
                        fetchSignInInfo(token),
                        fetchSignInProgress(token),
                        fetchPromotionCard(token).catch(() => ({ code: -1, data: null })) // 如果失败不影响其他数据加载
                    ]);
                    
                    if (infoRes.code === 0 && infoRes.data) {
                        const data = infoRes.data;
                        setBalance(data.total_reward || 0);
                        setHasSignedIn(data.today_signed || false);
                        
                        // Convert signed dates from YYYY-MM-DD to DateString format for calendar
                        // Store both formats for compatibility
                        const dates = data.calendar?.signed_dates?.map((dateStr: string) => {
                            try {
                                const date = new Date(dateStr);
                                if (!isNaN(date.getTime())) {
                                    return date.toDateString();
                                }
                                return dateStr; // Fallback to original format
                            } catch {
                                return dateStr;
                            }
                        }) || [];
                        setSignedInDates(dates);
                    }
                    
                    if (progressRes.code === 0 && progressRes.data) {
                        console.log('进度数据:', progressRes.data);
                        setProgressInfo(progressRes.data);
                        // Update balance from progress if available (more accurate)
                        if (progressRes.data.total_money !== undefined) {
                            setBalance(progressRes.data.total_money);
                        }
                    } else {
                        console.warn('进度接口返回异常:', progressRes);
                    }

                    // Load invite count from promotion card
                    if (promotionRes.code === 0 && promotionRes.data) {
                        setInviteCount(promotionRes.data.team_count || 0);
                    }
                }
            } catch (error: any) {
                console.error('加载签到数据失败:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const handleSignIn = async () => {
        if (hasSignedIn) {
            setShowCalendar(true);
            return;
        }

        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        if (!token) {
            alert('请先登录');
            return;
        }

        try {
            const res = await doSignIn(token);
            if (res.code === 0 && res.data) {
                const data = res.data;
                const rewardAmount = data.daily_reward || 0;
                
                setRedPacketAmount(rewardAmount);
                setShowRedPacket(true);
                setBalance(data.total_reward || 0);
                setHasSignedIn(true);

                // Update signed dates
                const dates = data.calendar?.signed_dates?.map((dateStr: string) => {
                    try {
                        const date = new Date(dateStr);
                        if (!isNaN(date.getTime())) {
                            return date.toDateString();
                        }
                        return dateStr; // Fallback to original format
                    } catch {
                        return dateStr;
                    }
                }) || [];
                setSignedInDates(dates);
                
                // Refresh progress info after sign in
                const token = localStorage.getItem(AUTH_TOKEN_KEY);
                if (token) {
                    try {
                        const progressRes = await fetchSignInProgress(token);
                        if (progressRes.code === 0 && progressRes.data) {
                            setProgressInfo(progressRes.data);
                            if (progressRes.data.total_money !== undefined) {
                                setBalance(progressRes.data.total_money);
                            }
                        }
                    } catch (error) {
                        console.error('刷新进度信息失败:', error);
                    }
                }
            } else {
                alert(res.msg || '签到失败，请重试');
            }
        } catch (error: any) {
            console.error('签到失败:', error);
            alert(error?.msg || error?.message || '签到失败，请重试');
        }
    };

    const handleInvite = () => {
        if (onNavigate) {
            onNavigate('invite-friends');
        }
    };

    const loadAccounts = async () => {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        if (!token) {
            setWithdrawError('未检测到登录信息，请重新登录');
            return;
        }

        setLoadingAccounts(true);
        setWithdrawError(null);
        try {
            const res = await fetchPaymentAccountList(token);
            if (res.code === 1 && res.data?.list) {
                setAccounts(res.data.list || []);
                // Default select the first account if available
                if (res.data.list.length > 0) {
                    // Try to find default account
                    const defaultAccount = res.data.list.find((acc: any) => Number(acc.is_default) === 1);
                    setSelectedAccount(defaultAccount || res.data.list[0]);
                }
            } else {
                setWithdrawError(res.msg || '获取收款账户信息失败');
            }
        } catch (e: any) {
            setWithdrawError(e?.msg || '获取收款账户信息失败');
        } finally {
            setLoadingAccounts(false);
        }
    };

    const handleWithdrawClick = () => {
        const minAmount = progressInfo?.withdraw_min_amount || activityInfo?.activity?.withdraw_min_amount || 10;
        const canWithdraw = progressInfo?.can_withdraw ?? (balance >= minAmount);
        
        if (!canWithdraw) {
            alert(`余额不足 ${minAmount.toFixed(2)} 元，暂不可提现`);
            return;
        }
        setShowAccountModal(true);
        loadAccounts();
    };

    const handleConfirmWithdraw = async () => {
        if (!selectedAccount) {
            setWithdrawError('请选择收款账户');
            return;
        }
        if (!payPassword) {
            setWithdrawError('请输入支付密码');
            return;
        }

        setSubmitting(true);
        setWithdrawError(null);

        try {
            const res = await submitWithdraw({
                amount: balance, // Withdraw all
                payment_account_id: selectedAccount.id as number,
                pay_password: payPassword,
                remark: '签到活动提现'
            });

            if (res.code === 1 || res.code === 0) {
                alert('提现申请提交成功，请等待审核');
                setShowAccountModal(false);
                setPayPassword('');
                // Refresh balance and progress from API
                const token = localStorage.getItem(AUTH_TOKEN_KEY);
                if (token) {
                    try {
                        const [infoRes, progressRes] = await Promise.all([
                            fetchSignInInfo(token),
                            fetchSignInProgress(token)
                        ]);
                        
                        if (infoRes.code === 0 && infoRes.data) {
                            setBalance(infoRes.data.total_reward || 0);
                        }
                        
                        if (progressRes.code === 0 && progressRes.data) {
                            setProgressInfo(progressRes.data);
                            if (progressRes.data.total_money !== undefined) {
                                setBalance(progressRes.data.total_money);
                            }
                        }
                    } catch (error) {
                        console.error('刷新数据失败:', error);
                    }
                }
            } else {
                setWithdrawError(res.msg || '提交失败，请重试');
            }
        } catch (e: any) {
            setWithdrawError(e?.msg || e?.message || '提交失败，请重试');
        } finally {
            setSubmitting(false);
        }
    };

    // Calendar Logic
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
        return { days, firstDay };
    };

    const renderCalendar = () => {
        const { days, firstDay } = getDaysInMonth(currentDate);
        const monthNames = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();

        const grid = [];
        // Empty cells for padding
        for (let i = 0; i < firstDay; i++) {
            grid.push(<div key={`empty-${i}`} className="h-10"></div>);
        }

        // Days
        for (let day = 1; day <= days; day++) {
            const date = new Date(currentYear, currentMonth, day);
            const dateStr = date.toDateString();
            // Check if this date is signed in
            const isSigned = signedInDates.some(signedDate => {
                try {
                    // Handle both DateString format and YYYY-MM-DD format
                    const signed = signedDate.includes('-') ? new Date(signedDate) : new Date(signedDate);
                    return signed.getFullYear() === currentYear &&
                           signed.getMonth() === currentMonth &&
                           signed.getDate() === day;
                } catch {
                    return false;
                }
            });
            const isToday = dateStr === new Date().toDateString();

            grid.push(
                <div key={day} className="h-10 flex items-center justify-center relative">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
            ${isSigned ? 'bg-red-500 text-white shadow-md' : isToday ? 'border border-red-500 text-red-500' : 'text-gray-700'}
          `}>
                        {day}
                    </div>
                    {isSigned && (
                        <div className="absolute -bottom-1 text-[10px] text-red-500 font-bold">✓</div>
                    )}
                </div>
            );
        }

        return (
            <div className="bg-white rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={() => setCurrentDate(new Date(currentYear, currentMonth - 1, 1))} className="p-1 hover:bg-gray-100 rounded">
                        <ChevronLeftIcon size={20} className="text-gray-500" />
                    </button>
                    <div className="font-bold text-lg text-gray-800">{currentYear}年 {monthNames[currentMonth]}</div>
                    <button onClick={() => setCurrentDate(new Date(currentYear, currentMonth + 1, 1))} className="p-1 hover:bg-gray-100 rounded">
                        <ChevronRightIcon size={20} className="text-gray-500" />
                    </button>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs text-gray-400 font-medium">
                    <div>日</div><div>一</div><div>二</div><div>三</div><div>四</div><div>五</div><div>六</div>
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {grid}
                </div>
                <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span>已签到</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full border border-red-500"></div>
                        <span>今天</span>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-red-50 pb-safe flex items-center justify-center">
                <div className="text-center">
                    <div className="text-gray-500">加载中...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-red-50 pb-safe">
            {/* Custom Header */}
            <div className="relative bg-gradient-to-b from-red-600 to-red-500 text-white pb-24">
                <div className="flex items-center px-4 py-3">
                    <button onClick={onBack} className="p-1 -ml-2">
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="text-lg font-bold flex-1 text-center pr-6">每日签到</h1>
                </div>

                <div className="px-6 pt-4 text-center">
                    <div className="text-xs opacity-80 mb-1">树拍·星火燎原</div>
                    <h2 className="text-2xl font-bold mb-2">
                        {activityInfo?.activity?.name || '共识建设与通道测试活动'}
                    </h2>
                    <div className="mt-2 text-xs opacity-75">
                        活动时间：{activityInfo?.activity?.start_time 
                            ? new Date(activityInfo.activity.start_time).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
                            : '2025.11.29'} - {activityInfo?.activity?.end_time 
                            ? new Date(activityInfo.activity.end_time).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
                            : '2025.12.04'}
                    </div>
                </div>
            </div>

            <div className="px-4 -mt-20 relative z-10 space-y-4">
                {/* Balance Card */}
                <div className="bg-white rounded-xl p-6 shadow-lg text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-bl-lg">
                        已邀请 {inviteCount} 人
                    </div>
                    <div className="text-gray-500 text-sm mb-2">当前累计奖励 (元)</div>
                    <div className="text-4xl font-bold text-red-600 mb-6">{balance.toFixed(2)}</div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={handleSignIn}
                            className={`flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-all ${hasSignedIn
                                ? 'bg-red-50 text-red-600 border border-red-200'
                                : 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md active:scale-95'
                                }`}
                        >
                            {hasSignedIn ? <History size={18} /> : <CalendarCheck size={18} />}
                            {hasSignedIn ? '签到记录' : '每日签到'}
                        </button>
                        <button
                            onClick={handleInvite}
                            className="flex items-center justify-center gap-2 bg-red-50 text-red-600 py-3 rounded-lg font-bold text-sm border border-red-100 active:bg-red-100 transition-all"
                        >
                            <Users size={18} />
                            邀请好友
                        </button>
                    </div>
                </div>

                {/* Withdraw Section */}
                <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 font-bold text-gray-800">
                            <Wallet className="text-orange-500" size={20} />
                            <span>提现申请</span>
                        </div>
                        <span className="text-xs text-gray-400">T+1 到账</span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-500">当前余额</span>
                            <span className="font-bold text-red-600">{(progressInfo?.total_money ?? balance).toFixed(2)} 元</span>
                        </div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-500">提现门槛</span>
                            <span className="font-medium">{(progressInfo?.withdraw_min_amount || activityInfo?.activity?.withdraw_min_amount || 10).toFixed(2)} 元</span>
                        </div>
                        {(() => {
                            // Use progress data from API if available, otherwise calculate
                            const currentBalance = progressInfo?.total_money ?? balance;
                            const minAmount = progressInfo?.withdraw_min_amount || activityInfo?.activity?.withdraw_min_amount || 10;
                            
                            // Calculate progress: use API progress if it's a valid number (> 0 or explicitly 0 with balance > 0), otherwise calculate
                            let progress: number;
                            if (progressInfo && typeof progressInfo.progress === 'number') {
                                // If API returns progress but it's 0 while we have balance, recalculate
                                if (progressInfo.progress === 0 && currentBalance > 0) {
                                    progress = Math.min((currentBalance / minAmount) * 100, 100);
                                } else {
                                    progress = progressInfo.progress;
                                }
                            } else {
                                // Calculate from balance
                                progress = Math.min((currentBalance / minAmount) * 100, 100);
                            }
                            
                            // Use API remaining if available, otherwise calculate
                            const remaining = progressInfo && typeof progressInfo.remaining_amount === 'number'
                                ? progressInfo.remaining_amount
                                : Math.max(minAmount - currentBalance, 0);
                            
                            return (
                                <>
                                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                                        <div
                                            className="bg-green-500 h-full transition-all duration-500"
                                            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between items-center mt-1">
                                        <div className="text-xs text-gray-400">
                                            进度: {progress.toFixed(0)}%
                                        </div>
                                        {remaining > 0 && (
                                            <div className="text-xs text-gray-500">
                                                还差 {remaining.toFixed(2)} 元
                                            </div>
                                        )}
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                    <button
                        onClick={handleWithdrawClick}
                        disabled={!(progressInfo?.can_withdraw ?? false)}
                        className={`w-full py-3 rounded-lg font-medium text-sm active:opacity-90 ${
                            !(progressInfo?.can_withdraw ?? false)
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-gray-900 text-white'
                        }`}
                    >
                        申请提现
                    </button>
                </div>

                {/* Rules Section */}
                <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 font-bold text-gray-800 mb-3">
                        <Info className="text-blue-500" size={20} />
                        <span>活动规则</span>
                    </div>
                    <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                        {activityInfo?.rules?.map((rule, index) => (
                            <div key={index} className="flex gap-2">
                                <span className={`text-xs px-1.5 py-0.5 rounded shrink-0 h-fit mt-0.5 ${
                                    rule.key === 'daily_reward' || rule.key === 'register_reward' || rule.key === 'invite_reward'
                                        ? 'bg-red-100 text-red-600'
                                        : 'bg-blue-100 text-blue-600'
                                }`}>
                                    {rule.title}
                                </span>
                                <div>
                                    <p>{rule.description}</p>
                                </div>
                            </div>
                        ))}
                        {!activityInfo?.rules && (
                            <>
                                <div className="flex gap-2">
                                    <span className="bg-red-100 text-red-600 text-xs px-1.5 py-0.5 rounded shrink-0 h-fit mt-0.5">奖励</span>
                                    <div>
                                        <p>• 注册激活：<span className="text-red-500 font-bold">2.88 元</span></p>
                                        <p>• 每日签到：<span className="text-red-500 font-bold">0.2 ~ 0.5 元</span> (随机红包)</p>
                                        <p>• 邀请好友：<span className="text-red-500 font-bold">1.5 ~ 2.0 元/人</span></p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <span className="bg-blue-100 text-blue-600 text-xs px-1.5 py-0.5 rounded shrink-0 h-fit mt-0.5">提现</span>
                                    <div>
                                        <p>• 账户余额满 <span className="font-bold">10.00 元</span> 可申请提现。</p>
                                        <p>• 每日限提现 1 次， T+1 到账。</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Red Packet Modal */}
            {showRedPacket && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-in fade-in duration-200">
                    <div className="bg-red-500 w-72 rounded-2xl p-6 text-center relative shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setShowRedPacket(false)}
                            className="absolute top-2 right-2 text-white/60 hover:text-white"
                        >
                            <X size={24} />
                        </button>
                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                            <Gift size={32} className="text-red-500" />
                        </div>
                        <h3 className="text-yellow-100 text-lg font-bold mb-1">恭喜获得</h3>
                        <div className="text-4xl font-bold text-white mb-2">{redPacketAmount.toFixed(2)} <span className="text-lg">元</span></div>
                        <p className="text-white/80 text-sm mb-6">已存入您的活动账户</p>
                        <button
                            onClick={() => setShowRedPacket(false)}
                            className="w-full bg-yellow-400 text-red-600 font-bold py-3 rounded-xl shadow-lg active:scale-95 transition-transform"
                        >
                            开心收下
                        </button>
                    </div>
                </div>
            )}

            {/* Calendar Modal */}
            {showCalendar && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-in fade-in duration-200 p-4">
                    <div className="bg-white w-full max-w-sm rounded-2xl p-4 relative shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setShowCalendar(false)}
                            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 z-10"
                        >
                            <X size={24} />
                        </button>
                        <h3 className="text-center font-bold text-lg mb-2">签到记录</h3>
                        {renderCalendar()}
                    </div>
                </div>
            )}

            {/* Withdrawal Account Modal */}
            {showAccountModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-in fade-in duration-200 p-4">
                    <div className="bg-white w-full max-w-sm rounded-2xl p-6 relative shadow-2xl scale-100 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setShowAccountModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
                        >
                            <X size={24} />
                        </button>
                        <h3 className="text-center font-bold text-lg mb-6">确认提现</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">提现金额 (全部)</label>
                                <div className="text-2xl font-bold text-gray-900">¥ {balance.toFixed(2)}</div>
                            </div>

                            <div>
                                <label className="block text-xs text-gray-500 mb-2">收款账户</label>
                                {loadingAccounts ? (
                                    <div className="text-center py-4 text-gray-400 text-sm">加载账户中...</div>
                                ) : accounts.length === 0 ? (
                                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                                        <p className="text-gray-500 text-sm mb-2">暂无收款账户</p>
                                        {onNavigate && (
                                            <button
                                                onClick={() => {
                                                    setShowAccountModal(false);
                                                    onNavigate('cardManagement');
                                                }}
                                                className="text-orange-600 text-sm font-medium"
                                            >
                                                去添加账户
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {accounts.map(acc => (
                                            <div
                                                key={acc.id}
                                                onClick={() => setSelectedAccount(acc)}
                                                className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedAccount?.id === acc.id
                                                    ? 'border-orange-500 bg-orange-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-medium text-sm">{acc.account_name}</span>
                                                    <span className="text-xs text-gray-500">{acc.type_text}</span>
                                                </div>
                                                <div className="text-xs text-gray-400">{acc.account}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs text-gray-500 mb-1">支付密码</label>
                                <input
                                    type="password"
                                    value={payPassword}
                                    onChange={(e) => setPayPassword(e.target.value)}
                                    placeholder="请输入支付密码"
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-500 transition-colors"
                                />
                            </div>

                            {withdrawError && (
                                <div className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded">
                                    {withdrawError}
                                </div>
                            )}

                            <button
                                onClick={handleConfirmWithdraw}
                                disabled={submitting || !selectedAccount || !payPassword}
                                className={`w-full py-3 rounded-xl font-bold text-white transition-all ${submitting || !selectedAccount || !payPassword
                                    ? 'bg-gray-300 cursor-not-allowed'
                                    : 'bg-orange-600 active:bg-orange-700 shadow-lg active:scale-95'
                                    }`}
                            >
                                {submitting ? '提交中...' : '确认提现'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SignIn;
