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
import { ShieldCheck, CreditCard, User, Image as ImageIcon, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import { LoadingSpinner } from '../../components/common';
import {
  AUTH_TOKEN_KEY,
  fetchRealNameStatus,
  RealNameStatusData,
  submitRealName,
  uploadImage,
} from '../../services/api';
import { formatIdCard } from '../../utils/format';

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
          {/* 已认证状态 */}
          {isAuthed && (
            <div className="flex flex-col items-center pt-8 pb-8">
              <CheckCircle size={64} className="text-orange-500 mb-4" />
              <h2 className="text-xl font-bold text-gray-800 mb-2">已完成实名认证</h2>
              <p className="text-sm text-gray-500 mb-8 text-center max-w-[240px]">
                您的身份信息已通过审核，现在可以享受平台的全部服务
              </p>

              <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                  <span className="text-sm text-gray-500">真实姓名</span>
                  <span className="text-sm font-bold text-gray-800">{status?.real_name || realName}</span>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <span className="text-sm text-gray-500">身份证号</span>
                  <span className="text-sm font-bold text-gray-800">{formatIdCard(status?.id_card || idCard)}</span>
                </div>
              </div>
            </div>
          )}

          {/* 待审核状态 */}
          {isPending && (
            <div className="flex flex-col items-center pt-8 pb-8">
              <Clock size={64} className="text-orange-400 mb-4" />
              <h2 className="text-xl font-bold text-gray-800 mb-2">实名认证审核中</h2>
              <p className="text-sm text-gray-500 mb-8 text-center max-w-[240px]">
                您的资料已提交，工作人员正在加急审核中，请您耐心等待
              </p>

              <div className="w-full bg-white rounded-xl shadow-sm border border-orange-100 bg-orange-50/30 overflow-hidden">
                <div className="p-4 flex items-start gap-3">
                  <AlertCircle size={18} className="text-orange-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-orange-700 leading-5">
                    审核通常在1-3个工作日内完成。审核结果将通过站内消息通知您，请留意查看。
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 表单区域 */}
          {!isAuthed && !isPending && (
            <>
              {/* 状态提示banner */}
              {status?.audit_reason ? (
                <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg p-3 mb-4 flex gap-2">
                  <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-bold mb-1">审核未通过</div>
                    <div className="text-xs">{status.audit_reason}</div>
                  </div>
                </div>
              ) : (
                <div className="bg-orange-50 border border-orange-100 text-orange-700 text-xs rounded-lg p-3 mb-4">
                  根据国家相关法规要求，为了保障您的账户安全，使用相关服务前请先完成实名认证。
                </div>
              )}

              {/* 基本信息 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-4">
                <div className="px-4 py-3 border-b border-gray-50 flex items-center">
                  <span className="w-20 text-sm text-gray-600">真实姓名</span>
                  <input
                    type="text"
                    value={realName}
                    onChange={(e) => setRealName(e.target.value)}
                    placeholder="请输入身份证上的姓名"
                    className="flex-1 text-sm text-gray-900 outline-none bg-transparent placeholder:text-gray-400 text-right"
                  />
                </div>
                <div className="px-4 py-3 flex items-center">
                  <span className="w-20 text-sm text-gray-600">身份证号</span>
                  <input
                    type="text"
                    value={idCard}
                    onChange={(e) => setIdCard(e.target.value)}
                    placeholder="请输入身份证号码"
                    className="flex-1 text-sm text-gray-900 outline-none bg-transparent placeholder:text-gray-400 text-right"
                  />
                </div>
              </div>

              {/* 身份证上传 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6 p-4">
                <div className="text-sm font-bold text-gray-800 mb-3">上传身份证照片</div>
                <div className="grid grid-cols-2 gap-3">
                  {/* 人像面 */}
                  <label className="border border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center h-32 text-xs text-gray-400 active:bg-gray-50 transition-colors cursor-pointer relative overflow-hidden bg-gray-50/50">
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
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <>
                        <ImageIcon size={24} className="mb-2 text-gray-300" />
                        <span className="text-gray-500">人像面</span>
                      </>
                    )}
                    {uploadingFront && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                        <LoadingSpinner size={20} />
                      </div>
                    )}
                  </label>

                  {/* 国徽面 */}
                  <label className="border border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center h-32 text-xs text-gray-400 active:bg-gray-50 transition-colors cursor-pointer relative overflow-hidden bg-gray-50/50">
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
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <>
                        <ImageIcon size={24} className="mb-2 text-gray-300" />
                        <span className="text-gray-500">国徽面</span>
                      </>
                    )}
                    {uploadingBack && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                        <LoadingSpinner size={20} />
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* 提交按钮 */}
              <button
                className="w-full bg-orange-600 text-white text-base font-semibold py-3.5 rounded-full shadow-lg shadow-orange-200 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none"
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
      <div className="mt-auto pt-8 text-center pb-6">
        <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 mb-1">
          <ShieldCheck size={12} />
          <span>信息安全加密存储</span>
        </div>
        <p className="text-[10px] text-gray-300 px-8 leading-4">
          由于监管要求，您的身份信息仅用于合规认证，平台承诺严格保密，不会向任何无关第三方泄露。
        </p>
      </div>
    </PageContainer>
  );
};

export default RealNameAuth;
