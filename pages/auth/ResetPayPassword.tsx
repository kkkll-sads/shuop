/**
 * ResetPayPassword - 修改支付密码页面
 * 
 * 使用 PasswordForm 业务组件重构
 * 
 * @author 树交所前端团队
 * @version 2.0.0
 */

import React from 'react';
import { PasswordForm } from '../../components/business';

/**
 * ResetPayPassword 组件属性接口
 */
interface ResetPayPasswordProps {
  /** 返回回调 */
  onBack: () => void;
}

/**
 * ResetPayPassword 修改支付密码页面组件
 */
const ResetPayPassword: React.FC<ResetPayPasswordProps> = ({ onBack }) => {
  return (
    <PasswordForm
      type="reset_pay"
      title="修改支付密码"
      onBack={onBack}
    />
  );
};

export default ResetPayPassword;
