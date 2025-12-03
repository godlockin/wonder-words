import React, { useState, useEffect } from 'react';
import { VocabularyWord } from '../types';
import Button from '../components/Button';

interface GameSpellingProps {
  words: VocabularyWord[];
  onComplete: (score: number) => void;
  onMistake: (word: VocabularyWord) => void;
}

const GameSpelling: React.FC<GameSpellingProps> = ({ words, onComplete, onMistake }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [shuffledLetters, setShuffledLetters] = useState<{ char: string, id: number }[]>([]);
  const [placedLetters, setPlacedLetters] = useState<(string | null)[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [mistakeCount, setMistakeCount] = useState(0);

  const currentWord = words[currentIndex];
  const targetWord = currentWord.word.toUpperCase();

  useEffect(() => {
    // Setup new word
    const letters = targetWord.split('').map((char, index) => ({ char, id: index }));
    // Shuffle
    setShuffledLetters([...letters].sort(() => 0.5 - Math.random()));
    setPlacedLetters(new Array(targetWord.length).fill(null));
    setIsSuccess(false);
    setMistakeCount(0);
  }, [currentIndex, targetWord]);

  const handleLetterClick = (char: string, id: number) => {
    // Find first empty slot
    const emptyIndex = placedLetters.indexOf(null);
    if (emptyIndex === -1) return;

    const newPlaced = [...placedLetters];
    newPlaced[emptyIndex] = char;
    setPlacedLetters(newPlaced);

    // Remove from available
    setShuffledLetters(prev => prev.filter(item => item.id !== id));

    // Check correctness for feedback
    if (char !== targetWord[emptyIndex]) {
      setMistakeCount(prev => prev + 1);
      onMistake(currentWord);
    }

    // Check win condition immediately
    if (!newPlaced.includes(null)) {
      const formedWord = newPlaced.join('');
      if (formedWord === targetWord) {
        setIsSuccess(true);
        try {
          const audio = new Audio('https://codeskulptor-demos.commondatastorage.googleapis.com/pang/pop.mp3');
          audio.play().catch(e => console.log("Audio play failed silently", e));
        } catch (e) { }
      }
    }
  };

  const handleReset = () => {
    const letters = targetWord.split('').map((char, index) => ({ char, id: index }));
    setShuffledLetters([...letters].sort(() => 0.5 - Math.random()));
    setPlacedLetters(new Array(targetWord.length).fill(null));
    setIsSuccess(false);
    setMistakeCount(0);
  };

  const handleHint = () => {
    // Find first incorrect or empty slot
    let targetIndex = -1;
    for (let i = 0; i < targetWord.length; i++) {
      if (placedLetters[i] !== targetWord[i]) {
        targetIndex = i;
        break;
      }
    }

    if (targetIndex === -1) return; // Should not happen if game not won

    const correctChar = targetWord[targetIndex];

    // Create copies to modify
    const newPlaced = [...placedLetters];
    let newShuffled = [...shuffledLetters];

    // 1. If there is a wrong letter in the target slot, return it to shuffled
    const wrongChar = newPlaced[targetIndex];

    if (wrongChar) {
      newShuffled.push({ char: wrongChar, id: Date.now() + Math.random() });
    }

    // 2. Find the correct letter to move to target slot
    // It could be in shuffledLetters OR in another wrong slot in placedLetters
    let sourceIndexInShuffled = newShuffled.findIndex(item => item.char === correctChar);

    if (sourceIndexInShuffled !== -1) {
      // Found in shuffled, remove it
      newShuffled.splice(sourceIndexInShuffled, 1);
    } else {
      // Must be in placedLetters (in a wrong spot)
      const sourceIndexInPlaced = newPlaced.findIndex((char, idx) => char === correctChar && idx !== targetIndex);
      if (sourceIndexInPlaced !== -1) {
        // Remove from that placed slot
        newPlaced[sourceIndexInPlaced] = null;
      }
    }

    // 3. Place correct letter
    newPlaced[targetIndex] = correctChar;

    setPlacedLetters(newPlaced);
    setShuffledLetters(newShuffled);

    // Check win (in case this was the last letter)
    if (!newPlaced.includes(null)) {
      const formedWord = newPlaced.join('');
      if (formedWord === targetWord) {
        setIsSuccess(true);
        try {
          const audio = new Audio('https://codeskulptor-demos.commondatastorage.googleapis.com/pang/pop.mp3');
          audio.play().catch(e => console.log("Audio play failed silently", e));
        } catch (e) { }
      }
    }
  };

  const handlePlacedLetterClick = (index: number) => {
    if (isSuccess) return;

    const char = placedLetters[index];
    if (!char) return;

    // Remove from placed
    const newPlaced = [...placedLetters];
    newPlaced[index] = null;
    setPlacedLetters(newPlaced);

    // Add back to shuffled
    setShuffledLetters(prev => [...prev, { char, id: Date.now() + Math.random() }]);
  };

  const handleNext = () => {
    if (isSuccess) setScore(s => s + 10);

    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onComplete(score + (isSuccess ? 10 : 0));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 max-w-2xl mx-auto">
      <div className="w-full flex justify-between items-center mb-6">
        <div className="text-xl font-bold text-gray-400">Word {currentIndex + 1}/{words.length}</div>
        <div className="text-xl font-bold text-yellow-500">Score: {score}</div>
      </div>

      {/* Image Hint */}
      <div className="w-48 h-48 bg-white rounded-2xl shadow-md mb-8 p-4">
        {currentWord.imageUrl && <img src={currentWord.imageUrl} alt="hint" className="w-full h-full object-contain" />}
      </div>

      <div className="mb-2 text-gray-500 font-bold">{currentWord.chinese}</div>

      {/* Slots */}
      <div className="flex gap-2 mb-8 flex-wrap justify-center">
        {placedLetters.map((char, idx) => {
          const isCorrect = char === targetWord[idx];
          const isWrong = char !== null && !isCorrect;
          return (
            <div
              key={idx}
              onClick={() => handlePlacedLetterClick(idx)}
              className={`
                    w-12 h-14 sm:w-16 sm:h-20 border-b-4 text-3xl sm:text-4xl font-bold flex items-center justify-center
                    ${!char ? 'border-gray-300' : 'cursor-pointer hover:bg-gray-50'}
                    ${isCorrect ? 'border-blue-500 text-blue-600' : ''}
                    ${isWrong ? 'border-red-400 text-red-500 bg-red-50' : ''}
                    ${isSuccess ? '!text-green-500 !border-green-500 !bg-green-50 !cursor-default' : ''}
                `}
            >
              {char}
            </div>
          );
        })}
      </div>

      {/* Available Letters */}
      {!isSuccess && (
        <div className="flex gap-3 flex-wrap justify-center mb-8">
          {shuffledLetters.map((item) => (
            <button
              key={item.id}
              onClick={() => handleLetterClick(item.char, item.id)}
              className="w-12 h-12 sm:w-14 sm:h-14 bg-yellow-400 hover:bg-yellow-300 text-white font-bold rounded-xl shadow-md text-xl active:scale-95 transition-transform"
            >
              {item.char}
            </button>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4 items-center">
        {!isSuccess && (
          <Button variant="secondary" onClick={handleReset} size="sm">
            Reset
          </Button>
        )}

        {!isSuccess && mistakeCount >= 3 && (
          <button
            onClick={handleHint}
            className="bg-orange-100 text-orange-600 px-4 py-2 rounded-xl font-bold hover:bg-orange-200 transition-colors flex items-center gap-2"
          >
            💡 Hint
          </button>
        )}

        {isSuccess && (
          <Button variant="success" onClick={handleNext} className="animate-bounce">
            Next Word ➡
          </Button>
        )}
      </div>
    </div>
  );
};

export default GameSpelling;