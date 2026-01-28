import { create } from 'zustand';
import { CONFIG, type DifficultyMode } from '../game/config';
import { fetchLeaderboard, submitScore, type LeaderboardEntry } from '../lib/supabase';

// 游戏状态类型
export type GameState = 'menu' | 'playing' | 'paused' | 'gameover';

// 生成随机用户名
const generateRandomUsername = () => {
  const adjectives = ['Swift', 'Brave', 'Cosmic', 'Hyper', 'Neon', 'Shadow', 'Iron', 'Star'];
  const nouns = ['Pilot', 'Eagle', 'Ace', 'Hawk', 'Falcon', 'Raptor', 'Viper', 'Wing'];
  const randomNum = Math.floor(Math.random() * 1000);
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}${randomNum}`;
};

// 获取初始用户名（如果本地有则使用，没有则生成并保存）
const getInitialUsername = () => {
  const stored = localStorage.getItem('skyforce_username');
  if (stored) return stored;
  
  const newUsername = generateRandomUsername();
  localStorage.setItem('skyforce_username', newUsername);
  return newUsername;
};

// 玩家数据接口
interface PlayerData {
  username: string;
  personalBest: number;
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
  mode: DifficultyMode;
  level: number;
  enemyHealthMultiplier: number;
  enemyDamageMultiplier: number;
  spawnRateMultiplier: number;
  propDropMultiplier: number;
}

// Store 接口
interface GameStore {
  // 状态
  gameState: GameState;
  player: PlayerData;
  progress: ProgressData;
  difficulty: DifficultyData;
  leaderboard: LeaderboardEntry[];
  
  // Actions
  setUsername: (name: string) => void;
  setDifficultyMode: (mode: DifficultyMode) => void;
  loadLeaderboard: () => Promise<void>;
  submitHighScore: () => Promise<void>;
  
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
  username: getInitialUsername(),
  personalBest: Number(localStorage.getItem('skyforce_pb')) || 0,
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
  mode: 'EASY',
  level: 1,
  enemyHealthMultiplier: CONFIG.DIFFICULTY_MODES.EASY.healthMultiplier,
  enemyDamageMultiplier: 1,
  spawnRateMultiplier: 1,
  propDropMultiplier: CONFIG.DIFFICULTY_MODES.EASY.propDropMultiplier,
};

export const useGameStore = create<GameStore>((set, get) => ({
  // 初始状态
  gameState: 'menu',
  player: { ...initialPlayerData },
  progress: { ...initialProgressData },
  difficulty: { ...initialDifficultyData },
  leaderboard: [],
  
  // Actions
  setUsername: (username: string) => set((state) => {
    localStorage.setItem('skyforce_username', username);
    return {
      player: { ...state.player, username }
    };
  }),

  setDifficultyMode: (mode: DifficultyMode) => set(() => {
    const settings = CONFIG.DIFFICULTY_MODES[mode];
    // 重置难度等级和倍率
    return {
      difficulty: {
        mode,
        level: 1,
        enemyHealthMultiplier: settings.healthMultiplier,
        enemyDamageMultiplier: 1,
        spawnRateMultiplier: 1,
        propDropMultiplier: settings.propDropMultiplier,
      }
    };
  }),

  loadLeaderboard: async () => {
    const data = await fetchLeaderboard();
    set({ leaderboard: data });
  },

  submitHighScore: async () => {
    const { player, progress } = get();
    const distance = Math.floor(progress.distance);
    
    // 更新个人最佳
    if (distance > player.personalBest) {
      set((state) => ({
        player: { ...state.player, personalBest: distance }
      }));
      localStorage.setItem('skyforce_pb', distance.toString());
    }

    // 上传分数
    await submitScore(player.username, distance);
    
    // 重新获取排行榜
    const data = await fetchLeaderboard();
    set({ leaderboard: data });
  },

  // 游戏流程控制
  startGame: () => set({ gameState: 'playing' }),
  
  pauseGame: () => set({ gameState: 'paused' }),
  
  resumeGame: () => set({ gameState: 'playing' }),
  
  endGame: () => {
    const { submitHighScore } = get();
    submitHighScore();
    set({ gameState: 'gameover' });
  },
  
  resetGame: () => {
    const { player } = get();
    // 保持 username 和 personalBest
    set({
      gameState: 'menu',
      player: { 
        ...initialPlayerData, 
        username: player.username,
        personalBest: player.personalBest 
      },
      progress: { ...initialProgressData },
      difficulty: { ...initialDifficultyData },
    });
  },
  
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
      const modeSettings = CONFIG.DIFFICULTY_MODES[state.difficulty.mode];
      return {
        difficulty: {
          ...state.difficulty,
          level: newLevel,
          enemyHealthMultiplier: modeSettings.healthMultiplier + (newLevel - 1) * CONFIG.DIFFICULTY.HEALTH_MULTIPLIER,
          enemyDamageMultiplier: 1 + (newLevel - 1) * CONFIG.DIFFICULTY.DAMAGE_MULTIPLIER,
          spawnRateMultiplier: 1 + (newLevel - 1) * CONFIG.DIFFICULTY.SPAWN_RATE_MULTIPLIER,
        },
      };
    }
    return state;
  }),
}));
