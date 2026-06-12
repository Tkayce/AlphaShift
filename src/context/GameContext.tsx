import { Asset } from 'expo-asset';
import { Audio as ExpoAudio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { Difficulty, LEVELS, LevelData } from '../utils/dictionaryData';

const UNLOCKED_LEVELS_KEY = 'ALPHASHIFT_UNLOCKED_LEVELS_';
const DIFFICULTY_KEY = 'ALPHASHIFT_DIFFICULTY';
const CURRENT_LEVEL_ID_KEY = 'ALPHASHIFT_CURRENT_LEVEL_ID';
const SOUND_ENABLED_KEY = 'ALPHASHIFT_SOUND_ENABLED';
const BEST_SCORES_KEY = 'ALPHASHIFT_BEST_SCORES';
const GRID_SIZE = 5;

export interface Tile {
  id: string;
  char: string;
  row: number;
  col: number;
}

interface GameContextType {
  currentLevel: LevelData;
  currentLevelIndex: number;
  grid: Tile[][];
  selectedIndices: { row: number; col: number }[];
  currentWord: string;
  isCorrect: boolean | null;
  hintPath: { row: number; col: number }[];
  difficulty: Difficulty;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => Promise<void>;
  showErrorPopup: boolean;
  unlockedLevelCount: number;
  filteredLevels: LevelData[];
  maxAttempts: number;
  attemptsUsed: number;
  attemptsLeft: number;
  levelScore: number;
  passScore: number;
  revealUsesUsed: number;
  revealUsesLeft: number | null;
  showLevelOverModal: boolean;
  canAdvanceFromLevelOver: boolean;
  replayLevel: () => void;
  closeLevelOverModal: () => void;
  advanceFromLevelOver: () => void;
  getBestScore: (levelId: number) => number;
  onTouchStart: (row: number, col: number) => void;
  onTouchMove: (row: number, col: number) => void;
  onTouchEnd: () => void;
  revealHint: () => void;
  resetGame: () => Promise<void>;
  updateDifficulty: (newDifficulty: Difficulty) => Promise<void>;
  selectLevel: (levelId: number) => void;
  currentLevelId: number;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
  const [unlockedLevelCount, setUnlockedLevelCount] = useState<number>(1);
  const [soundEnabled, setSoundEnabledState] = useState(true);
  
  const [grid, setGrid] = useState<Tile[][]>([]);
  const [selectedIndices, setSelectedIndices] = useState<{ row: number; col: number }[]>([]);
  const [currentWord, setCurrentWord] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [hintPath, setHintPath] = useState<{ row: number; col: number }[]>([]);
  const [targetWordPath, setTargetWordPath] = useState<{ row: number; col: number }[]>([]);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [attemptsUsed, setAttemptsUsed] = useState(0);
  const [levelScore, setLevelScore] = useState(0);
  const [revealUsesUsed, setRevealUsesUsed] = useState(0);
  const [showLevelOverModal, setShowLevelOverModal] = useState(false);
  const [bestScores, setBestScores] = useState<Record<string, number>>({});

  const attemptsUsedRef = useRef(0);
  const levelScoreRef = useRef(0);
  const musicRef = useRef<ExpoAudio.Sound | null>(null);
  const webAudioRef = useRef<HTMLAudioElement | null>(null);
  const webAudioUnlockHandlerRef = useRef<(() => void) | null>(null);

  const filteredLevels = useMemo(() => 
    LEVELS.filter(l => l.difficulty === difficulty),
    [difficulty]
  );

  const currentLevelIndex = useMemo(() => {
    const idx = filteredLevels.findIndex(l => l.id === currentLevelId);
    return idx >= 0 ? idx : 0;
  }, [filteredLevels, currentLevelId]);

  const currentLevel: LevelData = useMemo(() => {
    return filteredLevels[currentLevelIndex] || filteredLevels[0] || LEVELS[0];
  }, [filteredLevels, currentLevelIndex]);

  const maxAttempts = useMemo(() => {
    if (difficulty === 'Easy') return 3;
    if (difficulty === 'Medium') return 5;
    return 7;
  }, [difficulty]);

  const attemptsLeft = useMemo(() => Math.max(0, maxAttempts - attemptsUsed), [maxAttempts, attemptsUsed]);
  const passScore = useMemo(() => Math.floor(currentLevel.word.length * maxAttempts * 60), [currentLevel.word.length, maxAttempts]);
  const canAdvanceFromLevelOver = useMemo(() => levelScore >= passScore, [levelScore, passScore]);
  const revealLimit = useMemo(() => {
    if (difficulty === 'Easy') return 0;
    if (difficulty === 'Medium') return 2;
    return 4;
  }, [difficulty]);
  const revealUsesLeft = useMemo(() => {
    if (!Number.isFinite(revealLimit)) return null;
    return Math.max(0, revealLimit - revealUsesUsed);
  }, [revealLimit, revealUsesUsed]);

  // Persistence
  useEffect(() => {
    const loadSettings = async () => {
      let savedDifficulty = 'Easy';
      let savedLevelId = '1';
      let savedUnlocked = '1';
      let savedSoundEnabled = 'true';
      let savedBestScores = '{}';
      
      if (Platform.OS === 'web') {
        savedDifficulty = (localStorage.getItem(DIFFICULTY_KEY) as Difficulty) || 'Easy';
        savedLevelId = localStorage.getItem(CURRENT_LEVEL_ID_KEY) || '1';
        savedUnlocked = localStorage.getItem(UNLOCKED_LEVELS_KEY + savedDifficulty) || '1';
        savedSoundEnabled = localStorage.getItem(SOUND_ENABLED_KEY) || 'true';
        savedBestScores = localStorage.getItem(BEST_SCORES_KEY) || '{}';
      } else {
        savedDifficulty = (await SecureStore.getItemAsync(DIFFICULTY_KEY) as Difficulty) || 'Easy';
        savedLevelId = (await SecureStore.getItemAsync(CURRENT_LEVEL_ID_KEY)) || '1';
        savedUnlocked = (await SecureStore.getItemAsync(UNLOCKED_LEVELS_KEY + savedDifficulty)) || '1';
        savedSoundEnabled = (await SecureStore.getItemAsync(SOUND_ENABLED_KEY)) || 'true';
        savedBestScores = (await SecureStore.getItemAsync(BEST_SCORES_KEY)) || '{}';
      }
      
      setDifficulty(savedDifficulty as Difficulty);
      setCurrentLevelId(parseInt(savedLevelId, 10));
      setUnlockedLevelCount(parseInt(savedUnlocked, 10));
      setSoundEnabledState(savedSoundEnabled !== 'false');
      try {
        const parsed = JSON.parse(savedBestScores) as Record<string, number>;
        setBestScores(parsed && typeof parsed === 'object' ? parsed : {});
      } catch {
        setBestScores({});
      }
    };
    loadSettings();
  }, []);

  const saveProgression = async (levelId: number, unlockedCount: number, diff: Difficulty) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(CURRENT_LEVEL_ID_KEY, levelId.toString());
      localStorage.setItem(UNLOCKED_LEVELS_KEY + diff, unlockedCount.toString());
    } else {
      await SecureStore.setItemAsync(CURRENT_LEVEL_ID_KEY, levelId.toString());
      await SecureStore.setItemAsync(UNLOCKED_LEVELS_KEY + diff, unlockedCount.toString());
    }
  };

  const saveBestScores = async (scores: Record<string, number>) => {
    const raw = JSON.stringify(scores);
    if (Platform.OS === 'web') {
      localStorage.setItem(BEST_SCORES_KEY, raw);
    } else {
      await SecureStore.setItemAsync(BEST_SCORES_KEY, raw);
    }
  };

  const getBestScore = useCallback((levelId: number) => {
    const key = String(levelId);
    return bestScores[key] ?? 0;
  }, [bestScores]);

  const maybeUpdateBestScore = useCallback(async (levelId: number, score: number) => {
    const key = String(levelId);
    const nextScores = { ...bestScores };
    if (score <= (nextScores[key] ?? 0)) return;
    nextScores[key] = score;
    setBestScores(nextScores);
    await saveBestScores(nextScores);
  }, [bestScores]);

  const setSoundEnabled = useCallback(async (enabled: boolean) => {
    setSoundEnabledState(enabled);
    if (Platform.OS === 'web') {
      localStorage.setItem(SOUND_ENABLED_KEY, enabled ? 'true' : 'false');
    } else {
      await SecureStore.setItemAsync(SOUND_ENABLED_KEY, enabled ? 'true' : 'false');
    }
  }, []);

  useEffect(() => {
    attemptsUsedRef.current = attemptsUsed;
  }, [attemptsUsed]);

  useEffect(() => {
    levelScoreRef.current = levelScore;
  }, [levelScore]);

  useEffect(() => {
    let cancelled = false;

    const cleanupWebAudioUnlock = () => {
      if (!webAudioUnlockHandlerRef.current || typeof window === 'undefined') return;
      const handler = webAudioUnlockHandlerRef.current;
      window.removeEventListener('pointerdown', handler);
      window.removeEventListener('keydown', handler);
      window.removeEventListener('touchstart', handler);
      webAudioUnlockHandlerRef.current = null;
    };

    const syncMusic = async () => {
      try {
        if (Platform.OS === 'web') {
          cleanupWebAudioUnlock();

          if (!soundEnabled) {
            webAudioRef.current?.pause();
            return;
          }

          if (!webAudioRef.current && typeof window !== 'undefined') {
            const asset = Asset.fromModule(require('../../assets/music/bg.mp3'));
            const audio = new window.Audio(asset.uri);
            audio.loop = true;
            audio.volume = 0.6;
            audio.preload = 'auto';
            webAudioRef.current = audio;
          }

          const playWebAudio = async () => {
            if (!webAudioRef.current) return;
            try {
              await webAudioRef.current.play();
              cleanupWebAudioUnlock();
            } catch {
            }
          };

          await playWebAudio();

          if (webAudioRef.current && webAudioRef.current.paused && typeof window !== 'undefined') {
            const unlock = () => {
              void playWebAudio();
            };
            webAudioUnlockHandlerRef.current = unlock;
            window.addEventListener('pointerdown', unlock, { once: true });
            window.addEventListener('keydown', unlock, { once: true });
            window.addEventListener('touchstart', unlock, { once: true });
          }

          return;
        }

        if (!soundEnabled) {
          if (musicRef.current) {
            await musicRef.current.stopAsync();
            await musicRef.current.unloadAsync();
            musicRef.current = null;
          }
          return;
        }

        if (!musicRef.current) {
          await ExpoAudio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            shouldDuckAndroid: true,
          });
          const { sound } = await ExpoAudio.Sound.createAsync(
            require('../../assets/music/bg.mp3'),
            { isLooping: true, volume: 0.6, shouldPlay: true }
          );
          if (cancelled) {
            await sound.unloadAsync();
            return;
          }
          musicRef.current = sound;
          return;
        }

        await musicRef.current.playAsync();
      } catch {
      }
    };

    void syncMusic();

    return () => {
      cancelled = true;
      cleanupWebAudioUnlock();
    };
  }, [soundEnabled]);

  useEffect(() => {
    return () => {
      if (webAudioRef.current) {
        webAudioRef.current.pause();
        webAudioRef.current = null;
      }
      if (musicRef.current) {
        void musicRef.current.unloadAsync();
        musicRef.current = null;
      }
    };
  }, []);

  const updateDifficulty = async (newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
    
    let savedUnlocked = '1';
    if (Platform.OS === 'web') {
      savedUnlocked = localStorage.getItem(UNLOCKED_LEVELS_KEY + newDifficulty) || '1';
      localStorage.setItem(DIFFICULTY_KEY, newDifficulty);
    } else {
      savedUnlocked = (await SecureStore.getItemAsync(UNLOCKED_LEVELS_KEY + newDifficulty)) || '1';
      await SecureStore.setItemAsync(DIFFICULTY_KEY, newDifficulty);
    }
    
    const count = parseInt(savedUnlocked, 10);
    setUnlockedLevelCount(count);
    
    const firstLevel = LEVELS.find(l => l.difficulty === newDifficulty);
    if (firstLevel) {
      setCurrentLevelId(firstLevel.id);
      saveProgression(firstLevel.id, count, newDifficulty);
    }
  };

  const selectLevel = (levelId: number) => {
    setCurrentLevelId(levelId);
    saveProgression(levelId, unlockedLevelCount, difficulty);
    router.push('/game');
  };

  const generateGrid = useCallback((word: string) => {
    const newGrid: Tile[][] = [];
    const chars = word.toUpperCase().split('');
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for (let r = 0; r < GRID_SIZE; r++) {
      const row: Tile[] = [];
      for (let c = 0; c < GRID_SIZE; c++) {
        row.push({ id: `${r}-${c}-${Math.random()}`, char: '', row: r, col: c });
      }
      newGrid.push(row);
    }

    const deltas = [
      { dr: 1, dc: 0 },
      { dr: -1, dc: 0 },
      { dr: 0, dc: 1 },
      { dr: 0, dc: -1 },
    ];

    let placedPath: { row: number; col: number }[] | null = null;

    const tryPlace = () => {
      const startRow = Math.floor(Math.random() * GRID_SIZE);
      const startCol = Math.floor(Math.random() * GRID_SIZE);
      const path: { row: number; col: number }[] = [{ row: startRow, col: startCol }];
      const used = new Set<string>([`${startRow},${startCol}`]);

      for (let i = 1; i < chars.length; i++) {
        const last = path[path.length - 1];
        const candidates = deltas
          .map(d => ({ row: last.row + d.dr, col: last.col + d.dc }))
          .filter(p => p.row >= 0 && p.row < GRID_SIZE && p.col >= 0 && p.col < GRID_SIZE)
          .filter(p => !used.has(`${p.row},${p.col}`));

        if (candidates.length === 0) return null;

        const next = candidates[Math.floor(Math.random() * candidates.length)];
        path.push(next);
        used.add(`${next.row},${next.col}`);
      }

      return path;
    };

    for (let attempt = 0; attempt < 300; attempt++) {
      const path = tryPlace();
      if (path) {
        placedPath = path;
        break;
      }
    }

    if (!placedPath) {
      const fallback: { row: number; col: number }[] = [];
      for (let i = 0; i < Math.min(chars.length, GRID_SIZE * GRID_SIZE); i++) {
        fallback.push({ row: Math.floor(i / GRID_SIZE), col: i % GRID_SIZE });
      }
      placedPath = fallback;
    }

    placedPath.forEach((p, i) => {
      if (i < chars.length) newGrid[p.row][p.col].char = chars[i];
    });
    setTargetWordPath(placedPath.slice(0, chars.length));

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (newGrid[r][c].char === '') {
          newGrid[r][c].char = alphabet[Math.floor(Math.random() * alphabet.length)];
        }
      }
    }

    setGrid(newGrid);
  }, []);

  useEffect(() => {
    if (currentLevel) {
      generateGrid(currentLevel.word);
      setSelectedIndices([]);
      setCurrentWord('');
      setIsCorrect(null);
      setHintPath([]);
      setShowErrorPopup(false);
      setAttemptsUsed(0);
      setLevelScore(0);
      setRevealUsesUsed(0);
      setShowLevelOverModal(false);
    }
  }, [currentLevelId, difficulty, generateGrid]);

  const onTouchStart = (row: number, col: number) => {
    if (!grid[row] || !grid[row][col]) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedIndices([{ row, col }]);
    setCurrentWord(grid[row][col].char);
    setHintPath([]);
    setShowErrorPopup(false);
    setIsCorrect(null);
  };

  const onTouchMove = (row: number, col: number) => {
    if (!grid[row] || !grid[row][col]) return;
    const last = selectedIndices[selectedIndices.length - 1];
    if (!last) return;

    if (last.row === row && last.col === col) return;

    const alreadyIndex = selectedIndices.findIndex(idx => idx.row === row && idx.col === col);
    if (alreadyIndex !== -1) {
      if (selectedIndices.length > 1) {
        const previous = selectedIndices[selectedIndices.length - 2];
        if (previous.row === row && previous.col === col) {
          Haptics.selectionAsync();
          setSelectedIndices(prev => prev.slice(0, -1));
          setCurrentWord(prev => prev.slice(0, -1));
          return;
        }
      }
      return;
    }

    const isAdjacent = Math.abs(row - last.row) + Math.abs(col - last.col) === 1;
    if (!isAdjacent) return;

    Haptics.selectionAsync();
    setSelectedIndices(prev => [...prev, { row, col }]);
    setCurrentWord(prev => prev + grid[row][col].char);
  };

  const onTouchEnd = async () => {
    if (currentWord.length === 0) return;
    const nextAttemptsUsed = attemptsUsedRef.current + 1;
    setAttemptsUsed(nextAttemptsUsed);
    attemptsUsedRef.current = nextAttemptsUsed;

    const target = currentLevel.word.toUpperCase();
    const reversedTarget = target.split('').reverse().join('');
    const isWordCorrect = currentWord === target || currentWord === reversedTarget;

    if (isWordCorrect) {
      const pointsPerTile = 100;
      const attemptPoints = Math.max(1, selectedIndices.length) * pointsPerTile;
      let nextScore = levelScoreRef.current + attemptPoints;
      setIsCorrect(true);
      nextScore += 1000;
      setLevelScore(nextScore);
      levelScoreRef.current = nextScore;
      await maybeUpdateBestScore(currentLevel.id, nextScore);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => {
        const nextLevelInDifficulty = filteredLevels[currentLevelIndex + 1];
        let newUnlockedCount = unlockedLevelCount;
        if (currentLevelIndex + 1 === unlockedLevelCount && unlockedLevelCount < 20) {
          newUnlockedCount = unlockedLevelCount + 1;
          setUnlockedLevelCount(newUnlockedCount);
        }
        if (nextLevelInDifficulty) {
          setCurrentLevelId(nextLevelInDifficulty.id);
          saveProgression(nextLevelInDifficulty.id, newUnlockedCount, difficulty);
        } else {
          router.replace('/game-over');
        }
      }, 1500);
    } else {
      setIsCorrect(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      if (nextAttemptsUsed >= maxAttempts) {
        setShowLevelOverModal(true);
        setSelectedIndices([]);
        setCurrentWord('');
        setHintPath([]);
        setShowErrorPopup(false);
        return;
      }

      setShowErrorPopup(true);
      setTimeout(() => {
        setSelectedIndices([]);
        setCurrentWord('');
        setIsCorrect(null);
        setTimeout(() => setShowErrorPopup(false), 2000);
      }, 1000);
    }
  };

  const revealHint = () => {
    if (difficulty === 'Easy') return;
    if (revealUsesUsed >= revealLimit) return;
    if (targetWordPath.length === 0) return;
    setRevealUsesUsed(prev => prev + 1);
    setHintPath(targetWordPath);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTimeout(() => setHintPath([]), 3000);
  };

  const replayLevel = () => {
    setShowLevelOverModal(false);
    setSelectedIndices([]);
    setCurrentWord('');
    setIsCorrect(null);
    setHintPath([]);
    setShowErrorPopup(false);
    setAttemptsUsed(0);
    attemptsUsedRef.current = 0;
    setLevelScore(0);
    levelScoreRef.current = 0;
    setRevealUsesUsed(0);
    generateGrid(currentLevel.word);
  };

  const closeLevelOverModal = () => {
    setShowLevelOverModal(false);
  };

  const advanceFromLevelOver = () => {
    if (!canAdvanceFromLevelOver) return;
    setShowLevelOverModal(false);
    const nextLevelInDifficulty = filteredLevels[currentLevelIndex + 1];
    let newUnlockedCount = unlockedLevelCount;
    if (currentLevelIndex + 1 === unlockedLevelCount && unlockedLevelCount < 20) {
      newUnlockedCount = unlockedLevelCount + 1;
      setUnlockedLevelCount(newUnlockedCount);
    }
    if (nextLevelInDifficulty) {
      setCurrentLevelId(nextLevelInDifficulty.id);
      saveProgression(nextLevelInDifficulty.id, newUnlockedCount, difficulty);
    } else {
      router.replace('/game-over');
    }
  };

  const resetGame = async () => {
    if (Platform.OS === 'web') {
      localStorage.clear();
    } else {
      await SecureStore.deleteItemAsync(DIFFICULTY_KEY);
      await SecureStore.deleteItemAsync(CURRENT_LEVEL_ID_KEY);
      await SecureStore.deleteItemAsync(UNLOCKED_LEVELS_KEY + 'Easy');
      await SecureStore.deleteItemAsync(UNLOCKED_LEVELS_KEY + 'Medium');
      await SecureStore.deleteItemAsync(UNLOCKED_LEVELS_KEY + 'Hard');
      await SecureStore.deleteItemAsync(SOUND_ENABLED_KEY);
      await SecureStore.deleteItemAsync(BEST_SCORES_KEY);
    }
    setDifficulty('Easy');
    setCurrentLevelId(1);
    setUnlockedLevelCount(1);
    setSoundEnabledState(true);
    setBestScores({});
  };

  return (
    <GameContext.Provider value={{
      currentLevel,
      currentLevelIndex,
      grid,
      selectedIndices,
      currentWord,
      isCorrect,
      hintPath,
      difficulty,
      soundEnabled,
      setSoundEnabled,
      showErrorPopup,
      unlockedLevelCount,
      filteredLevels,
      maxAttempts,
      attemptsUsed,
      attemptsLeft,
      levelScore,
      passScore,
      revealUsesUsed,
      revealUsesLeft,
      showLevelOverModal,
      canAdvanceFromLevelOver,
      replayLevel,
      closeLevelOverModal,
      advanceFromLevelOver,
      getBestScore,
      onTouchStart, onTouchMove, onTouchEnd, revealHint, resetGame,
      updateDifficulty, selectLevel, currentLevelId
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
