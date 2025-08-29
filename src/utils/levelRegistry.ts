import { LevelProps } from '../types/game';
import LevelIntro from '../levels/levelIntro';
import LevelSpinningCircle from '../levels/levelSpinningCircle';
import LevelScreensaver from '../levels/levelScreensaver';
import LevelSpotlight from '../levels/levelSpotlight';
import LevelDropdown from '../levels/levelDropdown';
import LeveliMessage from '../levels/leveliMessage';
import LevelT9Phone from '../levels/levelT9Phone';
import LevelWordSearch from '../levels/levelWordSearch';

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
];

export const getLevelById = (id: number): LevelConfig | undefined => {
  return LEVEL_REGISTRY.find(level => level.id === id);
};

export const getTotalLevels = (): number => {
  return LEVEL_REGISTRY.length;
};