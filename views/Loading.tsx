import React from 'react';

interface LoadingProps {
  status: string;
  progress: number;
}

const Loading: React.FC<LoadingProps> = ({ status, progress }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <div className="w-32 h-32 mb-8 relative">
        <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
        <div 
          className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"
        ></div>
        <div className="absolute inset-0 flex items-center justify-center text-4xl">
          🎨
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-gray-800 mb-2 animate-pulse">{status}</h2>
      
      <div className="w-full max-w-md bg-gray-200 rounded-full h-4 mb-4 overflow-hidden">
        <div 
          className="bg-blue-500 h-4 rounded-full transition-all duration-500 ease-out" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-gray-500 text-sm">Building your world...</p>
    </div>
  );
};

export default Loading;