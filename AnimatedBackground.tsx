
import React from 'react';

const AnimatedBackground = () => {
  return (
<div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Orange Blob */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      
      {/* Purple Blob */}
      <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      
      {/* Blue Blob */}
      <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      
      {/* Additional smaller blobs for more visual interest */}
      <div className="absolute top-1/3 left-1/4 w-48 h-48 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-1000"></div>
      <div className="absolute top-2/3 right-1/4 w-56 h-56 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-3000"></div>
      <div className="absolute bottom-1/3 left-1/3 w-40 h-40 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-5000"></div>
    </div>
  );
};

export default AnimatedBackground;
