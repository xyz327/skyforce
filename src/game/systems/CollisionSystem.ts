import type { Entity, Player, Enemy, Bullet, Prop } from '../entities/types';

// AABB 碰撞检测
export const checkAABB = (a: Entity, b: Entity): boolean => {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
};

// 碰撞结果接口
export interface CollisionResult {
  playerBulletHits: { bullet: Bullet; enemy: Enemy }[];
  enemyBulletHits: { bullet: Bullet; player: Player }[];
  playerEnemyCollisions: { player: Player; enemy: Enemy }[];
  playerPropPickups: { player: Player; prop: Prop }[];
}

// 检测所有碰撞
export const detectCollisions = (
  player: Player,
  enemies: Enemy[],
  playerBullets: Bullet[],
  enemyBullets: Bullet[],
  props: Prop[]
): CollisionResult => {
  const result: CollisionResult = {
    playerBulletHits: [],
    enemyBulletHits: [],
    playerEnemyCollisions: [],
    playerPropPickups: [],
  };

  // 玩家子弹 vs 敌人
  for (const bullet of playerBullets) {
    if (!bullet.active) continue;
    for (const enemy of enemies) {
      if (!enemy.active) continue;
      if (checkAABB(bullet, enemy)) {
        result.playerBulletHits.push({ bullet, enemy });
      }
    }
  }

  // 敌人子弹 vs 玩家（护盾状态跳过）
  if (player.active && !player.hasShield) {
    for (const bullet of enemyBullets) {
      if (!bullet.active) continue;
      if (checkAABB(bullet, player)) {
        result.enemyBulletHits.push({ bullet, player });
      }
    }
  }

  // 玩家 vs 敌人（碰撞伤害，护盾状态跳过）
  if (player.active && !player.hasShield) {
    for (const enemy of enemies) {
      if (!enemy.active) continue;
      if (checkAABB(player, enemy)) {
        result.playerEnemyCollisions.push({ player, enemy });
      }
    }
  }

  // 玩家 vs 道具（拾取）
  if (player.active) {
    for (const prop of props) {
      if (!prop.active) continue;
      if (checkAABB(player, prop)) {
        result.playerPropPickups.push({ player, prop });
      }
    }
  }

  return result;
};
