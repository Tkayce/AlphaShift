import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import * as Haptics from 'expo-haptics';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { LEVELS, LevelData, Difficulty } from '../utils/dictionaryData';
import { useRouter } from 'expo-router';

const UNLOCKED_LEVELS_KEY = 'ALPHASHIFT_UNLOCKED_LEVELS_';
const DIFFICULTY_KEY = 'ALPHASHIFT_DIFFICULTY';
const CURRENT_LEVEL_ID_KEY = 'ALPHASHIFT_CURRENT_LEVEL_ID';
const GRID_SIZE = 5;

export interface Tile {
  id: string;
  char: string;
  row: number;
  col: number;
}

interface GameContextType {
  currentLevel: LevelData;
  grid: Tile[][];
  selectedIndices: { row: number; col: number }[];
  currentWord: string;
  isCorrect: boolean | null;
  hintPath: { row: number; col: number }[];
  difficulty: Difficulty;
  showErrorPopup: boolean;
  unlockedLevelCount: number;
  filteredLevels: LevelData[];
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
  
  const [grid, setGrid] = useState<Tile[][]>([]);
  const [selectedIndices, setSelectedIndices] = useState<{ row: number; col: number }[]>([]);
  const [currentWord, setCurrentWord] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [hintPath, setHintPath] = useState<{ row: number; col: number }[]>([]);
  const [targetWordPath, setTargetWordPath] = useState<{ row: number; col: number }[]>([]);
  const [showErrorPopup, setShowErrorPopup] = useState(false);

  const filteredLevels = useMemo(() => 
    LEVELS.filter(l => l.difficulty === difficulty),
    [difficulty]
  );

  const currentLevel: LevelData = useMemo(() => 
    LEVELS.find(l => l.id === currentLevelId) || filteredLevels[0] || LEVELS[0],
    [currentLevelId, filteredLevels]
  );

  // Persistence
  useEffect(() => {
    const loadSettings = async () => {
      let savedDifficulty = 'Easy';
      let savedLevelId = '1';
      let savedUnlocked = '1';
      
      if (Platform.OS === 'web') {
        savedDifficulty = (localStorage.getItem(DIFFICULTY_KEY) as Difficulty) || 'Easy';
        savedLevelId = localStorage.getItem(CURRENT_LEVEL_ID_KEY) || '1';
        savedUnlocked = localStorage.getItem(UNLOCKED_LEVELS_KEY + savedDifficulty) || '1';
      } else {
        savedDifficulty = (await SecureStore.getItemAsync(DIFFICULTY_KEY) as Difficulty) || 'Easy';
        savedLevelId = (await SecureStore.getItemAsync(CURRENT_LEVEL_ID_KEY)) || '1';
        savedUnlocked = (await SecureStore.getItemAsync(UNLOCKED_LEVELS_KEY + savedDifficulty)) || '1';
      }
      
      setDifficulty(savedDifficulty as Difficulty);
      setCurrentLevelId(parseInt(savedLevelId, 10));
      setUnlockedLevelCount(parseInt(savedUnlocked, 10));
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

    let success = false;
    const directions = ['H', 'V'];
    const startPositions = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => ({
      r: Math.floor(i / GRID_SIZE),
      c: i % GRID_SIZE
    })).sort(() => Math.random() - 0.5);

    for (const pos of startPositions) {
      const shuffledDirs = [...directions].sort(() => Math.random() - 0.5);
      for (const dir of shuffledDirs) {
        const path: { row: number; col: number }[] = [];
        let canPlace = true;

        for (let i = 0; i < chars.length; i++) {
          const nr = dir === 'V' ? pos.r + i : pos.r;
          const nc = dir === 'H' ? pos.c + i : pos.c;

          if (nr < 0 || nr >= GRID_SIZE || nc < 0 || nc >= GRID_SIZE) {
            canPlace = false;
            break;
          }
          path.push({ row: nr, col: nc });
        }

        if (canPlace) {
          path.forEach((p, i) => {
            newGrid[p.row][p.col].char = chars[i];
          });
          setTargetWordPath(path);
          success = true;
          break;
        }
      }
      if (success) break;
    }

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
    }
  }, [currentLevelId, difficulty, generateGrid]);

  const onTouchStart = (row: number, col: number) => {
    if (!grid[row] || !grid[row][col]) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedIndices([{ row, col }]);
    setCurrentWord(grid[row][col].char);
    setHintPath([]);
    setShowErrorPopup(false);
  };

  const onTouchMove = (row: number, col: number) => {
    if (!grid[row] || !grid[row][col]) return;
    const first = selectedIndices[0];
    const last = selectedIndices[selectedIndices.length - 1];
    if (!first || !last) return;

    if (selectedIndices.some(idx => idx.row === row && idx.col === col)) {
      if (selectedIndices.length > 1) {
        const secondToLast = selectedIndices[selectedIndices.length - 2];
        if (secondToLast.row === row && secondToLast.col === col) {
          Haptics.selectionAsync();
          setSelectedIndices(prev => prev.slice(0, -1));
          setCurrentWord(prev => prev.slice(0, -1));
          return;
        }
      }
      return;
    }

    const isHorizontal = row === first.row;
    const isVertical = col === first.col;
    if (!isHorizontal && !isVertical) return;

    const rowDiff = row - last.row;
    const colDiff = col - last.col;
    const rowStep = Math.sign(rowDiff);
    const colStep = Math.sign(colDiff);

    if ((rowDiff !== 0 && colDiff === 0) || (rowDiff === 0 && colDiff !== 0)) {
      const steps = Math.max(Math.abs(rowDiff), Math.abs(colDiff));
      let tempIndices = [...selectedIndices];
      let tempWord = currentWord;
      let addedAny = false;

      for (let i = 1; i <= steps; i++) {
        const nextR = last.row + rowStep * i;
        const nextC = last.col + colStep * i;
        if (!grid[nextR] || !grid[nextR][nextC]) break;
        if (!tempIndices.some(idx => idx.row === nextR && idx.col === nextC)) {
          tempIndices.push({ row: nextR, col: nextC });
          tempWord += grid[nextR][nextC].char;
          addedAny = true;
        }
      }

      if (addedAny) {
        Haptics.selectionAsync();
        setSelectedIndices(tempIndices);
        setCurrentWord(tempWord);
      }
    }
  };

  const onTouchEnd = async () => {
    if (currentWord.length === 0) return;
    if (currentWord === currentLevel.word.toUpperCase()) {
      setIsCorrect(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => {
        const currentIndexInDifficulty = filteredLevels.findIndex(l => l.id === currentLevelId);
        const nextLevelInDifficulty = filteredLevels[currentIndexInDifficulty + 1];
        let newUnlockedCount = unlockedLevelCount;
        if (currentIndexInDifficulty + 1 === unlockedLevelCount && unlockedLevelCount < 20) {
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
      setShowErrorPopup(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setTimeout(() => {
        setSelectedIndices([]);
        setCurrentWord('');
        setIsCorrect(null);
        setTimeout(() => setShowErrorPopup(false), 2000);
      }, 1000);
    }
  };

  const revealHint = () => {
    setHintPath(targetWordPath);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTimeout(() => setHintPath([]), 3000);
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
    }
    setDifficulty('Easy');
    setCurrentLevelId(1);
    setUnlockedLevelCount(1);
  };

  return (
    <GameContext.Provider value={{
      currentLevel, grid, selectedIndices, currentWord, isCorrect, hintPath,
      difficulty, showErrorPopup, unlockedLevelCount, filteredLevels,
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
