import React, { useState } from 'react';
import { VocabularyWord } from '../types';
import { generateSpeech } from '../services/geminiService';
import { playAudioData } from '../services/audioUtils';

interface WordCardProps {
  word: VocabularyWord;
  showDetails?: boolean;
}

const WordCard: React.FC<WordCardProps> = ({ word, showDetails = true }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlaySound = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    
    try {
      // For a real production app, we might cache this audio. 
      // Here we fetch on demand to keep initial load lighter, or we could pre-fetch.
      const audioData = await generateSpeech(word.word);
      if (audioData) {
        await playAudioData(audioData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsPlaying(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-yellow-300 w-full max-w-sm mx-auto transform transition-all hover:scale-105">
      <div className="aspect-square w-full bg-gray-50 flex items-center justify-center relative">
        {word.imageUrl ? (
          <img src={word.imageUrl} alt={word.word} className="w-full h-full object-contain p-4" />
        ) : (
          <div className="text-4xl">🎨</div>
        )}
        <button 
          onClick={handlePlaySound}
          className="absolute bottom-4 right-4 bg-white/90 p-3 rounded-full shadow-lg hover:bg-blue-100 transition-colors text-blue-500"
        >
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          )}
        </button>
      </div>

      {showDetails && (
        <div className="p-6 text-center">
          <h2 className="text-4xl font-extrabold text-gray-800 mb-2">{word.word}</h2>
          <p className="text-gray-500 font-mono text-lg mb-1">/{word.pronunciation}/</p>
          <p className="text-2xl font-bold text-blue-500 mb-4">{word.chinese}</p>
          
          <div className="bg-blue-50 p-3 rounded-xl">
            <p className="text-gray-700 italic">"{word.example}"</p>
            <p className="text-gray-500 text-sm mt-1">{word.exampleChinese}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WordCard;