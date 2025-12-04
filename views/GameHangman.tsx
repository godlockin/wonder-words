import React, { useState, useEffect } from 'react';
import { VocabularyWord } from '../types';
import Button from '../components/Button';

interface GameHangmanProps {
    words: VocabularyWord[];
    onComplete: (score: number) => void;
    onMistake: (word: VocabularyWord) => void;
}

const GameHangman: React.FC<GameHangmanProps> = ({ words, onComplete, onMistake }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
    const [mistakes, setMistakes] = useState(0);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isGameOver, setIsGameOver] = useState(false);

    const MAX_MISTAKES = 6;
    const currentWord = words[currentIndex];
    const targetWord = currentWord.word.toUpperCase();

    useEffect(() => {
        // Reset for new word
        setGuessedLetters(new Set());
        setMistakes(0);
        setIsSuccess(false);
        setIsGameOver(false);
    }, [currentIndex]);

    const handleGuess = (letter: string) => {
        if (isSuccess || isGameOver || guessedLetters.has(letter)) return;

        const newGuessed = new Set(guessedLetters);
        newGuessed.add(letter);
        setGuessedLetters(newGuessed);

        if (!targetWord.includes(letter)) {
            const newMistakes = mistakes + 1;
            setMistakes(newMistakes);
            if (newMistakes >= MAX_MISTAKES) {
                setIsGameOver(true);
                onMistake(currentWord);
            }
        } else {
            // Check win
            const allGuessed = targetWord.split('').every(char => newGuessed.has(char) || !/[A-Z]/.test(char));
            if (allGuessed) {
                setIsSuccess(true);
                setScore(s => s + 10 + (MAX_MISTAKES - mistakes) * 2); // Bonus for fewer mistakes
                try {
                    new Audio('https://codeskulptor-demos.commondatastorage.googleapis.com/pang/pop.mp3').play().catch(() => { });
                } catch (e) { }
            }
        }
    };

    const handleNext = () => {
        if (currentIndex < words.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            onComplete(score);
        }
    };

    const keyboard = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 max-w-md mx-auto">
            <div className="w-full flex justify-between items-center mb-6">
                <div className="text-xl font-bold text-gray-400">Word {currentIndex + 1}/{words.length}</div>
                <div className="text-xl font-bold text-yellow-500">Score: {score}</div>
            </div>

            {/* Hangman Drawing (Simple CSS/SVG representation) */}
            <div className="relative w-32 h-32 mb-6">
                {/* Base */}
                <div className="absolute bottom-0 left-0 w-full h-2 bg-gray-800 rounded-full"></div>
                <div className="absolute bottom-0 left-1/2 w-2 h-full bg-gray-800 -translate-x-1/2 rounded-t-full"></div>
                <div className="absolute top-0 left-1/2 w-16 h-2 bg-gray-800 rounded-full"></div>
                <div className="absolute top-0 right-0 w-2 h-8 bg-gray-800 rounded-b-full translate-x-4"></div>

                {/* Body Parts */}
                {mistakes >= 1 && <div className="absolute top-8 right-0 w-8 h-8 border-4 border-gray-800 rounded-full translate-x-1"></div>} {/* Head */}
                {mistakes >= 2 && <div className="absolute top-16 right-0 w-1 h-10 bg-gray-800 translate-x-4.5"></div>} {/* Body */}
                {mistakes >= 3 && <div className="absolute top-20 right-0 w-8 h-1 bg-gray-800 -rotate-45 translate-x-0"></div>} {/* Left Arm */}
                {mistakes >= 4 && <div className="absolute top-20 right-0 w-8 h-1 bg-gray-800 rotate-45 translate-x-5"></div>} {/* Right Arm */}
                {mistakes >= 5 && <div className="absolute top-24 right-0 w-8 h-1 bg-gray-800 -rotate-45 translate-x-0 translate-y-6"></div>} {/* Left Leg */}
                {mistakes >= 6 && <div className="absolute top-24 right-0 w-8 h-1 bg-gray-800 rotate-45 translate-x-5 translate-y-6"></div>} {/* Right Leg */}
            </div>

            {/* Word Display */}
            <div className="flex gap-2 mb-8 flex-wrap justify-center">
                {targetWord.split('').map((char, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-1">
                        <div className={`
               w-8 h-10 sm:w-10 sm:h-12 border-b-4 flex items-center justify-center text-2xl font-bold
               ${isGameOver && !guessedLetters.has(char) ? 'text-red-400 border-red-200' : 'text-gray-800 border-gray-800'}
             `}>
                            {guessedLetters.has(char) || !/[A-Z]/.test(char) || isGameOver ? char : ''}
                        </div>
                    </div>
                ))}
            </div>

            {/* Hint */}
            <div className="mb-6 text-center">
                <p className="text-gray-500 font-medium">{currentWord.chinese}</p>
                {isGameOver && <p className="text-red-500 font-bold mt-2">Game Over! The word was {targetWord}</p>}
                {isSuccess && <p className="text-green-500 font-bold mt-2">Correct! 🎉</p>}
            </div>

            {/* Keyboard */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
                {keyboard.map(char => {
                    const isGuessed = guessedLetters.has(char);
                    const isCorrect = targetWord.includes(char);

                    let bgClass = "bg-white text-gray-700 hover:bg-gray-100";
                    if (isGuessed) {
                        bgClass = isCorrect ? "bg-green-500 text-white border-green-600" : "bg-gray-300 text-gray-500 border-gray-300 opacity-50";
                    }

                    return (
                        <button
                            key={char}
                            onClick={() => handleGuess(char)}
                            disabled={isGuessed || isSuccess || isGameOver}
                            className={`
                w-8 h-10 sm:w-10 sm:h-12 rounded-lg font-bold shadow-sm border-b-4 transition-all active:scale-95
                ${bgClass}
              `}
                        >
                            {char}
                        </button>
                    )
                })}
            </div>

            {/* Controls */}
            <div className="w-full">
                {(isSuccess || isGameOver) ? (
                    <Button onClick={handleNext} variant={isSuccess ? "success" : "secondary"} className="w-full">
                        {currentIndex === words.length - 1 ? "Finish Game" : "Next Word ➡"}
                    </Button>
                ) : (
                    <Button variant="secondary" onClick={() => onComplete(score)} className="w-full opacity-50 hover:opacity-100">
                        Quit Game
                    </Button>
                )}
            </div>
        </div>
    );
};

export default GameHangman;
