// 基础实体接口
export interface Entity {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  velocityX: number;
  velocityY: number;
  active: boolean;
}

// 玩家实体
export interface Player extends Entity {
  health: number;
  maxHealth: number;
  fireRate: number;
  bulletLanes: number;
  bulletDamage: number;
  lastFireTime: number;
  hasShield: boolean;
  shieldEndTime: number;
}

// 敌人实体
export interface Enemy extends Entity {
  enemyType: 'SMALL' | 'MEDIUM' | 'LARGE';
  health: number;
  maxHealth: number;
  damage: number;
  scoreValue: number;
  fireRate: number;
  lastFireTime: number;
}

// 子弹实体
export interface Bullet extends Entity {
  damage: number;
  owner: 'player' | 'enemy';
}

// 道具实体
export interface Prop extends Entity {
  propType: 'SHIELD' | 'NUKE' | 'MISSILE' | 'RESCUE';
}

// 导弹实体（呼叫导弹道具产生的）
export interface Missile extends Entity {
  damage: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  progress: number; // 0-1 飞行进度
  hitEnemies: string[]; // 已攻击过的敌人ID
}

// 救援飞机实体
export interface RescuePlane extends Entity {
  healAmount: number;
  targetY: number; // 飞到玩家位置后离开
  state: 'arriving' | 'healing' | 'leaving';
}

// 特效实体（爆炸、护盾等）
export interface Effect {
  id: string;
  x: number;
  y: number;
  type: 'explosion' | 'nuke' | 'shield' | 'missile_trail' | 'heal';
  frame: number;
  maxFrames: number;
  startTime: number;
  duration: number;
  data?: Record<string, number>; // 额外数据
}

// 生成唯一ID
let entityIdCounter = 0;
export const generateId = (): string => {
  return `entity_${++entityIdCounter}_${Date.now()}`;
};

// 重置ID计数器（游戏重新开始时）
export const resetIdCounter = (): void => {
  entityIdCounter = 0;
};
