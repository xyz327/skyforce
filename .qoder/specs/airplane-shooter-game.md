# 飞机空战游戏实现方案

## 概述
构建一个移动端响应式的像素风格飞机空战网页游戏，使用 React + Canvas 技术栈，支持触摸拖拽操控。

## 技术选型
- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **状态管理**: Zustand
- **渲染**: Canvas API
- **操控**: 原生 Touch Events

## 项目结构

```
skyforce/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── StartScreen.tsx      # 游戏准备界面
│   │   ├── GameCanvas.tsx       # Canvas主组件
│   │   ├── GameHUD.tsx          # 进度条+记分板
│   │   └── GameOverScreen.tsx   # 游戏结束界面
│   ├── game/
│   │   ├── Game.ts              # 游戏主循环控制器
│   │   ├── Renderer.ts          # Canvas渲染器
│   │   ├── entities/
│   │   │   ├── Player.ts        # 玩家飞机
│   │   │   ├── Enemy.ts         # 敌方飞机
│   │   │   ├── Bullet.ts        # 子弹
│   │   │   └── Prop.ts          # 道具
│   │   ├── systems/
│   │   │   ├── CollisionSystem.ts   # 碰撞检测
│   │   │   ├── EnemySpawner.ts      # 敌人生成
│   │   │   ├── UpgradeSystem.ts     # 升级系统
│   │   │   └── DifficultyManager.ts # 难度管理
│   │   └── config.ts            # 游戏配置常量
│   ├── store/
│   │   └── gameStore.ts         # 游戏状态管理
│   ├── hooks/
│   │   └── useTouchControl.ts   # 触摸控制Hook
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 实现步骤

### 步骤 1: 项目初始化
- 使用 Vite 创建 React + TypeScript 项目
- 安装 zustand 依赖
- 配置响应式 viewport meta 标签

### 步骤 2: 游戏状态管理 (gameStore.ts)
创建 Zustand store 管理：
- 游戏状态 (menu/playing/gameover)
- 玩家数据 (血量、积分、等级、弹道数)
- 游戏进度 (飞行距离、击杀数)
- 难度数据 (敌人血量/伤害倍率)

### 步骤 3: UI 组件
1. **StartScreen**: 游戏标题 + 开始按钮
2. **GameHUD**: 右侧进度条(飞行距离) + 记分板(积分/等级)
3. **GameOverScreen**: 显示飞行距离、击杀数、总积分，重新开始按钮

### 步骤 4: Canvas 渲染器 (Renderer.ts)
- 低分辨率渲染 (屏幕1/4) 实现像素风格
- 渲染层级: 背景 -> 道具 -> 敌机 -> 子弹 -> 玩家 -> 特效
- 滚动背景效果 (星空)

### 步骤 5: 实体系统
1. **Player**: 位置、血量、武器配置、弹道数、护盾状态
2. **Enemy**: 位置、血量、伤害、分值、掉落概率
3. **Bullet**: 位置、伤害、归属(玩家/敌人)
4. **Prop**: 类型(护盾/核弹)、效果

### 步骤 6: 游戏主循环 (Game.ts)
```
每帧执行:
1. 处理输入 (触摸位置)
2. 更新所有实体位置
3. 玩家自动发射子弹
4. 敌人发射子弹
5. 碰撞检测
6. 处理击杀/伤害/道具拾取
7. 更新难度
8. 渲染
```

### 步骤 7: 碰撞检测系统
检测对象对：
- 玩家子弹 vs 敌机
- 敌人子弹 vs 玩家 (护盾状态跳过)
- 玩家 vs 敌机 (碰撞伤害)
- 玩家 vs 道具 (拾取)

### 步骤 8: 升级系统
- 击杀敌人获得积分和经验
- 达到经验阈值升级
- 升级提升射速 (每级+0.5发/秒)
- 射速达上限 (10发/秒) 时: 射速减半 + 弹道+1

### 步骤 9: 难度系统
- 每飞行1000米提升难度等级
- 敌人血量: +20%/级
- 敌人伤害: +15%/级
- 生成速度: +30%/级

### 步骤 10: 道具系统
1. **护盾 (3%概率)**
   - 显示圆形护盾光环
   - 10秒内无敌
   - 进度环显示剩余时间

2. **核弹 (1%概率)**
   - 屏幕中心爆炸动画
   - 清除所有敌人和敌方子弹
   - 获得所有清除敌人的积分

### 步骤 11: 触摸控制
- 监听 touchstart/touchmove/touchend
- 计算触摸点与飞机中心的偏移
- 拖拽时飞机跟随手指移动
- 限制飞机在游戏区域内

### 步骤 12: 响应式布局
- 横屏优先，竖屏时提示旋转
- Canvas 自适应屏幕尺寸
- 右侧 HUD 固定宽度 (80px)

## 关键配置常量

```typescript
// config.ts
export const CONFIG = {
  // 玩家
  PLAYER_MAX_HEALTH: 100,
  PLAYER_INITIAL_FIRE_RATE: 2,      // 发/秒
  PLAYER_MAX_FIRE_RATE: 10,
  PLAYER_BULLET_DAMAGE: 10,
  PLAYER_SPEED: 300,                 // 像素/秒
  
  // 敌人
  ENEMY_SMALL: { health: 20, damage: 10, score: 10 },
  ENEMY_MEDIUM: { health: 50, damage: 20, score: 30 },
  ENEMY_LARGE: { health: 100, damage: 30, score: 50 },
  ENEMY_SPAWN_INTERVAL: 2000,        // 毫秒
  
  // 道具
  SHIELD_DURATION: 10000,            // 毫秒
  SHIELD_DROP_CHANCE: 0.03,
  NUKE_DROP_CHANCE: 0.01,
  
  // 难度
  DIFFICULTY_DISTANCE: 1000,         // 每1000米升级
  HEALTH_MULTIPLIER: 0.2,
  DAMAGE_MULTIPLIER: 0.15,
};
```

## 像素风格实现
- Canvas 以 1/4 分辨率渲染
- `ctx.imageSmoothingEnabled = false`
- 所有坐标向下取整
- 使用简单几何图形: 三角形飞机、圆形子弹

## 验证方案
1. `npm run dev` 启动开发服务器
2. 手机浏览器打开进行真机测试
3. 验证触摸操控响应
4. 验证碰撞检测准确性
5. 验证升级/道具系统正常工作
6. 检查游戏结束界面数据准确性
