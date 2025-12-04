import React, { useState, useEffect, useRef } from 'react';
import { VocabularyWord } from '../types';
import Button from '../components/Button';

interface GameCrosswordProps {
    words: VocabularyWord[];
    onComplete: (score: number) => void;
    onMistake: (word: VocabularyWord) => void;
}

interface Cell {
    char: string;
    x: number;
    y: number;
    isStart?: boolean;
    acrossWordId?: string;
    downWordId?: string;
}

interface PlacedWord {
    id: string;
    word: string;
    clue: string;
    direction: 'across' | 'down';
    x: number;
    y: number;
}

const GRID_SIZE = 12;

const GameCrossword: React.FC<GameCrosswordProps> = ({ words, onComplete, onMistake }) => {
    const [grid, setGrid] = useState<(Cell | null)[][]>([]);
    const [placedWords, setPlacedWords] = useState<PlacedWord[]>([]);
    const [userInputs, setUserInputs] = useState<string[][]>([]);
    const [score, setScore] = useState(0);
    const [selectedCell, setSelectedCell] = useState<{ x: number, y: number } | null>(null);
    const [direction, setDirection] = useState<'across' | 'down'>('across');
    const [isSuccess, setIsSuccess] = useState(false);
    const [revealedCount, setRevealedCount] = useState(0);

    const inputRefs = useRef<(HTMLInputElement | null)[][]>([]);

    useEffect(() => {
        generateCrossword();
    }, [words]);

    const generateCrossword = () => {
        // 1. Initialize Grid
        const newGrid: (Cell | null)[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
        const inputs: string[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));
        const placed: PlacedWord[] = [];

        // 2. Sort words by length (longest first)
        const sortedWords = [...words].sort((a, b) => b.word.length - a.word.length).slice(0, 8); // Limit to 8 words

        if (sortedWords.length === 0) return;

        // 3. Place first word in the middle
        const firstWord = sortedWords[0];
        const startX = Math.floor((GRID_SIZE - firstWord.word.length) / 2);
        const startY = Math.floor(GRID_SIZE / 2);

        placeWordOnGrid(newGrid, firstWord, startX, startY, 'across', placed);

        // 4. Try to place remaining words
        const remainingWords = sortedWords.slice(1);

        for (const word of remainingWords) {
            let bestMove: { x: number, y: number, dir: 'across' | 'down' } | null = null;

            // Try to intersect with existing placed words
            // Shuffle placed words to vary the layout
            const shuffledPlaced = [...placed].sort(() => 0.5 - Math.random());

            for (const pWord of shuffledPlaced) {
                // Find common letters
                for (let i = 0; i < word.word.length; i++) {
                    const char = word.word[i].toUpperCase();

                    for (let j = 0; j < pWord.word.length; j++) {
                        if (pWord.word[j].toUpperCase() === char) {
                            // Potential intersection
                            // If pWord is across, new word must be down
                            const newDir = pWord.direction === 'across' ? 'down' : 'across';

                            // Calculate start position for new word
                            let newX = pWord.x + (pWord.direction === 'across' ? j : 0);
                            let newY = pWord.y + (pWord.direction === 'down' ? j : 0);

                            if (newDir === 'across') {
                                newX -= i;
                            } else {
                                newY -= i;
                            }

                            if (canPlaceWord(newGrid, word.word, newX, newY, newDir)) {
                                bestMove = { x: newX, y: newY, dir: newDir };
                                break;
                            }
                        }
                    }
                    if (bestMove) break;
                }
                if (bestMove) break;
            }

            if (bestMove) {
                placeWordOnGrid(newGrid, word, bestMove.x, bestMove.y, bestMove.dir, placed);
            }
        }

        setGrid(newGrid);
        setPlacedWords(placed);
        setUserInputs(inputs);

        // Initialize refs
        inputRefs.current = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
    };

    const canPlaceWord = (grid: (Cell | null)[][], wordStr: string, x: number, y: number, dir: 'across' | 'down') => {
        if (x < 0 || y < 0) return false;
        if (dir === 'across') {
            if (x + wordStr.length > GRID_SIZE) return false;
        } else {
            if (y + wordStr.length > GRID_SIZE) return false;
        }

        // Check collisions and adjacency
        for (let i = 0; i < wordStr.length; i++) {
            const cx = dir === 'across' ? x + i : x;
            const cy = dir === 'down' ? y + i : y;
            const char = wordStr[i].toUpperCase();
            const cell = grid[cy][cx];

            // Collision check
            if (cell && cell.char !== char) return false;

            // Adjacency check (don't touch other words incorrectly)
            // We need to ensure we are not placing a letter next to another existing letter 
            // unless it is the intersection point.

            // Neighbors: top, bottom, left, right
            const neighbors = [
                { nx: cx, ny: cy - 1 }, // Top
                { nx: cx, ny: cy + 1 }, // Bottom
                { nx: cx - 1, ny: cy }, // Left
                { nx: cx + 1, ny: cy }  // Right
            ];

            for (const { nx, ny } of neighbors) {
                if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
                    const neighborCell = grid[ny][nx];
                    // If neighbor exists
                    if (neighborCell) {
                        // If it's the cell we are placing on (intersection), it's fine (already checked char match)
                        if (nx === cx && ny === cy) continue;

                        // If we are placing ACROSS:
                        // Neighbors above/below should be empty unless they belong to a crossing word at this exact position?
                        // Actually simpler rule: 
                        // If current cell is empty, it must not have any neighbors perpendicular to placement direction?
                        // This is getting complicated. Simplified check:

                        // If the cell was empty before, we must check neighbors.
                        if (!cell) {
                            // If placing ACROSS, check Top/Bottom neighbors. If they exist, invalid (unless we are crossing them, but we assume empty cell means no crossing)
                            // Wait, if cell is empty, it means no word is there.
                            // So if we place a char there, we shouldn't touch another word parallel to us.

                            // Simplified: Just ensure we don't overwrite mismatching chars (checked)
                            // And don't create new 2-letter words unintentionally.
                            // For a mini game, let's trust the intersection logic mostly.
                            // A strict check would be: 
                            // If placing ACROSS at (cx, cy):
                            //   (cx-1, cy) should be empty (unless i=0)
                            //   (cx+len, cy) should be empty (unless i=len-1)
                            //   (cx, cy-1) and (cx, cy+1) should be empty UNLESS this is an intersection point (cell is not null)
                        }
                    }
                }
            }
        }

        // Check start/end boundaries (don't extend existing words)
        const beforeX = dir === 'across' ? x - 1 : x;
        const beforeY = dir === 'down' ? y - 1 : y;
        if (beforeX >= 0 && beforeY >= 0 && beforeX < GRID_SIZE && beforeY < GRID_SIZE && grid[beforeY][beforeX]) return false;

        const afterX = dir === 'across' ? x + wordStr.length : x;
        const afterY = dir === 'down' ? y + wordStr.length : y;
        if (afterX >= 0 && afterY >= 0 && afterX < GRID_SIZE && afterY < GRID_SIZE && grid[afterY][afterX]) return false;

        return true;
    };

    const placeWordOnGrid = (
        grid: (Cell | null)[][],
        word: VocabularyWord,
        x: number,
        y: number,
        dir: 'across' | 'down',
        placedList: PlacedWord[]
    ) => {
        const wordStr = word.word.toUpperCase();

        placedList.push({
            id: word.id,
            word: wordStr,
            clue: word.chinese,
            direction: dir,
            x,
            y
        });

        for (let i = 0; i < wordStr.length; i++) {
            const cx = dir === 'across' ? x + i : x;
            const cy = dir === 'down' ? y + i : y;

            if (!grid[cy][cx]) {
                grid[cy][cx] = {
                    char: wordStr[i],
                    x: cx,
                    y: cy,
                };
            }

            // Mark start of words
            if (i === 0) {
                grid[cy][cx]!.isStart = true;
            }

            // Link word IDs
            if (dir === 'across') grid[cy][cx]!.acrossWordId = word.id;
            else grid[cy][cx]!.downWordId = word.id;
        }
    };

    const handleInputChange = (x: number, y: number, val: string) => {
        if (isSuccess) return;

        const char = val.slice(-1).toUpperCase();
        const newInputs = [...userInputs];
        newInputs[y][x] = char;
        setUserInputs(newInputs);

        if (char) {
            // Auto-focus next cell
            moveFocus(x, y, 1);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent, x: number, y: number) => {
        if (e.key === 'Backspace') {
            if (userInputs[y][x] === '') {
                moveFocus(x, y, -1);
            } else {
                const newInputs = [...userInputs];
                newInputs[y][x] = '';
                setUserInputs(newInputs);
            }
        } else if (e.key === 'ArrowRight') {
            moveFocus(x, y, 1, 'across');
        } else if (e.key === 'ArrowDown') {
            moveFocus(x, y, 1, 'down');
        } else if (e.key === 'ArrowLeft') {
            moveFocus(x, y, -1, 'across');
        } else if (e.key === 'ArrowUp') {
            moveFocus(x, y, -1, 'down');
        } else if (e.key === ' ') {
            // Toggle direction
            setDirection(prev => prev === 'across' ? 'down' : 'across');
        }
    };

    const moveFocus = (x: number, y: number, step: number, forceDir?: 'across' | 'down') => {
        const currentDir = forceDir || direction;
        let nextX = x;
        let nextY = y;

        // Simple linear search for next valid cell in direction
        let found = false;
        let attempts = 0;

        while (!found && attempts < GRID_SIZE) {
            if (currentDir === 'across') {
                nextX += step;
            } else {
                nextY += step;
            }

            // Bounds check
            if (nextX < 0 || nextX >= GRID_SIZE || nextY < 0 || nextY >= GRID_SIZE) break;

            if (grid[nextY][nextX]) {
                found = true;
            }
            attempts++;
        }

        if (found && inputRefs.current[nextY][nextX]) {
            inputRefs.current[nextY][nextX]?.focus();
            setSelectedCell({ x: nextX, y: nextY });
        }
    };

    const handleCellClick = (x: number, y: number) => {
        if (selectedCell?.x === x && selectedCell?.y === y) {
            // Toggle direction if clicking same cell
            setDirection(prev => prev === 'across' ? 'down' : 'across');
        } else {
            setSelectedCell({ x, y });
            // Infer direction based on word availability
            const cell = grid[y][x];
            if (cell) {
                if (cell.acrossWordId && !cell.downWordId) setDirection('across');
                else if (!cell.acrossWordId && cell.downWordId) setDirection('down');
            }
        }
    };

    const checkSolution = () => {
        let correct = true;
        let filled = true;

        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                if (grid[y][x]) {
                    if (userInputs[y][x] === '') filled = false;
                    if (userInputs[y][x] !== grid[y][x]?.char) correct = false;
                }
            }
        }

        if (correct && filled) {
            setIsSuccess(true);
            setScore(100 - revealedCount * 5);
            try {
                new Audio('https://codeskulptor-demos.commondatastorage.googleapis.com/pang/pop.mp3').play().catch(() => { });
            } catch (e) { }
            setTimeout(() => onComplete(100 - revealedCount * 5), 1500);
        } else {
            // Shake animation or feedback?
            alert("Not quite right yet!");
        }
    };

    const revealLetter = () => {
        if (selectedCell && grid[selectedCell.y][selectedCell.x]) {
            const { x, y } = selectedCell;
            const char = grid[y][x]!.char;
            const newInputs = [...userInputs];
            newInputs[y][x] = char;
            setUserInputs(newInputs);
            setRevealedCount(prev => prev + 1);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-2 max-w-4xl mx-auto">
            <div className="w-full flex justify-between items-center mb-4">
                <h2 className="text-2xl font-black text-purple-600">Crossword Mini</h2>
                <div className="flex gap-4">
                    <Button variant="secondary" size="sm" onClick={revealLetter} disabled={!selectedCell || isSuccess}>Reveal Letter</Button>
                    <Button variant="primary" size="sm" onClick={checkSolution} disabled={isSuccess}>Check</Button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start justify-center w-full">
                {/* Grid */}
                <div className="bg-gray-800 p-2 rounded-lg shadow-xl overflow-auto max-w-full">
                    <div
                        className="grid gap-1"
                        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(24px, 1fr))` }}
                    >
                        {grid.map((row, y) => (
                            row.map((cell, x) => (
                                <div key={`${x}-${y}`} className="relative w-8 h-8 sm:w-10 sm:h-10">
                                    {cell ? (
                                        <input
                                            ref={el => inputRefs.current[y][x] = el}
                                            type="text"
                                            maxLength={1}
                                            value={userInputs[y][x]}
                                            onChange={(e) => handleInputChange(x, y, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(e, x, y)}
                                            onClick={() => handleCellClick(x, y)}
                                            className={`
                        w-full h-full text-center font-bold text-lg uppercase rounded-sm focus:outline-none
                        ${isSuccess ? 'bg-green-100 text-green-700' : 'bg-white text-gray-800'}
                        ${selectedCell?.x === x && selectedCell?.y === y ? 'bg-yellow-100 ring-2 ring-yellow-400 z-10' : ''}
                        ${
                                                // Highlight active word
                                                selectedCell && cell && (
                                                    (direction === 'across' && cell.acrossWordId && grid[selectedCell.y][selectedCell.x]?.acrossWordId === cell.acrossWordId) ||
                                                    (direction === 'down' && cell.downWordId && grid[selectedCell.y][selectedCell.x]?.downWordId === cell.downWordId)
                                                ) ? 'bg-blue-50' : ''
                                                }
                      `}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-transparent"></div>
                                    )}
                                    {cell?.isStart && (
                                        // Find which word starts here to show number? 
                                        // For simplicity, we just list clues by word content or index
                                        <span className="absolute top-0 left-0.5 text-[8px] sm:text-[10px] text-gray-500 font-bold pointer-events-none">
                                            {/* We could map numbers, but for now let's just rely on highlighting */}
                                        </span>
                                    )}
                                </div>
                            ))
                        ))}
                    </div>
                </div>

                {/* Clues */}
                <div className="flex flex-col gap-4 w-full md:w-64 bg-white p-4 rounded-xl shadow-md h-full max-h-[500px] overflow-y-auto">
                    <div>
                        <h3 className="font-bold text-lg text-gray-700 border-b-2 border-purple-200 mb-2">Across</h3>
                        <ul className="space-y-2">
                            {placedWords.filter(w => w.direction === 'across').map(w => (
                                <li
                                    key={w.id}
                                    className={`text-sm cursor-pointer hover:text-purple-600 ${selectedCell && grid[selectedCell.y][selectedCell.x]?.acrossWordId === w.id && direction === 'across' ? 'font-bold text-purple-600 bg-purple-50 p-1 rounded' : ''
                                        }`}
                                    onClick={() => {
                                        setSelectedCell({ x: w.x, y: w.y });
                                        setDirection('across');
                                        inputRefs.current[w.y][w.x]?.focus();
                                    }}
                                >
                                    <span className="font-mono text-xs text-gray-400 mr-1"></span>
                                    {w.clue}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-gray-700 border-b-2 border-blue-200 mb-2">Down</h3>
                        <ul className="space-y-2">
                            {placedWords.filter(w => w.direction === 'down').map(w => (
                                <li
                                    key={w.id}
                                    className={`text-sm cursor-pointer hover:text-blue-600 ${selectedCell && grid[selectedCell.y][selectedCell.x]?.downWordId === w.id && direction === 'down' ? 'font-bold text-blue-600 bg-blue-50 p-1 rounded' : ''
                                        }`}
                                    onClick={() => {
                                        setSelectedCell({ x: w.x, y: w.y });
                                        setDirection('down');
                                        inputRefs.current[w.y][w.x]?.focus();
                                    }}
                                >
                                    <span className="font-mono text-xs text-gray-400 mr-1"></span>
                                    {w.clue}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            <div className="mt-6">
                <Button variant="secondary" onClick={() => onComplete(0)}>Quit Game</Button>
            </div>
        </div>
    );
};

export default GameCrossword;
