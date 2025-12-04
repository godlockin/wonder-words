import React, { useState, useEffect, useRef } from 'react';
import { VocabularyWord } from '../types';
import Button from '../components/Button';

interface GameSpeedProps {
    words: VocabularyWord[];
    onComplete: (score: number) => void;
    onMistake: (word: VocabularyWord) => void;
}

const GameSpeed: React.FC<GameSpeedProps> = ({ words, onComplete, onMistake }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [options, setOptions] = useState<VocabularyWord[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [wordY, setWordY] = useState(0); // Vertical position (0 to 100%)
    const [speed, setSpeed] = useState(0.5); // Movement per tick
    const [gameOver, setGameOver] = useState(false);
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

    const requestRef = useRef<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const currentWord = words[currentIndex];

    // Start game loop
    useEffect(() => {
        if (isPlaying && !gameOver) {
            const animate = () => {
                setWordY(prev => {
                    if (prev >= 90) { // Hit bottom
                        handleMiss();
                        return 0;
                    }
                    return prev + speed;
                });
                requestRef.current = requestAnimationFrame(animate);
            };
            requestRef.current = requestAnimationFrame(animate);
            return () => cancelAnimationFrame(requestRef.current!);
        }
    }, [isPlaying, gameOver, speed]);

    // Setup round
    useEffect(() => {
        if (currentIndex < words.length) {
            // Generate options (1 correct + 3 wrong)
            const correct = words[currentIndex];
            const others = words.filter(w => w.id !== correct.id);
            const wrong = others.sort(() => 0.5 - Math.random()).slice(0, 3);
            const allOptions = [correct, ...wrong].sort(() => 0.5 - Math.random());

            setOptions(allOptions);
            setWordY(0);
            setFeedback(null);
            setIsPlaying(true);

            // Increase speed slightly every 3 words
            if (currentIndex > 0 && currentIndex % 3 === 0) {
                setSpeed(s => Math.min(s + 0.1, 1.5));
            }
        } else {
            setGameOver(true);
            setIsPlaying(false);
            onComplete(score);
        }
    }, [currentIndex]);

    const handleMiss = () => {
        setIsPlaying(false);
        setFeedback('wrong');
        onMistake(currentWord);

        // Pause briefly then next
        setTimeout(() => {
            if (currentIndex < words.length - 1) {
                setCurrentIndex(prev => prev + 1);
            } else {
                setGameOver(true);
                onComplete(score);
            }
        }, 1500);
    };

    const handleOptionClick = (selectedWord: VocabularyWord) => {
        if (!isPlaying) return;

        if (selectedWord.id === currentWord.id) {
            // Correct
            setScore(s => s + 10 + Math.floor((90 - wordY))); // Bonus for speed
            setFeedback('correct');
            setIsPlaying(false);

            try {
                new Audio('https://codeskulptor-demos.commondatastorage.googleapis.com/pang/pop.mp3').play().catch(() => { });
            } catch (e) { }

            setTimeout(() => {
                setCurrentIndex(prev => prev + 1);
            }, 500);
        } else {
            // Wrong
            setScore(s => Math.max(0, s - 5));
            handleMiss();
        }
    };

    return (
        <div className="flex flex-col items-center justify-between min-h-screen p-4 max-w-md mx-auto overflow-hidden relative">
            <div className="w-full flex justify-between items-center z-10">
                <div className="text-xl font-bold text-gray-400">Word {currentIndex + 1}/{words.length}</div>
                <div className="text-xl font-bold text-yellow-500">Score: {score}</div>
            </div>

            {/* Game Area */}
            <div ref={containerRef} className="w-full flex-grow relative border-x-2 border-dashed border-gray-200 my-4 rounded-lg bg-gray-50">
                {/* Falling Word */}
                {!gameOver && (
                    <div
                        className={`
              absolute left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-lg font-black text-2xl whitespace-nowrap transition-colors duration-200
              ${feedback === 'correct' ? 'bg-green-500 text-white scale-110' : ''}
              ${feedback === 'wrong' ? 'bg-red-500 text-white shake' : ''}
              ${!feedback ? 'bg-white text-purple-600 border-2 border-purple-200' : ''}
            `}
                        style={{ top: `${wordY}%` }}
                    >
                        {currentWord.word}
                    </div>
                )}

                {/* Danger Zone */}
                <div className="absolute bottom-0 w-full h-1 bg-red-500 opacity-50"></div>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-3 w-full z-10">
                {options.map(opt => (
                    <button
                        key={opt.id}
                        onClick={() => handleOptionClick(opt)}
                        disabled={!isPlaying}
                        className="bg-white hover:bg-blue-50 border-b-4 border-gray-200 active:border-b-0 active:translate-y-1 p-4 rounded-xl shadow-sm text-lg font-bold text-gray-700 transition-all"
                    >
                        {opt.chinese}
                    </button>
                ))}
            </div>

            {/* Overlay for feedback */}
            {feedback === 'wrong' && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-500/20 z-20 pointer-events-none">
                    <div className="bg-white p-6 rounded-2xl shadow-2xl text-center animate-bounce">
                        <div className="text-4xl mb-2">😢</div>
                        <div className="font-bold text-red-500 text-xl">Missed it!</div>
                        <div className="text-gray-500">{currentWord.word} = {currentWord.chinese}</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GameSpeed;
