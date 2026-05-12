import React from 'react';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const PageWrapper = ({ children, className = "" }: PageWrapperProps) => {
  return (
    <div className={`min-h-screen bg-white relative ${className}`}>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default PageWrapper;
