import React, { useState, useEffect } from 'react';
import { GamePhase, VocabularyWord } from './types';
import { generateVocabularySet, generateWordImage } from './services/geminiService';
import Welcome from './views/Welcome';
import Loading from './views/Loading';
import WordCard from './components/WordCard';
import Button from './components/Button';
import GameMenu from './views/GameMenu';
import GameMatching from './views/GameMatching';
import GameSpelling from './views/GameSpelling';
import GameMemory from './views/GameMemory';
import GameHangman from './views/GameHangman';
import GameSpeed from './views/GameSpeed';
import GameCrossword from './views/GameCrossword';

const App: React.FC = () => {
  const [phase, setPhase] = useState<GamePhase>(GamePhase.WELCOME);
  const [theme, setTheme] = useState<string>('');
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [learningIndex, setLearningIndex] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [incorrectWords, setIncorrectWords] = useState<Set<string>>(new Set());
  const nextLoadOrder = React.useRef(1);

  // Start the session
  const handleStart = async (customTheme?: string) => {
    setPhase(GamePhase.GENERATING);
    setLoadingProgress(10);
    setLoadingStatus(customTheme ? `Creating words for "${customTheme}"...` : 'Thinking of a fun theme...');
    setIncorrectWords(new Set()); // Reset mistakes
    nextLoadOrder.current = 1; // Reset order

    try {
      // 1. Generate Text
      const vocabData = await generateVocabularySet(customTheme);
      setTheme(vocabData.theme);
      setWords(vocabData.words);

      // 2. Generate Images in Background
      // We use a non-awaited promise chain here to let the UI render
      generateImagesInBackground(vocabData.words, vocabData.theme);

    } catch (error) {
      console.error(error);
      alert("Something went wrong creating the game. Please try again!");
      setPhase(GamePhase.WELCOME);
    }
  };

  const generateImagesInBackground = async (initialWords: VocabularyWord[], theme: string) => {
    let firstImageLoaded = false;

    // Trigger ALL image generations immediately (fully parallel)
    initialWords.forEach(async (word) => {
      try {
        const img = await generateWordImage(word.word, theme);
        if (img) {
          // Update state incrementally
          setWords(prevWords => {
            const updatedWords = prevWords.map(w => {
              if (w.id === word.id) {
                return { ...w, imageUrl: img, loadedOrder: nextLoadOrder.current++ };
              }
              return w;
            });

            // Sort: Loaded words first (by loadedOrder), then unloaded words (stable/original order)
            return updatedWords.sort((a, b) => {
              if (a.loadedOrder !== undefined && b.loadedOrder !== undefined) {
                return a.loadedOrder - b.loadedOrder;
              }
              if (a.loadedOrder !== undefined) return -1; // a comes first
              if (b.loadedOrder !== undefined) return 1;  // b comes first
              return 0; // Keep original relative order
            });
          });

          // If this is the first image to load, transition to learning phase
          if (!firstImageLoaded) {
            firstImageLoaded = true;
            setLoadingProgress(100);
            setPhase(GamePhase.LEARNING);
            setLearningIndex(0);
          }
        }
      } catch (e) {
        console.error("Failed to generate image for", word.word, e);
      }
    });
  };

  const handleNextCard = () => {
    if (learningIndex < words.length - 1) {
      setLearningIndex(prev => prev + 1);
    } else {
      setPhase(GamePhase.GAME_MENU);
    }
  };

  const handlePrevCard = () => {
    if (learningIndex > 0) {
      setLearningIndex(prev => prev - 1);
    }
  };

  const handleGameComplete = (score: number) => {
    setFinalScore(score);
    setPhase(GamePhase.SUMMARY);
  }

  const handleMistake = (word: VocabularyWord) => {
    setIncorrectWords(prev => {
      const newSet = new Set(prev);
      newSet.add(word.id);
      return newSet;
    });
  };

  // Render Views
  if (phase === GamePhase.WELCOME) {
    return <Welcome onStart={handleStart} />;
  }

  if (phase === GamePhase.GENERATING) {
    return <Loading status={loadingStatus} progress={loadingProgress} />;
  }

  if (phase === GamePhase.LEARNING) {
    return (
      <div className="min-h-screen flex flex-col items-center py-8 px-4 max-w-md mx-auto">
        <div className="w-full flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-500 uppercase tracking-widest">{theme}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPhase(GamePhase.WELCOME)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold hover:from-purple-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg"
              title="Generate new theme"
            >
              🔄 New
            </button>
            <div className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-bold">
              {learningIndex + 1} / {words.length}
            </div>
          </div>
        </div>

        <div className="w-full flex-grow flex items-center justify-center mb-8">
          <WordCard word={words[learningIndex]} />
        </div>

        <div className="w-full flex justify-between gap-4">
          <Button
            onClick={handlePrevCard}
            variant="secondary"
            disabled={learningIndex === 0}
            className={learningIndex === 0 ? 'opacity-50' : ''}
          >
            Prev
          </Button>
          {learningIndex === words.length - 1 ? (
            <Button onClick={() => setPhase(GamePhase.GAME_MENU)} variant="success">
              Play Games! 🎮
            </Button>
          ) : (
            <Button onClick={handleNextCard}>
              Next ➡
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (phase === GamePhase.GAME_MENU) {
    return (
      <GameMenu
        theme={theme}
        onSelectGame={setPhase}
        onBack={() => setPhase(GamePhase.LEARNING)}
        onNewTheme={() => setPhase(GamePhase.WELCOME)}
      />
    );
  }

  if (phase === GamePhase.GAME_MATCHING) {
    return <GameMatching words={words} onComplete={handleGameComplete} onMistake={handleMistake} />;
  }

  if (phase === GamePhase.GAME_SPELLING) {
    return <GameSpelling words={words} onComplete={handleGameComplete} onMistake={handleMistake} />;
  }

  if (phase === GamePhase.GAME_MEMORY) {
    return <GameMemory words={words} onComplete={handleGameComplete} onMistake={handleMistake} />;
  }

  if (phase === GamePhase.GAME_HANGMAN) {
    return <GameHangman words={words} onComplete={handleGameComplete} onMistake={handleMistake} />;
  }

  if (phase === GamePhase.GAME_SPEED) {
    return <GameSpeed words={words} onComplete={handleGameComplete} onMistake={handleMistake} />;
  }

  if (phase === GamePhase.GAME_CROSSWORD) {
    return <GameCrossword words={words} onComplete={handleGameComplete} onMistake={handleMistake} />;
  }

  if (phase === GamePhase.SUMMARY) {
    const mistakes = words.filter(w => incorrectWords.has(w.id));

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="text-8xl mb-6 animate-bounce">🏆</div>
        <h1 className="text-5xl font-black text-yellow-500 mb-2">Awesome!</h1>
        <p className="text-2xl text-gray-600 mb-8">You scored {finalScore} points!</p>

        {mistakes.length > 0 && (
          <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h3 className="text-xl font-bold text-red-500 mb-4">Let's Review these words:</h3>
            <div className="grid grid-cols-1 gap-2">
              {mistakes.map(word => (
                <div key={word.id} className="flex items-center gap-4 p-2 border-b border-gray-100 last:border-0">
                  {word.imageUrl && <img src={word.imageUrl} alt={word.word} className="w-12 h-12 rounded-lg object-cover" />}
                  <div className="text-left">
                    <div className="font-bold text-gray-800">{word.word}</div>
                    <div className="text-sm text-gray-500">{word.chinese}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4 w-full max-w-xs">
          <Button onClick={() => setPhase(GamePhase.GAME_MENU)}>Play Another Game</Button>
          <Button variant="secondary" onClick={() => setPhase(GamePhase.WELCOME)}>New Adventure (New Theme)</Button>
        </div>
      </div>
    )
  }

  return <div>Unknown State</div>;
};

export default App;