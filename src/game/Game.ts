import { CONFIG } from './config';
import type { Player, Enemy, Bullet, Prop, Effect, Missile, RescuePlane } from './entities/types';
import { resetIdCounter } from './entities/types';
import { createPlayer, createBullet, createProp, createExplosion, createNukeEffect, createMissile, createRescuePlane, createHealEffect, createMissileTrailEffect } from './entities/factory';
import { detectCollisions, checkAABB } from './systems/CollisionSystem';
import { EnemySpawner } from './systems/EnemySpawner';
import { useGameStore } from '../store/gameStore';

export class Game {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private animationId: number | null = null;
  private lastTime: number = 0;

  // 游戏实体
  private player: Player | null = null;
  private enemies: Enemy[] = [];
  private playerBullets: Bullet[] = [];
  private enemyBullets: Bullet[] = [];
  private props: Prop[] = [];
  private effects: Effect[] = [];
  private missiles: Missile[] = [];
  private rescuePlanes: RescuePlane[] = [];

  // 系统
  private enemySpawner: EnemySpawner;

  // 输入状态
  private targetX: number | null = null;
  private targetY: number | null = null;

  // 背景滚动
  private bgOffset: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('无法获取 Canvas 上下文');
    this.ctx = ctx;

    this.width = CONFIG.GAME_WIDTH;
    this.height = CONFIG.GAME_HEIGHT;

    // 设置 Canvas 尺寸
    canvas.width = this.width;
    canvas.height = this.height;

    // 禁用图像平滑，实现像素风格
    this.ctx.imageSmoothingEnabled = false;

    // 初始化系统
    this.enemySpawner = new EnemySpawner(this.width);
  }

  // 开始游戏
  start(): void {
    resetIdCounter();
    this.reset();
    this.lastTime = performance.now();
    this.loop();
  }

  // 停止游戏
  stop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  // 重置游戏状态
  private reset(): void {
    // 创建玩家
    this.player = createPlayer(
      this.width / 2 - CONFIG.PLAYER.WIDTH / 2,
      this.height - CONFIG.PLAYER.HEIGHT - 50
    );

    // 清空实体
    this.enemies = [];
    this.playerBullets = [];
    this.enemyBullets = [];
    this.props = [];
    this.effects = [];
    this.missiles = [];
    this.rescuePlanes = [];

    // 重置系统
    this.enemySpawner.reset();
    this.bgOffset = 0;
  }

  // 游戏主循环
  private loop = (): void => {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    const state = useGameStore.getState();

    if (state.gameState === 'playing') {
      this.update(deltaTime);
    }

    this.render();

    this.animationId = requestAnimationFrame(this.loop);
  };

  // 更新游戏状态
  private update(deltaTime: number): void {
    const store = useGameStore.getState();
    const { difficulty } = store;

    // 更新飞行距离
    const distanceDelta = (CONFIG.FLIGHT_SPEED * deltaTime) / 1000;
    store.updateDistance(distanceDelta);
    store.updatePlayTime(deltaTime);
    store.updateDifficulty();

    // 更新背景滚动
    this.bgOffset = (this.bgOffset + deltaTime * 0.1) % this.height;

    // 更新玩家位置
    this.updatePlayer(deltaTime);

    // 玩家自动发射子弹
    this.playerFire();

    // 生成敌人
    const newEnemy = this.enemySpawner.update(
      deltaTime,
      difficulty.enemyHealthMultiplier,
      difficulty.enemyDamageMultiplier,
      difficulty.spawnRateMultiplier
    );
    if (newEnemy) {
      this.enemies.push(newEnemy);
    }

    // 更新敌人
    this.updateEnemies(deltaTime);

    // 更新子弹
    this.updateBullets(deltaTime);

    // 更新道具
    this.updateProps(deltaTime);

    // 更新特效
    this.updateEffects();

    // 更新导弹
    this.updateMissiles(deltaTime);

    // 更新救援飞机
    this.updateRescuePlanes(deltaTime);

    // 碰撞检测
    this.handleCollisions();

    // 更新护盾状态
    this.updateShield();

    // 清理失效实体
    this.cleanup();
  }

  // 更新玩家位置
  private updatePlayer(_deltaTime: number): void {
    if (!this.player) return;

    // 同步 store 中的玩家数据
    const store = useGameStore.getState();
    this.player.fireRate = store.player.fireRate;
    this.player.bulletLanes = store.player.bulletLanes;
    this.player.bulletDamage = store.player.bulletDamage;
    this.player.hasShield = store.player.hasShield;
    this.player.shieldEndTime = store.player.shieldEndTime;

    // 如果有目标位置，移动玩家（直接跟随手指位置）
    if (this.targetX !== null && this.targetY !== null) {
      // 直接设置玩家位置为目标位置（减去飞机中心偏移）
      const newX = this.targetX - this.player.width / 2;
      const newY = this.targetY - this.player.height / 2;

      // 限制在游戏区域内
      this.player.x = Math.max(0, Math.min(this.width - this.player.width, newX));
      this.player.y = Math.max(0, Math.min(this.height - this.player.height, newY));
    }
  }

  // 玩家发射子弹
  private playerFire(): void {
    if (!this.player) return;

    const now = performance.now();
    const fireInterval = 1000 / this.player.fireRate;

    if (now - this.player.lastFireTime >= fireInterval) {
      this.player.lastFireTime = now;

      // 根据弹道数量发射子弹
      const lanes = this.player.bulletLanes;
      const centerX = this.player.x + this.player.width / 2;
      const bulletY = this.player.y;

      const spacing = 15;
      const startX = centerX - ((lanes - 1) * spacing) / 2;

      for (let i = 0; i < lanes; i++) {
        const bulletX = startX + i * spacing;
        const bullet = createBullet(
          bulletX,
          bulletY,
          'player',
          this.player.bulletDamage,
          -CONFIG.PLAYER.BULLET_SPEED
        );
        this.playerBullets.push(bullet);
      }
    }
  }

  // 更新敌人
  private updateEnemies(deltaTime: number): void {
    const now = performance.now();

    for (const enemy of this.enemies) {
      if (!enemy.active) continue;

      // 移动敌人
      enemy.y += enemy.velocityY * (deltaTime / 1000);

      // 敌人发射子弹
      const fireInterval = 1000 / enemy.fireRate;
      if (now - enemy.lastFireTime >= fireInterval) {
        enemy.lastFireTime = now;
        const bulletX = enemy.x + enemy.width / 2;
        const bulletY = enemy.y + enemy.height;
        const bullet = createBullet(
          bulletX,
          bulletY,
          'enemy',
          Math.floor(CONFIG.ENEMY_BULLET_DAMAGE * useGameStore.getState().difficulty.enemyDamageMultiplier),
          CONFIG.ENEMY_BULLET_SPEED
        );
        this.enemyBullets.push(bullet);
      }

      // 超出屏幕标记为失效
      if (enemy.y > this.height) {
        enemy.active = false;
      }
    }
  }

  // 更新子弹
  private updateBullets(deltaTime: number): void {
    const allBullets = [...this.playerBullets, ...this.enemyBullets];

    for (const bullet of allBullets) {
      if (!bullet.active) continue;

      bullet.y += bullet.velocityY * (deltaTime / 1000);

      // 超出屏幕标记为失效
      if (bullet.y < -bullet.height || bullet.y > this.height) {
        bullet.active = false;
      }
    }
  }

  // 更新道具
  private updateProps(deltaTime: number): void {
    for (const prop of this.props) {
      if (!prop.active) continue;

      prop.y += prop.velocityY * (deltaTime / 1000);

      // 超出屏幕标记为失效
      if (prop.y > this.height) {
        prop.active = false;
      }
    }
  }

  // 更新特效
  private updateEffects(): void {
    const now = Date.now();

    for (const effect of this.effects) {
      const elapsed = now - effect.startTime;
      effect.frame = Math.floor((elapsed / effect.duration) * effect.maxFrames);

      if (elapsed >= effect.duration) {
        // 标记为完成（通过 frame 超过 maxFrames）
        effect.frame = effect.maxFrames;
      }
    }

    // 移除完成的特效
    this.effects = this.effects.filter((e) => e.frame < e.maxFrames);
  }

  // 更新导弹
  private updateMissiles(deltaTime: number): void {
    const store = useGameStore.getState();
    const speed = 600; // 导弹速度

    for (const missile of this.missiles) {
      if (!missile.active) continue;

      // 更新进度
      const dx = missile.endX - missile.startX;
      const dy = missile.endY - missile.startY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const moveDist = speed * (deltaTime / 1000);
      
      missile.progress += moveDist / distance;
      
      if (missile.progress >= 1) {
        missile.active = false;
        continue;
      }

      // 更新位置
      missile.x = missile.startX + dx * missile.progress;
      missile.y = missile.startY + dy * missile.progress;

      // 尾迹特效
      if (Math.random() < 0.3) {
        this.effects.push(createMissileTrailEffect(missile.x, missile.y));
      }

      // 检测碰撞
      for (const enemy of this.enemies) {
        if (!enemy.active) continue;
        if (missile.hitEnemies.includes(enemy.id)) continue;

        if (checkAABB(missile, enemy)) {
          enemy.health -= missile.damage;
          missile.hitEnemies.push(enemy.id);
          
          this.effects.push(createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2));

          if (enemy.health <= 0) {
            enemy.active = false;
            store.updateScore(enemy.scoreValue);
            store.addExperience(enemy.scoreValue);
            store.incrementKills();
            this.tryDropProp(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
          }
        }
      }
    }

    // 清理失效导弹
    this.missiles = this.missiles.filter(m => m.active);
  }

  // 更新救援飞机
  private updateRescuePlanes(deltaTime: number): void {
    const store = useGameStore.getState();
    
    for (const plane of this.rescuePlanes) {
      if (!plane.active) continue;

      if (plane.state === 'arriving') {
        // 向上飞行到目标位置
        plane.y += plane.velocityY * (deltaTime / 1000);
        
        // 接近目标位置时开始治疗
        if (plane.y <= plane.targetY) {
            plane.y = plane.targetY;
            plane.state = 'healing';
            
            // 治疗逻辑
            if (this.player && this.player.active) {
                store.heal(plane.healAmount);
                // 绿色加号特效
                for(let i=0; i<5; i++) {
                    const ex = this.player.x + Math.random() * this.player.width;
                    const ey = this.player.y + Math.random() * this.player.height;
                    this.effects.push(createHealEffect(ex, ey));
                }
            }
            
            // 治疗后离开
            setTimeout(() => {
                plane.state = 'leaving';
            }, 500);
        }
      } else if (plane.state === 'leaving') {
          // 继续向上飞
          plane.y += plane.velocityY * (deltaTime / 1000);
          if (plane.y < -plane.height) {
              plane.active = false;
          }
      }
    }
    
    this.rescuePlanes = this.rescuePlanes.filter(p => p.active);
  }

  // 更新护盾状态
  private updateShield(): void {
    const store = useGameStore.getState();
    if (store.player.hasShield && Date.now() >= store.player.shieldEndTime) {
      store.deactivateShield();
    }
  }

  // 处理碰撞
  private handleCollisions(): void {
    if (!this.player) return;

    const store = useGameStore.getState();

    const result = detectCollisions(
      this.player,
      this.enemies,
      this.playerBullets,
      this.enemyBullets,
      this.props
    );

    // 处理玩家子弹击中敌人
    for (const { bullet, enemy } of result.playerBulletHits) {
      bullet.active = false;
      enemy.health -= bullet.damage;

      if (enemy.health <= 0) {
        enemy.active = false;
        store.updateScore(enemy.scoreValue);
        store.addExperience(enemy.scoreValue);
        store.incrementKills();

        // 添加爆炸特效
        this.effects.push(createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2));

        // 掉落道具
        this.tryDropProp(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
      }
    }

    // 处理敌人子弹击中玩家
    for (const { bullet } of result.enemyBulletHits) {
      bullet.active = false;
      store.takeDamage(bullet.damage);
    }

    // 处理玩家与敌人碰撞
    for (const { enemy } of result.playerEnemyCollisions) {
      enemy.active = false;
      store.takeDamage(enemy.damage);
      this.effects.push(createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2));
    }

    // 处理拾取道具
    for (const { prop } of result.playerPropPickups) {
      prop.active = false;
      this.applyPropEffect(prop.propType);
    }
  }

  // 尝试掉落道具
  private tryDropProp(x: number, y: number): void {
    const rand = Math.random();
    let cumulative = 0;

    cumulative += CONFIG.SHIELD_DROP_CHANCE;
    if (rand < cumulative) {
      this.props.push(createProp(x - CONFIG.PROP.WIDTH / 2, y, 'SHIELD'));
      return;
    }

    cumulative += CONFIG.NUKE_DROP_CHANCE;
    if (rand < cumulative) {
      this.props.push(createProp(x - CONFIG.PROP.WIDTH / 2, y, 'NUKE'));
      return;
    }

    cumulative += CONFIG.MISSILE_DROP_CHANCE;
    if (rand < cumulative) {
      this.props.push(createProp(x - CONFIG.PROP.WIDTH / 2, y, 'MISSILE'));
      return;
    }

    cumulative += CONFIG.RESCUE_DROP_CHANCE;
    if (rand < cumulative) {
      this.props.push(createProp(x - CONFIG.PROP.WIDTH / 2, y, 'RESCUE'));
      return;
    }
  }

  // 应用道具效果
  private applyPropEffect(propType: 'SHIELD' | 'NUKE' | 'MISSILE' | 'RESCUE'): void {
    const store = useGameStore.getState();

    if (propType === 'SHIELD') {
      store.activateShield();
    } else if (propType === 'NUKE') {
      // 核弹效果：清除所有敌人和敌方子弹
      const killedEnemies = this.enemies.filter((e) => e.active);
      const totalScore = killedEnemies.reduce((sum, e) => sum + e.scoreValue, 0);

      // 标记所有敌人和敌方子弹为失效
      for (const enemy of this.enemies) {
        if (enemy.active) {
          this.effects.push(createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2));
          store.incrementKills();
        }
        enemy.active = false;
      }
      for (const bullet of this.enemyBullets) {
        bullet.active = false;
      }

      // 添加核爆特效
      this.effects.push(createNukeEffect(this.width / 2, this.height / 2));

      // 增加分数
      store.updateScore(totalScore);
      store.addExperience(totalScore);
    } else if (propType === 'MISSILE') {
      // 呼叫导弹：从四个角落发射
      if (!this.player) return;
      
      const damage = this.player.bulletDamage * CONFIG.MISSILE_DAMAGE_MULTIPLIER;
      
      // 左上 -> 右下
      this.missiles.push(createMissile(0, 0, this.width, this.height, damage));
      // 右上 -> 左下
      this.missiles.push(createMissile(this.width, 0, 0, this.height, damage));
      // 左下 -> 右上
      this.missiles.push(createMissile(0, this.height, this.width, 0, damage));
      // 右下 -> 左上
      this.missiles.push(createMissile(this.width, this.height, 0, 0, damage));
      
    } else if (propType === 'RESCUE') {
      // 召唤救援
      if (!this.player) return;
      
      const healAmount = this.player.maxHealth * CONFIG.RESCUE_HEAL_PERCENT;
      // 目标位置是玩家上方一点
      const targetY = this.player.y;
      
      this.rescuePlanes.push(createRescuePlane(this.player.x, healAmount, targetY));
    }
  }

  // 清理失效实体
  private cleanup(): void {
    this.enemies = this.enemies.filter((e) => e.active);
    this.playerBullets = this.playerBullets.filter((b) => b.active);
    this.enemyBullets = this.enemyBullets.filter((b) => b.active);
    this.props = this.props.filter((p) => p.active);
  }

  // 渲染游戏
  private render(): void {
    const ctx = this.ctx;

    // 清空画布
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, this.width, this.height);

    // 绘制滚动背景（星空）
    this.renderBackground();

    // 绘制道具
    this.renderProps();

    // 绘制敌人
    this.renderEnemies();

    // 绘制子弹
    this.renderBullets();

    // 绘制玩家
    this.renderPlayer();

    // 绘制特效
    this.renderEffects();

    // 绘制导弹
    this.renderMissiles();

    // 绘制救援飞机
    this.renderRescuePlanes();
  }

  // 渲染背景
  private renderBackground(): void {
    const ctx = this.ctx;

    // 绘制星星
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 50; i++) {
      const x = (i * 73) % this.width;
      const y = ((i * 97 + this.bgOffset) % (this.height + 20)) - 10;
      const size = (i % 3) + 1;
      ctx.fillRect(Math.floor(x), Math.floor(y), size, size);
    }

    // 绘制更暗的星星
    ctx.fillStyle = '#666688';
    for (let i = 0; i < 30; i++) {
      const x = (i * 127 + 50) % this.width;
      const y = ((i * 83 + this.bgOffset * 0.5) % (this.height + 20)) - 10;
      ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
    }
  }

  // 渲染玩家
  private renderPlayer(): void {
    if (!this.player) return;

    const ctx = this.ctx;
    const { x, y, width, height, hasShield, shieldEndTime } = this.player;

    // 绘制玩家飞机（像素风格三角形）
    ctx.fillStyle = '#00ff88';
    ctx.beginPath();
    ctx.moveTo(Math.floor(x + width / 2), Math.floor(y));
    ctx.lineTo(Math.floor(x), Math.floor(y + height));
    ctx.lineTo(Math.floor(x + width), Math.floor(y + height));
    ctx.closePath();
    ctx.fill();

    // 飞机机身
    ctx.fillStyle = '#00cc66';
    ctx.fillRect(Math.floor(x + width / 2 - 4), Math.floor(y + 8), 8, height - 12);

    // 飞机尾焰
    ctx.fillStyle = '#ffaa00';
    ctx.fillRect(Math.floor(x + width / 2 - 3), Math.floor(y + height), 6, 4);
    ctx.fillStyle = '#ff6600';
    ctx.fillRect(Math.floor(x + width / 2 - 2), Math.floor(y + height + 4), 4, 4);

    // 绘制护盾
    if (hasShield && Date.now() < shieldEndTime) {
      const remaining = (shieldEndTime - Date.now()) / CONFIG.SHIELD_DURATION;
      const radius = width * 0.8;

      // 护盾圆圈
      ctx.strokeStyle = `rgba(0, 200, 255, ${0.3 + remaining * 0.5})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(
        Math.floor(x + width / 2),
        Math.floor(y + height / 2),
        radius,
        0,
        Math.PI * 2
      );
      ctx.stroke();

      // 护盾进度弧
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(
        Math.floor(x + width / 2),
        Math.floor(y + height / 2),
        radius + 4,
        -Math.PI / 2,
        -Math.PI / 2 + Math.PI * 2 * remaining
      );
      ctx.stroke();
    }
  }

  // 渲染敌人
  private renderEnemies(): void {
    const ctx = this.ctx;

    for (const enemy of this.enemies) {
      if (!enemy.active) continue;

      const { x, y, width, height, enemyType, health, maxHealth } = enemy;

      // 根据类型选择颜色
      let color = '#ff4444';
      if (enemyType === 'MEDIUM') color = '#ff8800';
      if (enemyType === 'LARGE') color = '#ff0088';

      // 绘制敌机（倒三角形）
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(Math.floor(x + width / 2), Math.floor(y + height));
      ctx.lineTo(Math.floor(x), Math.floor(y));
      ctx.lineTo(Math.floor(x + width), Math.floor(y));
      ctx.closePath();
      ctx.fill();

      // 机身
      ctx.fillStyle = '#aa0000';
      ctx.fillRect(Math.floor(x + width / 2 - 3), Math.floor(y + 4), 6, height - 8);

      // 血条
      if (health < maxHealth) {
        const barWidth = width;
        const barHeight = 3;
        const healthPercent = health / maxHealth;

        ctx.fillStyle = '#333';
        ctx.fillRect(Math.floor(x), Math.floor(y - 6), barWidth, barHeight);

        ctx.fillStyle = '#ff0000';
        ctx.fillRect(Math.floor(x), Math.floor(y - 6), Math.floor(barWidth * healthPercent), barHeight);
      }
    }
  }

  // 渲染子弹
  private renderBullets(): void {
    const ctx = this.ctx;

    // 玩家子弹
    ctx.fillStyle = '#00ffff';
    for (const bullet of this.playerBullets) {
      if (!bullet.active) continue;
      ctx.fillRect(Math.floor(bullet.x), Math.floor(bullet.y), bullet.width, bullet.height);
    }

    // 敌人子弹
    ctx.fillStyle = '#ff6600';
    for (const bullet of this.enemyBullets) {
      if (!bullet.active) continue;
      ctx.fillRect(Math.floor(bullet.x), Math.floor(bullet.y), bullet.width, bullet.height);
    }
  }

  // 渲染道具
  private renderProps(): void {
    const ctx = this.ctx;

    for (const prop of this.props) {
      if (!prop.active) continue;

      const { x, y, width, height, propType } = prop;

      if (propType === 'SHIELD') {
        // 护盾道具（蓝色圆圈）
        ctx.fillStyle = '#00aaff';
        ctx.beginPath();
        ctx.arc(Math.floor(x + width / 2), Math.floor(y + height / 2), width / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(Math.floor(x + width / 2), Math.floor(y + height / 2), width / 2 - 3, 0, Math.PI * 2);
        ctx.stroke();
      } else if (propType === 'NUKE') {
        // 核弹道具（红色圆形带放射标志）
        ctx.fillStyle = '#ff0044';
        ctx.beginPath();
        ctx.arc(Math.floor(x + width / 2), Math.floor(y + height / 2), width / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(Math.floor(x + width / 2), Math.floor(y + height / 2), width / 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (propType === 'MISSILE') {
        // 导弹道具（红色导弹图标）
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.moveTo(Math.floor(x + width / 2), Math.floor(y));
        ctx.lineTo(Math.floor(x + width), Math.floor(y + height));
        ctx.lineTo(Math.floor(x + width / 2), Math.floor(y + height - 5));
        ctx.lineTo(Math.floor(x), Math.floor(y + height));
        ctx.closePath();
        ctx.fill();
      } else if (propType === 'RESCUE') {
        // 救援道具（白色带红十字）
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(Math.floor(x), Math.floor(y), width, height);
        
        ctx.fillStyle = '#ff0000';
        const crossSize = width / 2;
        const thickness = width / 6;
        ctx.fillRect(Math.floor(x + width/2 - thickness/2), Math.floor(y + height/2 - crossSize/2), thickness, crossSize);
        ctx.fillRect(Math.floor(x + width/2 - crossSize/2), Math.floor(y + height/2 - thickness/2), crossSize, thickness);
      }
    }
  }

  // 渲染特效
  private renderEffects(): void {
    const ctx = this.ctx;

    for (const effect of this.effects) {
      const { x, y, type, frame, maxFrames } = effect;
      const progress = frame / maxFrames;

      if (type === 'explosion') {
        // 爆炸特效
        const radius = 10 + progress * 20;
        const alpha = 1 - progress;

        ctx.fillStyle = `rgba(255, ${Math.floor(150 - progress * 150)}, 0, ${alpha})`;
        ctx.beginPath();
        ctx.arc(Math.floor(x), Math.floor(y), radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(255, 255, 0, ${alpha * 0.5})`;
        ctx.beginPath();
        ctx.arc(Math.floor(x), Math.floor(y), radius * 0.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (type === 'nuke') {
        // 核爆特效
        const radius = 50 + progress * 200;
        const alpha = 1 - progress;

        // 外圈
        ctx.fillStyle = `rgba(255, 100, 0, ${alpha * 0.3})`;
        ctx.beginPath();
        ctx.arc(Math.floor(x), Math.floor(y), radius, 0, Math.PI * 2);
        ctx.fill();

        // 中圈
        ctx.fillStyle = `rgba(255, 200, 0, ${alpha * 0.5})`;
        ctx.beginPath();
        ctx.arc(Math.floor(x), Math.floor(y), radius * 0.6, 0, Math.PI * 2);
        ctx.fill();

        // 内圈
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(Math.floor(x), Math.floor(y), radius * 0.2, 0, Math.PI * 2);
        ctx.fill();
      } else if (type === 'missile_trail') {
        // 导弹尾迹
        const radius = 3 * (1 - progress);
        ctx.fillStyle = `rgba(255, 100, 0, ${1 - progress})`;
        ctx.beginPath();
        ctx.arc(Math.floor(x), Math.floor(y), radius, 0, Math.PI * 2);
        ctx.fill();
      } else if (type === 'heal') {
        // 治疗特效（绿色加号）
        const size = 10;
        const alpha = 1 - progress;
        const offset = progress * 20; // 向上飘动
        
        ctx.fillStyle = `rgba(0, 255, 0, ${alpha})`;
        const drawX = Math.floor(x);
        const drawY = Math.floor(y - offset);
        
        ctx.fillRect(drawX - 1, drawY - size/2, 2, size);
        ctx.fillRect(drawX - size/2, drawY - 1, size, 2);
      }
    }
  }

  // 渲染导弹
  private renderMissiles(): void {
    const ctx = this.ctx;
    
    for (const missile of this.missiles) {
        if (!missile.active) continue;
        
        ctx.fillStyle = '#ff0000';
        
        // 旋转导弹以朝向飞行方向
        const dx = missile.endX - missile.startX;
        const dy = missile.endY - missile.startY;
        const angle = Math.atan2(dy, dx);
        
        ctx.save();
        ctx.translate(missile.x, missile.y);
        ctx.rotate(angle);
        
        // 绘制导弹形状
        ctx.beginPath();
        ctx.moveTo(8, 0);
        ctx.lineTo(-8, 6);
        ctx.lineTo(-4, 0);
        ctx.lineTo(-8, -6);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
  }

  // 渲染救援飞机
  private renderRescuePlanes(): void {
      const ctx = this.ctx;
      
      for (const plane of this.rescuePlanes) {
          if (!plane.active) continue;
          
          const { x, y, width, height } = plane;
          
          // 救护车配色（白底红十字）
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.moveTo(Math.floor(x + width / 2), Math.floor(y));
          ctx.lineTo(Math.floor(x), Math.floor(y + height));
          ctx.lineTo(Math.floor(x + width), Math.floor(y + height));
          ctx.closePath();
          ctx.fill();
          
          // 红十字
          ctx.fillStyle = '#ff0000';
          const crossSize = width / 2;
          const thickness = width / 6;
          const cx = x + width / 2;
          const cy = y + height / 2 + 4;
          
          ctx.fillRect(Math.floor(cx - thickness/2), Math.floor(cy - crossSize/2), thickness, crossSize);
          ctx.fillRect(Math.floor(cx - crossSize/2), Math.floor(cy - thickness/2), crossSize, thickness);
          
          // 机翼装饰
          ctx.fillStyle = '#dddddd';
          ctx.fillRect(Math.floor(x + width / 2 - 2), Math.floor(y + 10), 4, height - 14);
      }
  }

  // 设置触摸目标位置
  setTargetPosition(x: number | null, y: number | null): void {
    this.targetX = x;
    this.targetY = y;
  }

  // 获取 Canvas 尺寸
  getSize(): { width: number; height: number } {
    return { width: this.width, height: this.height };
  }
}
