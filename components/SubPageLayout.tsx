import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface SubPageLayoutProps {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
  rightAction?: React.ReactNode;
  bgColor?: string;
}

const SubPageLayout: React.FC<SubPageLayoutProps> = ({ 
  title, 
  onBack, 
  children, 
  rightAction,
  bgColor = "bg-gray-50" 
}) => {
  return (
    <div className={`min-h-screen ${bgColor} pb-safe`}>
      <header className="bg-white px-4 py-3 flex items-center sticky top-0 z-30 shadow-sm">
        <button 
          onClick={onBack} 
          className="absolute left-4 p-1 text-gray-600 active:bg-gray-100 rounded-full"
        >
            <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-gray-800 w-full text-center">{title}</h1>
        {rightAction && <div className="absolute right-4">{rightAction}</div>}
      </header>
      
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
};

export default SubPageLayout;