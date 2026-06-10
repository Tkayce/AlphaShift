import { useGame } from '../context/GameContext';
export { Tile } from '../context/GameContext';

export const useSpellingEngine = () => {
  return useGame();
};
