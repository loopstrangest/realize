import { LevelProps } from '../types/game';
import LevelIntro from '../levels/levelIntro';
import LevelSpinningCircle from '../levels/levelSpinningCircle';
import LevelScreensaver from '../levels/levelScreensaver';

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
    name: 'levelSpinningCircle',
    component: LevelSpinningCircle,
  },
  {
    id: 3,
    name: 'levelScreensaver',
    component: LevelScreensaver,
  },
];

export const getLevelById = (id: number): LevelConfig | undefined => {
  return LEVEL_REGISTRY.find(level => level.id === id);
};

export const getTotalLevels = (): number => {
  return LEVEL_REGISTRY.length;
};