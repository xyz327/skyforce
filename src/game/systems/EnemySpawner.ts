import { CONFIG } from '../config';
import type { EnemyType } from '../config';
import type { Enemy } from '../entities/types';
import { createEnemy } from '../entities/factory';

export class EnemySpawner {
  private timer: number = 0;
  private gameWidth: number;

  constructor(gameWidth: number) {
    this.gameWidth = gameWidth;
  }

  // 更新生成器
  update(
    deltaTime: number,
    healthMultiplier: number,
    damageMultiplier: number,
    spawnRateMultiplier: number
  ): Enemy | null {
    this.timer += deltaTime;

    // 计算生成间隔（受难度影响）
    const spawnInterval = CONFIG.ENEMY_SPAWN_INTERVAL / spawnRateMultiplier;

    if (this.timer >= spawnInterval) {
      this.timer = 0;
      return this.spawn(healthMultiplier, damageMultiplier);
    }

    return null;
  }

  // 生成敌人
  private spawn(healthMultiplier: number, damageMultiplier: number): Enemy {
    const enemyType = this.selectEnemyType();
    const config = CONFIG.ENEMY[enemyType];

    // 在屏幕上方随机位置生成
    const x = Math.random() * (this.gameWidth - config.width);
    const y = -config.height;

    return createEnemy(x, y, enemyType, healthMultiplier, damageMultiplier);
  }

  // 选择敌人类型
  private selectEnemyType(): EnemyType {
    const rand = Math.random();

    // 10% 概率大型敌机
    if (rand < 0.1) return 'LARGE';
    // 30% 概率中型敌机
    if (rand < 0.4) return 'MEDIUM';
    // 60% 概率小型敌机
    return 'SMALL';
  }

  // 重置计时器
  reset(): void {
    this.timer = 0;
  }
}
