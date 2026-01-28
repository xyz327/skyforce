import { CONFIG } from '../config';
import type { EnemyType, PropType, BulletOwner } from '../config';
import type { Player, Enemy, Bullet, Prop, Effect, Missile, RescuePlane } from './types';
import { generateId } from './types';

// 创建玩家实体
export const createPlayer = (x: number, y: number): Player => ({
  id: generateId(),
  x,
  y,
  width: CONFIG.PLAYER.WIDTH,
  height: CONFIG.PLAYER.HEIGHT,
  velocityX: 0,
  velocityY: 0,
  active: true,
  health: CONFIG.PLAYER.MAX_HEALTH,
  maxHealth: CONFIG.PLAYER.MAX_HEALTH,
  fireRate: CONFIG.PLAYER.INITIAL_FIRE_RATE,
  bulletLanes: 1,
  bulletDamage: CONFIG.PLAYER.BULLET_DAMAGE,
  lastFireTime: 0,
  hasShield: false,
  shieldEndTime: 0,
});

// 创建敌人实体
export const createEnemy = (
  x: number,
  y: number,
  enemyType: EnemyType,
  healthMultiplier: number = 1,
  damageMultiplier: number = 1
): Enemy => {
  const config = CONFIG.ENEMY[enemyType];
  return {
    id: generateId(),
    x,
    y,
    width: config.width,
    height: config.height,
    velocityX: 0,
    velocityY: config.speed,
    active: true,
    enemyType,
    health: Math.floor(config.health * healthMultiplier),
    maxHealth: Math.floor(config.health * healthMultiplier),
    damage: Math.floor(config.damage * damageMultiplier),
    scoreValue: config.score,
    fireRate: config.fireRate,
    lastFireTime: 0,
  };
};

// 创建子弹实体
export const createBullet = (
  x: number,
  y: number,
  owner: BulletOwner,
  damage: number,
  velocityY: number
): Bullet => ({
  id: generateId(),
  x: x - 4, // 子弹宽度的一半
  y,
  width: 8,
  height: 8,
  velocityX: 0,
  velocityY,
  active: true,
  damage,
  owner,
});

// 创建道具实体
export const createProp = (x: number, y: number, propType: PropType): Prop => ({
  id: generateId(),
  x,
  y,
  width: CONFIG.PROP.WIDTH,
  height: CONFIG.PROP.HEIGHT,
  velocityX: 0,
  velocityY: CONFIG.PROP.SPEED,
  active: true,
  propType,
});

// 创建爆炸特效
export const createExplosion = (x: number, y: number): Effect => ({
  id: generateId(),
  x,
  y,
  type: 'explosion',
  frame: 0,
  maxFrames: 8,
  startTime: Date.now(),
  duration: 500,
});

// 创建核爆特效
export const createNukeEffect = (x: number, y: number): Effect => ({
  id: generateId(),
  x,
  y,
  type: 'nuke',
  frame: 0,
  maxFrames: 16,
  startTime: Date.now(),
  duration: 1000,
});

// 创建护盾特效（跟随玩家）
export const createShieldEffect = (): Effect => ({
  id: generateId(),
  x: 0,
  y: 0,
  type: 'shield',
  frame: 0,
  maxFrames: 4,
  startTime: Date.now(),
  duration: CONFIG.SHIELD_DURATION,
});

// 创建导弹（从角落发射）
export const createMissile = (
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  damage: number
): Missile => ({
  id: generateId(),
  x: startX,
  y: startY,
  width: 16,
  height: 16,
  velocityX: 0,
  velocityY: 0,
  active: true,
  damage,
  startX,
  startY,
  endX,
  endY,
  progress: 0,
  hitEnemies: [],
});

// 创建救援飞机
export const createRescuePlane = (x: number, healAmount: number, targetY: number): RescuePlane => ({
  id: generateId(),
  x,
  y: CONFIG.GAME_HEIGHT + 50, // 从屏幕下方开始
  width: 32,
  height: 32,
  velocityX: 0,
  velocityY: -150, // 向上飞行
  active: true,
  healAmount,
  targetY,
  state: 'arriving',
});

// 创建治疗特效（绿色加号）
export const createHealEffect = (x: number, y: number): Effect => ({
  id: generateId(),
  x,
  y,
  type: 'heal',
  frame: 0,
  maxFrames: 10,
  startTime: Date.now(),
  duration: 800,
});

// 创建导弹尾迹特效
export const createMissileTrailEffect = (x: number, y: number): Effect => ({
  id: generateId(),
  x,
  y,
  type: 'missile_trail',
  frame: 0,
  maxFrames: 6,
  startTime: Date.now(),
  duration: 300,
});
