import React, { useState, useEffect } from 'react';
import { VocabularyWord } from '../types';
import Button from '../components/Button';

interface GameMemoryProps {
    words: VocabularyWord[];
    onComplete: (score: number) => void;
    onMistake: (word: VocabularyWord) => void;
}

interface Card {
    id: string; // Unique ID for the card instance
    wordId: string; // ID of the vocabulary word it represents
    content: string; // Text to display (word or image URL)
    type: 'image' | 'text';
    isFlipped: boolean;
    isMatched: boolean;
}

const GameMemory: React.FC<GameMemoryProps> = ({ words, onComplete, onMistake }) => {
    const [cards, setCards] = useState<Card[]>([]);
    const [flippedCards, setFlippedCards] = useState<Card[]>([]);
    const [matches, setMatches] = useState(0);
    const [score, setScore] = useState(0);
    const [isLocked, setIsLocked] = useState(false); // Prevent clicking while checking match

    useEffect(() => {
        // Setup game
        const gameWords = words.slice(0, 6); // Limit to 6 pairs (12 cards) for better mobile fit
        const newCards: Card[] = [];

        gameWords.forEach(word => {
            // Image Card
            newCards.push({
                id: `${word.id}-img`,
                wordId: word.id,
                content: word.imageUrl || '',
                type: 'image',
                isFlipped: false,
                isMatched: false,
            });
            // Text Card
            newCards.push({
                id: `${word.id}-text`,
                wordId: word.id,
                content: word.word,
                type: 'text',
                isFlipped: false,
                isMatched: false,
            });
        });

        // Shuffle
        setCards(newCards.sort(() => 0.5 - Math.random()));
        setMatches(0);
        setScore(0);
    }, [words]);

    const handleCardClick = (card: Card) => {
        if (isLocked || card.isFlipped || card.isMatched) return;

        // Flip the card
        const newCards = cards.map(c => c.id === card.id ? { ...c, isFlipped: true } : c);
        setCards(newCards);

        const newFlipped = [...flippedCards, card];
        setFlippedCards(newFlipped);

        if (newFlipped.length === 2) {
            setIsLocked(true);
            checkForMatch(newFlipped[0], newFlipped[1], newCards);
        }
    };

    const checkForMatch = (card1: Card, card2: Card, currentCards: Card[]) => {
        const isMatch = card1.wordId === card2.wordId;

        if (isMatch) {
            // Match!
            setScore(s => s + 20);
            setMatches(m => m + 1);

            // Mark as matched
            setCards(currentCards.map(c =>
                c.id === card1.id || c.id === card2.id ? { ...c, isMatched: true } : c
            ));
            setFlippedCards([]);
            setIsLocked(false);

            // Play sound
            try {
                new Audio('https://codeskulptor-demos.commondatastorage.googleapis.com/pang/pop.mp3').play().catch(() => { });
            } catch (e) { }

            // Check win
            if (matches + 1 === currentCards.length / 2) {
                setTimeout(() => onComplete(score + 20 + 50), 1000); // Bonus for completion
            }

        } else {
            // No match
            setScore(s => Math.max(0, s - 2)); // Penalty

            // Record mistake
            const word = words.find(w => w.id === card1.wordId);
            if (word) onMistake(word);

            // Wait and flip back
            setTimeout(() => {
                setCards(currentCards.map(c =>
                    c.id === card1.id || c.id === card2.id ? { ...c, isFlipped: false } : c
                ));
                setFlippedCards([]);
                setIsLocked(false);
            }, 1000);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 max-w-2xl mx-auto">
            <div className="w-full flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-purple-600">Memory Flip</h2>
                <div className="text-xl font-bold text-yellow-500">Score: {score}</div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 w-full">
                {cards.map(card => (
                    <div
                        key={card.id}
                        onClick={() => handleCardClick(card)}
                        className={`
              aspect-square rounded-xl cursor-pointer transition-all duration-300 transform perspective-1000
              ${card.isFlipped || card.isMatched ? 'rotate-y-180' : 'bg-purple-500 hover:bg-purple-600 shadow-lg'}
            `}
                    >
                        <div className={`
              w-full h-full relative flex items-center justify-center rounded-xl overflow-hidden border-4
              ${card.isMatched ? 'border-green-400 bg-green-50' : 'border-purple-200 bg-white'}
              ${!card.isFlipped && !card.isMatched ? 'hidden' : ''}
            `}>
                            {card.type === 'image' ? (
                                <img src={card.content} alt="card" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-sm sm:text-lg font-bold text-gray-700 text-center p-1 break-words leading-tight">
                                    {card.content}
                                </span>
                            )}
                        </div>

                        {/* Back of card design */}
                        {!card.isFlipped && !card.isMatched && (
                            <div className="w-full h-full flex items-center justify-center text-white text-3xl opacity-50">
                                ?
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-8">
                <Button variant="secondary" onClick={() => onComplete(score)}>Give Up</Button>
            </div>
        </div>
    );
};

export default GameMemory;
