import React from 'react';
import SubPageLayout from '../components/SubPageLayout';

interface AboutUsProps {
  onBack: () => void;
}

const AboutUs: React.FC<AboutUsProps> = ({ onBack }) => {
  return (
    <SubPageLayout title="中心介绍" onBack={onBack}>
      <div className="p-4 m-4 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="w-full h-40 bg-blue-50 rounded-lg mb-6 flex items-center justify-center">
           <img 
            src="https://picsum.photos/seed/building/800/400" 
            alt="Office" 
            className="w-full h-full object-cover rounded-lg"
           />
        </div>

        <h2 className="text-lg font-bold text-gray-900 mb-3">关于数权中心</h2>
        
        <div className="space-y-4 text-gray-700 text-sm leading-7 text-justify">
            <p>
              数权中心是批准设立的综合性文化产权交易机构。
            </p>
            <p>
              数权中心倾力打造的数字化文化商品交易平台，致力于通过区块链、大数据等先进技术，实现文化资产的数字化确权、流转与价值发现。我们连接艺术家、收藏家与广大文化消费者，构建一个公开、公平、公正的文化要素流通市场。
            </p>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 my-2">
                <h3 className="font-bold text-blue-800 mb-2 text-sm">我们的使命</h3>
                <p className="text-blue-700/80 text-xs leading-5">
                   赋能文化产业，激活文化资产价值，让优秀的文化艺术品走进千家万户。
                </p>
            </div>

            <p>
              平台业务涵盖书画艺术、非遗文创、数字藏品等多个领域，提供从发售、寄售到流转的全链路服务。
            </p>
        </div>
        
        <div className="mt-8 pt-4 border-t border-gray-100 text-center text-xs text-gray-400">
            <p>Copyright © 2025 数权中心. All rights reserved.</p>
            <p className="mt-1">版本 v1.0.2</p>
        </div>
      </div>
    </SubPageLayout>
  );
};

export default AboutUs;