/**
 * AboutUs - 关于我们/中心介绍页面
 * 
 * 使用 StaticContentPage 业务组件重构
 * 
 * @author 树交所前端团队
 * @version 2.0.0
 */

import React from 'react';
import { StaticContentPage } from '../components/business';

/**
 * AboutUs 组件属性接口
 */
interface AboutUsProps {
  /** 返回回调 */
  onBack: () => void;
}

/**
 * AboutUs 关于我们页面组件
 */
const AboutUs: React.FC<AboutUsProps> = ({ onBack }) => {
  return (
    <StaticContentPage
      type="about_us"
      defaultTitle="中心介绍"
      onBack={onBack}
    />
  );
};

export default AboutUs;