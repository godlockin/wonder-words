import React from 'react';
import Button from '../components/Button';

interface WelcomeProps {
  onStart: () => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center space-y-8 animate-fade-in">
      <div className="space-y-4">
        <h1 className="text-6xl font-black text-blue-600 tracking-tight drop-shadow-sm wiggle cursor-default inline-block">
          WonderWords
        </h1>
        <p className="text-2xl text-gray-600 font-medium">
          The Magic Vocabulary Game
        </p>
      </div>
      
      <div className="bg-white p-8 rounded-3xl shadow-lg border-2 border-blue-100 max-w-md w-full">
        <div className="flex justify-center mb-6">
          <span className="text-6xl">🚀</span>
        </div>
        <p className="text-lg text-gray-600 mb-8">
          Ready for an adventure? We'll pick a surprise theme and learn 10 new words together!
        </p>
        <Button onClick={onStart} size="lg" className="w-full">
          Start Adventure!
        </Button>
      </div>
      
      <div className="flex gap-4 opacity-50">
        <span className="text-4xl">🍎</span>
        <span className="text-4xl">🐱</span>
        <span className="text-4xl">🚗</span>
        <span className="text-4xl">🌈</span>
      </div>
    </div>
  );
};

export default Welcome;