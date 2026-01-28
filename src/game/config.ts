// 游戏配置常量
export const CONFIG = {
  // 游戏画布
  GAME_WIDTH: 360,
  GAME_HEIGHT: 640,
  PIXEL_RATIO: 2, // 像素风格缩放比例
  
  // 玩家配置
  PLAYER: {
    WIDTH: 32,
    HEIGHT: 32,
    MAX_HEALTH: 100,
    INITIAL_FIRE_RATE: 2, // 发/秒
    MAX_FIRE_RATE: 10,
    BULLET_DAMAGE: 10,
    BULLET_SPEED: 400, // 像素/秒
    SPEED: 300, // 像素/秒
  },
  
  // 敌人配置
  ENEMY: {
    SMALL: { width: 24, height: 24, health: 20, damage: 10, score: 10, speed: 80, fireRate: 0.5 },
    MEDIUM: { width: 32, height: 32, health: 50, damage: 20, score: 30, speed: 60, fireRate: 0.8 },
    LARGE: { width: 48, height: 48, health: 100, damage: 30, score: 50, speed: 40, fireRate: 1 },
  },
  ENEMY_SPAWN_INTERVAL: 2000, // 毫秒
  ENEMY_BULLET_SPEED: 200, // 像素/秒
  ENEMY_BULLET_DAMAGE: 10,
  
  // 道具配置
  PROP: {
    WIDTH: 24,
    HEIGHT: 24,
    SPEED: 100, // 掉落速度
  },
  SHIELD_DURATION: 10000, // 毫秒
  SHIELD_DROP_CHANCE: 0.1, // 3%
  NUKE_DROP_CHANCE: 0.1, // 1%
  MISSILE_DROP_CHANCE: 0.1, // 5% 呼叫导弹
  RESCUE_DROP_CHANCE: 0.1, // 5% 召唤救援
  MISSILE_DAMAGE_MULTIPLIER: 3, // 导弹伤害倍率 300%
  RESCUE_HEAL_PERCENT: 0.3, // 恢复30%血量
  
  // 难度配置
  DIFFICULTY: {
    DISTANCE_PER_LEVEL: 1000, // 每1000米升级难度
    HEALTH_MULTIPLIER: 0.2, // 每级+20%血量
    DAMAGE_MULTIPLIER: 0.15, // 每级+15%伤害
    SPAWN_RATE_MULTIPLIER: 0.3, // 每级+30%生成速度
  },
  
  // 升级配置
  UPGRADE: {
    BASE_EXP: 10, // 基础升级经验
    EXP_MULTIPLIER: 1.2, // 经验递增倍率
    FIRE_RATE_INCREASE: 1, // 每级射速增加
    MAX_BULLET_LANES: 4, // 最大弹道数
  },
  
  // 飞行速度（用于计算飞行距离）
  FLIGHT_SPEED: 100, // 米/秒
};

// 敌人类型
export type EnemyType = 'SMALL' | 'MEDIUM' | 'LARGE';

// 道具类型
export type PropType = 'SHIELD' | 'NUKE' | 'MISSILE' | 'RESCUE';

// 子弹归属
export type BulletOwner = 'player' | 'enemy';
