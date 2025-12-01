import React, { useEffect, useState } from 'react';
import SubPageLayout from '../components/SubPageLayout';
import GridShowcase from '../components/GridShowcase';
import { normalizeAssetUrl, fetchShopProducts, ShopProductItem } from '../services/api';

interface MasterpieceShowcaseProps {
  onBack: () => void;
}

const MasterpieceShowcase: React.FC<MasterpieceShowcaseProps> = ({ onBack }) => {
  const [items, setItems] = useState<ShopProductItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetchShopProducts({ page: 1, limit: 20 });
        if (!isMounted) return;
        const list = res.data?.list ?? [];
        // 这里可以按需筛选“佳作”，暂时简单取前若干
        setItems(list.slice(0, 12));
      } catch (e) {
        console.error('加载佳作鉴赏列表失败:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const gridItems = items.map((product) => ({
    id: String(product.id),
    image: normalizeAssetUrl(product.thumbnail),
    title: product.name,
  }));

  return (
    <SubPageLayout title="佳作鉴赏" onBack={onBack}>
      {loading ? (
        <div className="text-center text-xs text-gray-400 py-8">加载中...</div>
      ) : (
        <GridShowcase items={gridItems} aspectRatio="portrait" />
      )}
    </SubPageLayout>
  );
};

export default MasterpieceShowcase;