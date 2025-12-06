/**
 * PrivacyPolicy - 隐私政策页面
 * 
 * 使用 StaticContentPage 业务组件重构
 * 
 * @author 树交所前端团队
 * @version 2.0.0
 */

import React from 'react';
import { StaticContentPage } from '../components/business';

/**
 * PrivacyPolicy 组件属性接口
 */
interface PrivacyPolicyProps {
  /** 返回回调 */
  onBack: () => void;
}

/**
 * PrivacyPolicy 隐私政策页面组件
 */
const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  return (
    <StaticContentPage
      type="privacy_policy"
      defaultTitle="隐私政策"
      onBack={onBack}
    />
  );
};

export default PrivacyPolicy;
