import React, { useState } from 'react';
import Button from '../components/Button';

interface WelcomeProps {
  onStart: (customTheme?: string) => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onStart }) => {
  const [theme, setTheme] = useState('');

  const handleStart = () => {
    onStart(theme.trim() || undefined);
  };

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
        <p className="text-lg text-gray-600 mb-6">
          Ready for an adventure? Pick a theme or let AI surprise you!
        </p>

        <input
          type="text"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          placeholder="Enter a theme (optional)..."
          maxLength={30}
          className="w-full px-4 py-3 mb-4 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none text-center text-lg"
        />

        <Button onClick={handleStart} size="lg" className="w-full">
          Start Adventure!
        </Button>

        {theme && (
          <p className="text-sm text-gray-400 mt-3">
            🎯 Will generate words for: <span className="font-semibold text-blue-600">{theme}</span>
          </p>
        )}
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