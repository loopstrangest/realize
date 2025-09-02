import { LevelProps } from '../types/game';
import LevelIntro from '../levels/levelIntro';
import LevelSpinningCircle from '../levels/levelSpinningCircle';
import LevelScreensaver from '../levels/levelScreensaver';
import LevelSpotlight from '../levels/levelSpotlight';
import LevelDropdown from '../levels/levelDropdown';
import LeveliMessage from '../levels/leveliMessage';
import LevelT9Phone from '../levels/levelT9Phone';
import LevelWordSearch from '../levels/levelWordSearch';
import LevelBasket from '../levels/levelBasket';
import LevelGettysburg from '../levels/levelGettysburg';
import LevelHangman from '../levels/levelHangman';
import LevelLoading from '../levels/levelLoading';
import LevelPlayPause from '../levels/levelPlayPause';
import LevelVowels from '../levels/levelVowels';
import LevelFakeCongrats from '../levels/levelFakeCongrats';

export interface LevelConfig {
  id: number;
  name: string;
  component: React.ComponentType<LevelProps>;
}

export const LEVEL_REGISTRY: LevelConfig[] = [
  {
    id: 1,
    name: 'levelIntro',
    component: LevelIntro,
  },
  {
    id: 2,
    name: 'levelScreensaver',
    component: LevelScreensaver,
  },
  {
    id: 3,
    name: 'levelSpinningCircle',
    component: LevelSpinningCircle,
  },
  {
    id: 4,
    name: 'levelSpotlight',
    component: LevelSpotlight,
  },
  {
    id: 5,
    name: 'levelDropdown',
    component: LevelDropdown,
  },
  {
    id: 6,
    name: 'leveliMessage',
    component: LeveliMessage,
  },
  {
    id: 7,
    name: 'levelT9Phone',
    component: LevelT9Phone,
  },
  {
    id: 8,
    name: 'levelWordSearch',
    component: LevelWordSearch,
  },
  {
    id: 9,
    name: 'levelBasket',
    component: LevelBasket,
  },
  {
    id: 10,
    name: 'levelGettysburg',
    component: LevelGettysburg,
  },
  {
    id: 11,
    name: 'levelHangman',
    component: LevelHangman,
  },
  {
    id: 12,
    name: 'levelLoading',
    component: LevelLoading,
  },
  {
    id: 13,
    name: 'levelPlayPause',
    component: LevelPlayPause,
  },
  {
    id: 14,
    name: 'levelVowels',
    component: LevelVowels,
  },
  {
    id: 15,
    name: 'levelFakeCongrats',
    component: LevelFakeCongrats,
  },
];

export const getLevelById = (id: number): LevelConfig | undefined => {
  return LEVEL_REGISTRY.find(level => level.id === id);
};

export const getTotalLevels = (): number => {
  return LEVEL_REGISTRY.length;
};