/**
 * UserAgreement - 用户协议页面
 * 
 * 使用 StaticContentPage 业务组件重构
 * 
 * @author 树交所前端团队
 * @version 2.0.0
 */

import React from 'react';
import { StaticContentPage } from '../components/business';

/**
 * UserAgreement 组件属性接口
 */
interface UserAgreementProps {
  /** 返回回调 */
  onBack: () => void;
}

/**
 * UserAgreement 用户协议页面组件
 */
const UserAgreement: React.FC<UserAgreementProps> = ({ onBack }) => {
  return (
    <StaticContentPage
      type="user_agreement"
      defaultTitle="用户协议"
      onBack={onBack}
    />
  );
};

export default UserAgreement;
