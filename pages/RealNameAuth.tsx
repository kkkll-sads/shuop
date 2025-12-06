/**
 * RealNameAuth - 实名认证页面
 * 
 * 使用 PageContainer、LoadingSpinner 组件重构
 * 使用 formatIdCard 工具函数
 * 
 * @author 树交所前端团队
 * @version 2.0.0
 */

import React, { useEffect, useState } from 'react';
import { ShieldCheck, CreditCard, User, Image as ImageIcon } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import { LoadingSpinner } from '../components/common';
import {
  AUTH_TOKEN_KEY,
  fetchRealNameStatus,
  RealNameStatusData,
  submitRealName,
  uploadImage,
} from '../services/api';
import { formatIdCard } from '../utils/format';

/**
 * RealNameAuth 组件属性接口
 */
interface RealNameAuthProps {
  onBack: () => void;
}

/**
 * RealNameAuth 实名认证页面组件
 */
const RealNameAuth: React.FC<RealNameAuthProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);

  const [status, setStatus] = useState<RealNameStatusData | null>(null);

  const [realName, setRealName] = useState('');
  const [idCard, setIdCard] = useState('');
  const [idCardFront, setIdCardFront] = useState('');
  const [idCardBack, setIdCardBack] = useState('');
  const [idCardFrontPreview, setIdCardFrontPreview] = useState('');
  const [idCardBackPreview, setIdCardBackPreview] = useState('');

  const [error, setError] = useState<string | null>(null);

  // 状态判断
  const isAuthed = status?.real_name_status === 2;
  const isPending = status?.real_name_status === 1;

  // 加载实名认证状态
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem(AUTH_TOKEN_KEY) || '';
      if (!token) {
        setError('未找到登录信息，请先登录');
        setLoading(false);
        return;
      }

      try {
        const res = await fetchRealNameStatus(token);
        if (res.code === 1 || typeof res.code === 'undefined') {
          const data = res.data as RealNameStatusData;
          setStatus(data);

          if (data) {
            setRealName(data.real_name || '');
            setIdCard(data.id_card || '');
            setIdCardFront(data.id_card_front || '');
            setIdCardBack(data.id_card_back || '');
            setIdCardFrontPreview(data.id_card_front || '');
            setIdCardBackPreview(data.id_card_back || '');
          }
        } else {
          setError(res.msg || '获取实名认证状态失败');
        }
      } catch (e: any) {
        console.error('获取实名认证状态异常:', e);
        setError(e?.msg || e?.response?.msg || e?.message || '获取实名认证状态失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  /**
   * 处理图片上传
   */
  const handleUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'front' | 'back'
  ) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    try {
      if (type === 'front') {
        setUploadingFront(true);
      } else {
        setUploadingBack(true);
      }

      const res = await uploadImage(file);
      const data = res.data || {};
      const path = data.url || data.path || data.filepath || '';
      const fullUrl = data.fullurl || data.fullUrl || data.url || path;

      if (!path && !fullUrl) {
        throw new Error('上传失败，返回数据为空');
      }

      if (type === 'front') {
        setIdCardFront(path || fullUrl);
        setIdCardFrontPreview(fullUrl || path);
      } else {
        setIdCardBack(path || fullUrl);
        setIdCardBackPreview(fullUrl || path);
      }
    } catch (e: any) {
      console.error('身份证图片上传失败:', e);
      const errorMsg = e?.msg || e?.response?.msg || e?.message || '图片上传失败，请稍后重试';
      alert(errorMsg);
    } finally {
      if (type === 'front') {
        setUploadingFront(false);
      } else {
        setUploadingBack(false);
      }
    }
  };

  /**
   * 处理提交
   */
  const handleSubmit = async () => {
    if (submitting) return;

    try {
      setSubmitting(true);
      setError(null);

      const token = localStorage.getItem(AUTH_TOKEN_KEY) || '';
      const res = await submitRealName({
        real_name: realName,
        id_card: idCard,
        id_card_front: idCardFront,
        id_card_back: idCardBack,
        token,
      });

      const success = res?.code === 1 || typeof res?.code === 'undefined';
      const message = res?.msg || (success ? '提交成功，请等待审核' : '提交实名认证失败，请稍后重试');
      alert(message);

      if (!success) return;

      // 刷新状态
      try {
        const res = await fetchRealNameStatus(token);
        if (res.code === 1 || typeof res.code === 'undefined') {
          setStatus(res.data as RealNameStatusData);
        }
      } catch (e) {
        console.warn('刷新实名认证状态失败:', e);
      }
    } catch (e: any) {
      console.error('提交实名认证失败:', e);
      const errorMsg = e?.msg || e?.response?.msg || e?.message || '提交实名认证失败，请稍后重试';
      alert(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer title="实名认证" onBack={onBack}>
      {/* 加载状态 */}
      {loading && <LoadingSpinner text="正在加载实名认证信息..." />}

      {/* 错误提示 */}
      {!loading && error && (
        <div className="bg-red-50 border border-red-100 text-red-500 text-xs rounded-lg px-3 py-2 mb-4">
          {error}
        </div>
      )}

      {/* 内容区域 */}
      {!loading && !error && (
        <>
          {/* 状态卡片 */}
          <div
            className={`rounded-2xl p-6 text-white shadow-lg mb-6 flex items-center justify-between ${isAuthed
                ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                : isPending
                  ? 'bg-gradient-to-r from-orange-300 to-orange-400'
                  : 'bg-gradient-to-r from-orange-400 to-orange-500'
              }`}
          >
            <div>
              <h2 className="text-2xl font-bold mb-1">
                {isAuthed
                  ? '已认证'
                  : isPending
                    ? '待审核'
                    : status?.real_name_status_text || '未实名'}
              </h2>
              <p className="text-white/90 text-sm opacity-90">
                {isAuthed
                  ? '您的身份信息已通过审核'
                  : isPending
                    ? '您的实名信息已提交，正在审核中，请耐心等待'
                    : '根据国家监管要求，需完成实名认证后方可使用全部功能'}
              </p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <ShieldCheck size={32} className="text-white" />
            </div>
          </div>

          {/* 已认证/待审核显示信息 */}
          {(isAuthed || isPending) && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-50 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                  <User size={16} />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-400 mb-0.5">真实姓名</div>
                  <div className="text-sm font-bold text-gray-800">
                    {status?.real_name || realName || '已认证用户'}
                  </div>
                </div>
              </div>
              <div className="p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                  <CreditCard size={16} />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-400 mb-0.5">身份证号</div>
                  <div className="text-sm font-bold text-gray-800">
                    {formatIdCard(status?.id_card || idCard)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 表单区域 */}
          {!isAuthed && !isPending && (
            <>
              {/* 基本信息 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-4">
                <div className="px-4 py-3 border-b border-gray-50 flex items-center">
                  <span className="w-20 text-xs text-gray-500">真实姓名</span>
                  <input
                    type="text"
                    value={realName}
                    onChange={(e) => setRealName(e.target.value)}
                    placeholder="请输入身份证上的姓名"
                    className="flex-1 text-sm text-gray-900 outline-none bg-transparent placeholder:text-gray-300"
                  />
                </div>
                <div className="px-4 py-3 flex items-center">
                  <span className="w-20 text-xs text-gray-500">身份证号</span>
                  <input
                    type="text"
                    value={idCard}
                    onChange={(e) => setIdCard(e.target.value)}
                    placeholder="请输入身份证号码"
                    className="flex-1 text-sm text-gray-900 outline-none bg-transparent placeholder:text-gray-300"
                  />
                </div>
              </div>

              {/* 身份证上传 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                <div className="px-4 pt-4 pb-2 text-xs text-gray-500">请上传本人身份证</div>
                <div className="px-4 pb-4 grid grid-cols-2 gap-3">
                  {/* 人像面 */}
                  <label className="border border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center py-6 text-xs text-gray-400 active:bg-gray-50">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleUpload(e, 'front')}
                      disabled={uploadingFront}
                    />
                    {idCardFrontPreview ? (
                      <img
                        src={idCardFrontPreview}
                        alt="身份证人像面"
                        className="w-full h-24 object-cover rounded-md mb-2"
                      />
                    ) : (
                      <ImageIcon size={28} className="mb-2 text-gray-300" />
                    )}
                    <span className="text-gray-700 text-xs mb-0.5">身份证人像面</span>
                    <span className="text-[10px] text-gray-400">
                      {uploadingFront ? '上传中...' : '点击上传'}
                    </span>
                  </label>

                  {/* 国徽面 */}
                  <label className="border border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center py-6 text-xs text-gray-400 active:bg-gray-50">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleUpload(e, 'back')}
                      disabled={uploadingBack}
                    />
                    {idCardBackPreview ? (
                      <img
                        src={idCardBackPreview}
                        alt="身份证国徽面"
                        className="w-full h-24 object-cover rounded-md mb-2"
                      />
                    ) : (
                      <ImageIcon size={28} className="mb-2 text-gray-300" />
                    )}
                    <span className="text-gray-700 text-xs mb-0.5">身份证国徽面</span>
                    <span className="text-[10px] text-gray-400">
                      {uploadingBack ? '上传中...' : '点击上传'}
                    </span>
                  </label>
                </div>
              </div>

              {/* 审核未通过原因 */}
              {status?.audit_reason && (
                <div className="bg-red-50 border border-red-100 text-red-500 text-xs rounded-lg px-3 py-2 mb-3">
                  审核未通过原因：{status.audit_reason}
                </div>
              )}

              {/* 提交按钮 */}
              <button
                className="w-full bg-orange-500 text-white text-sm font-semibold py-3 rounded-md active:opacity-80 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={handleSubmit}
                disabled={submitting || uploadingFront || uploadingBack}
              >
                {submitting ? '提交中...' : '提交实名认证'}
              </button>
            </>
          )}
        </>
      )}

      {/* 底部提示 */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-400 leading-5">
          信息采用加密存储，仅用于平台实名认证及合规监管，不会向无关第三方披露。
          <br />
          如需修改已通过的实名认证信息，请联系平台人工客服处理。
        </p>
      </div>
    </PageContainer>
  );
};

export default RealNameAuth;
