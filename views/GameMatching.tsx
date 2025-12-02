import React, { useState, useEffect, useMemo } from 'react';
import { VocabularyWord } from '../types';
import Button from '../components/Button';
import { playAudioData } from '../services/audioUtils';
import { generateSpeech } from '../services/geminiService';

interface GameMatchingProps {
  words: VocabularyWord[];
  onComplete: (score: number) => void;
}

const GameMatching: React.FC<GameMatchingProps> = ({ words, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  
  const currentWord = words[currentIndex];

  // Generate 4 options including the correct one
  const options = useMemo(() => {
    const others = words.filter(w => w.id !== currentWord.id);
    // Shuffle others and take 3
    const shuffledOthers = others.sort(() => 0.5 - Math.random()).slice(0, 3);
    // Add correct one and shuffle again
    return [...shuffledOthers, currentWord].sort(() => 0.5 - Math.random());
  }, [currentWord, words]);

  useEffect(() => {
     // Auto-pronounce word when it appears
     const play = async () => {
         try {
             const audio = await generateSpeech(currentWord.word);
             if(audio) await playAudioData(audio);
         } catch(e) {}
     }
     play();
  }, [currentIndex, currentWord]);

  const handleSelect = (id: string) => {
    if (selectedId) return; // Block input if already selected
    setSelectedId(id);
    
    const correct = id === currentWord.id;
    setIsCorrect(correct);
    
    if (correct) {
      setScore(s => s + 10);
    }

    setTimeout(() => {
      if (currentIndex < words.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedId(null);
        setIsCorrect(null);
      } else {
        onComplete(score + (correct ? 10 : 0));
      }
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 max-w-4xl mx-auto">
      <div className="w-full flex justify-between items-center mb-6">
         <div className="text-xl font-bold text-gray-400">Question {currentIndex + 1}/{words.length}</div>
         <div className="text-xl font-bold text-yellow-500">Score: {score}</div>
      </div>

      <h2 className="text-4xl font-black text-blue-600 mb-8 animate-bounce">
        {currentWord.word}
      </h2>

      <div className="grid grid-cols-2 gap-4 w-full">
        {options.map((option) => {
          let ringColor = "ring-gray-100";
          if (selectedId === option.id) {
             ringColor = isCorrect && option.id === currentWord.id ? "ring-green-500 bg-green-50" : "ring-red-500 bg-red-50";
          } else if (selectedId && option.id === currentWord.id) {
             ringColor = "ring-green-500 bg-green-50"; // Show correct answer if wrong selected
          }

          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              disabled={!!selectedId}
              className={`
                aspect-square rounded-2xl bg-white shadow-lg overflow-hidden relative
                ring-4 ${ringColor} transition-all transform
                ${!selectedId ? 'hover:scale-105 active:scale-95' : ''}
              `}
            >
              {option.imageUrl ? (
                <img src={option.imageUrl} alt="option" className="w-full h-full object-contain p-4" />
              ) : (
                <span className="text-2xl">{option.word}</span>
              )}
              {selectedId === option.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                      {isCorrect && option.id === currentWord.id ? (
                          <span className="text-6xl">✅</span>
                      ) : (
                          <span className="text-6xl">❌</span>
                      )}
                  </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-8 h-8 text-center">
         {isCorrect === true && <span className="text-green-600 font-bold text-xl">Great Job!</span>}
         {isCorrect === false && <span className="text-red-500 font-bold text-xl">Oops! It's the {currentWord.chinese}</span>}
      </div>
    </div>
  );
};

export default GameMatching;