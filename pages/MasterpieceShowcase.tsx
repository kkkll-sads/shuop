import React from 'react';
import SubPageLayout from '../components/SubPageLayout';
import GridShowcase from '../components/GridShowcase';
import { PRODUCTS } from '../constants';

interface MasterpieceShowcaseProps {
  onBack: () => void;
}

const MasterpieceShowcase: React.FC<MasterpieceShowcaseProps> = ({ onBack }) => {
  // Filter only painting category or use all products
  const paintingProducts = PRODUCTS.filter(p => p.category === 'painting');
  
  const gridItems = paintingProducts.map(product => ({
    id: product.id,
    image: product.image,
    title: product.title,
    // subtitle: product.artist // Optional: show artist name below
  }));

  return (
    <SubPageLayout title="佳作鉴赏" onBack={onBack}>
      <GridShowcase items={gridItems} aspectRatio="portrait" />
    </SubPageLayout>
  );
};

export default MasterpieceShowcase;