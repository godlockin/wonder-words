import React from 'react';
import { GamePhase } from '../types';
import Button from '../components/Button';

interface GameMenuProps {
    theme: string;
    onSelectGame: (phase: GamePhase) => void;
    onBack: () => void;
    onNewTheme: () => void;
}

const GameMenu: React.FC<GameMenuProps> = ({ theme, onSelectGame, onBack, onNewTheme }) => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-8 animate-fade-in">
            <div className="text-center">
                <h1 className="text-4xl font-black text-gray-800">It's Play Time!</h1>
                <p className="text-gray-500 mt-2">Choose a game to test your memory.</p>
                <p className="text-sm text-gray-400 mt-1">Theme: <span className="font-semibold text-purple-600">{theme}</span></p>
            </div>

            <div className="grid gap-4 w-full max-w-md">
                {/* Memory Flip */}
                <div className="bg-white p-4 rounded-3xl shadow-lg border-b-8 border-purple-200 hover:border-purple-400 transition-colors cursor-pointer group flex items-center gap-4" onClick={() => onSelectGame(GamePhase.GAME_MEMORY)}>
                    <div className="text-4xl group-hover:scale-110 transition-transform">🎴</div>
                    <div className="text-left">
                        <h3 className="text-xl font-bold text-purple-600">Memory Flip</h3>
                        <p className="text-sm text-gray-400">Find the matching pairs</p>
                    </div>
                </div>

                {/* Picture Match */}
                <div className="bg-white p-4 rounded-3xl shadow-lg border-b-8 border-blue-200 hover:border-blue-400 transition-colors cursor-pointer group flex items-center gap-4" onClick={() => onSelectGame(GamePhase.GAME_MATCHING)}>
                    <div className="text-4xl group-hover:scale-110 transition-transform">🖼️</div>
                    <div className="text-left">
                        <h3 className="text-xl font-bold text-blue-600">Picture Match</h3>
                        <p className="text-sm text-gray-400">Match word to picture</p>
                    </div>
                </div>

                {/* Spelling Bee */}
                <div className="bg-white p-4 rounded-3xl shadow-lg border-b-8 border-orange-200 hover:border-orange-400 transition-colors cursor-pointer group flex items-center gap-4" onClick={() => onSelectGame(GamePhase.GAME_SPELLING)}>
                    <div className="text-4xl group-hover:scale-110 transition-transform">🔤</div>
                    <div className="text-left">
                        <h3 className="text-xl font-bold text-orange-600">Spelling Bee</h3>
                        <p className="text-sm text-gray-400">Spell the words correctly</p>
                    </div>
                </div>

                {/* Hangman */}
                <div className="bg-white p-4 rounded-3xl shadow-lg border-b-8 border-red-200 hover:border-red-400 transition-colors cursor-pointer group flex items-center gap-4" onClick={() => onSelectGame(GamePhase.GAME_HANGMAN)}>
                    <div className="text-4xl group-hover:scale-110 transition-transform">🕵️</div>
                    <div className="text-left">
                        <h3 className="text-xl font-bold text-red-600">Word Guess</h3>
                        <p className="text-sm text-gray-400">Guess the hidden word</p>
                    </div>
                </div>

                {/* Speed Challenge */}
                <div className="bg-white p-4 rounded-3xl shadow-lg border-b-8 border-green-200 hover:border-green-400 transition-colors cursor-pointer group flex items-center gap-4" onClick={() => onSelectGame(GamePhase.GAME_SPEED)}>
                    <div className="text-4xl group-hover:scale-110 transition-transform">⚡</div>
                    <div className="text-left">
                        <h3 className="text-xl font-bold text-green-600">Speed Challenge</h3>
                        <p className="text-sm text-gray-400">Don't let the words fall!</p>
                    </div>
                </div>
            </div>

            <div className="flex gap-3">
                <Button variant="secondary" onClick={onBack} size="sm">Back to Words</Button>
                <Button variant="secondary" onClick={onNewTheme} size="sm">🔄 New Theme</Button>
            </div>
        </div>
    );
};

export default GameMenu;
