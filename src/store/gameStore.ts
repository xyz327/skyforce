import { create } from 'zustand';
import { CONFIG } from '../game/config';

// 游戏状态类型
export type GameState = 'menu' | 'playing' | 'paused' | 'gameover';

// 玩家数据接口
interface PlayerData {
  health: number;
  maxHealth: number;
  score: number;
  level: number;
  experience: number;
  expToNextLevel: number;
  fireRate: number; // 发/秒
  bulletLanes: number; // 弹道数
  bulletDamage: number;
  hasShield: boolean;
  shieldEndTime: number;
}

// 游戏进度接口
interface ProgressData {
  distance: number; // 飞行距离（米）
  enemiesKilled: number;
  playTime: number; // 毫秒
}

// 难度数据接口
interface DifficultyData {
  level: number;
  enemyHealthMultiplier: number;
  enemyDamageMultiplier: number;
  spawnRateMultiplier: number;
}

// Store 接口
interface GameStore {
  // 状态
  gameState: GameState;
  player: PlayerData;
  progress: ProgressData;
  difficulty: DifficultyData;
  
  // Actions
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
  resetGame: () => void;
  
  // 玩家 Actions
  updateScore: (points: number) => void;
  addExperience: (exp: number) => void;
  takeDamage: (damage: number) => void;
  heal: (amount: number) => void;
  activateShield: () => void;
  deactivateShield: () => void;
  
  // 进度 Actions
  updateDistance: (delta: number) => void;
  incrementKills: () => void;
  updatePlayTime: (delta: number) => void;
  
  // 难度 Actions
  updateDifficulty: () => void;
}

// 计算升级所需经验
const getExpForLevel = (level: number): number => {
  return Math.floor(CONFIG.UPGRADE.BASE_EXP * Math.pow(CONFIG.UPGRADE.EXP_MULTIPLIER, level - 1));
};

// 初始玩家数据
const initialPlayerData: PlayerData = {
  health: CONFIG.PLAYER.MAX_HEALTH,
  maxHealth: CONFIG.PLAYER.MAX_HEALTH,
  score: 0,
  level: 1,
  experience: 0,
  expToNextLevel: getExpForLevel(1),
  fireRate: CONFIG.PLAYER.INITIAL_FIRE_RATE,
  bulletLanes: 1,
  bulletDamage: CONFIG.PLAYER.BULLET_DAMAGE,
  hasShield: false,
  shieldEndTime: 0,
};

// 初始进度数据
const initialProgressData: ProgressData = {
  distance: 0,
  enemiesKilled: 0,
  playTime: 0,
};

// 初始难度数据
const initialDifficultyData: DifficultyData = {
  level: 1,
  enemyHealthMultiplier: 1,
  enemyDamageMultiplier: 1,
  spawnRateMultiplier: 1,
};

export const useGameStore = create<GameStore>((set, get) => ({
  // 初始状态
  gameState: 'menu',
  player: { ...initialPlayerData },
  progress: { ...initialProgressData },
  difficulty: { ...initialDifficultyData },
  
  // 游戏流程控制
  startGame: () => set({ gameState: 'playing' }),
  
  pauseGame: () => set({ gameState: 'paused' }),
  
  resumeGame: () => set({ gameState: 'playing' }),
  
  endGame: () => set({ gameState: 'gameover' }),
  
  resetGame: () => set({
    gameState: 'menu',
    player: { ...initialPlayerData },
    progress: { ...initialProgressData },
    difficulty: { ...initialDifficultyData },
  }),
  
  // 玩家相关
  updateScore: (points: number) => set((state) => ({
    player: {
      ...state.player,
      score: state.player.score + points,
    },
  })),
  
  addExperience: (exp: number) => set((state) => {
    let { experience, expToNextLevel, level, fireRate, bulletLanes, bulletDamage } = state.player;
    experience += exp;
    
    // 检查升级
    while (experience >= expToNextLevel) {
      experience -= expToNextLevel;
      level++;
      
      // 提升射速
      if (fireRate < CONFIG.PLAYER.MAX_FIRE_RATE) {
        fireRate += CONFIG.UPGRADE.FIRE_RATE_INCREASE;
        if (fireRate > CONFIG.PLAYER.MAX_FIRE_RATE) {
          fireRate = CONFIG.PLAYER.MAX_FIRE_RATE;
        }
      } else {
        // 射速达到上限，减半并增加弹道
        if (bulletLanes < CONFIG.UPGRADE.MAX_BULLET_LANES) {
          fireRate = CONFIG.PLAYER.MAX_FIRE_RATE / 2;
          bulletLanes++;
        }
      }
      
      // 增加伤害
      bulletDamage = CONFIG.PLAYER.BULLET_DAMAGE + (level - 1) * 2;
      
      expToNextLevel = getExpForLevel(level);
    }
    
    return {
      player: {
        ...state.player,
        experience,
        expToNextLevel,
        level,
        fireRate,
        bulletLanes,
        bulletDamage,
      },
    };
  }),
  
  takeDamage: (damage: number) => {
    const state = get();
    // 护盾状态不受伤害
    if (state.player.hasShield && Date.now() < state.player.shieldEndTime) {
      return;
    }
    
    const newHealth = Math.max(0, state.player.health - damage);
    set({
      player: {
        ...state.player,
        health: newHealth,
      },
    });
    
    // 血量为0时游戏结束
    if (newHealth <= 0) {
      get().endGame();
    }
  },
  
  heal: (amount: number) => {
    const state = get();
    const newHealth = Math.min(state.player.maxHealth, state.player.health + amount);
    set({
      player: {
        ...state.player,
        health: newHealth,
      },
    });
  },
  
  activateShield: () => set((state) => ({
    player: {
      ...state.player,
      hasShield: true,
      shieldEndTime: Date.now() + CONFIG.SHIELD_DURATION,
    },
  })),
  
  deactivateShield: () => set((state) => ({
    player: {
      ...state.player,
      hasShield: false,
      shieldEndTime: 0,
    },
  })),
  
  // 进度相关
  updateDistance: (delta: number) => set((state) => ({
    progress: {
      ...state.progress,
      distance: state.progress.distance + delta,
    },
  })),
  
  incrementKills: () => set((state) => ({
    progress: {
      ...state.progress,
      enemiesKilled: state.progress.enemiesKilled + 1,
    },
  })),
  
  updatePlayTime: (delta: number) => set((state) => ({
    progress: {
      ...state.progress,
      playTime: state.progress.playTime + delta,
    },
  })),
  
  // 难度相关
  updateDifficulty: () => set((state) => {
    const newLevel = Math.floor(state.progress.distance / CONFIG.DIFFICULTY.DISTANCE_PER_LEVEL) + 1;
    
    if (newLevel !== state.difficulty.level) {
      return {
        difficulty: {
          level: newLevel,
          enemyHealthMultiplier: 1 + (newLevel - 1) * CONFIG.DIFFICULTY.HEALTH_MULTIPLIER,
          enemyDamageMultiplier: 1 + (newLevel - 1) * CONFIG.DIFFICULTY.DAMAGE_MULTIPLIER,
          spawnRateMultiplier: 1 + (newLevel - 1) * CONFIG.DIFFICULTY.SPAWN_RATE_MULTIPLIER,
        },
      };
    }
    return state;
  }),
}));
