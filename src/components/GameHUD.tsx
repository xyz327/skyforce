import React from 'react';
import { useGameStore } from '../store/gameStore';

export const GameHUD: React.FC = () => {
  const { player, progress } = useGameStore();

  // 计算血量百分比
  const healthPercent = (player.health / player.maxHealth) * 100;

  // 计算经验百分比
  const expPercent = (player.experience / player.expToNextLevel) * 100;

  // 升级还需要的经验值
  const expNeeded = player.expToNextLevel - player.experience;

  // 护盾剩余时间
  const shieldRemaining = player.hasShield 
    ? Math.max(0, Math.ceil((player.shieldEndTime - Date.now()) / 1000))
    : 0;

  return (
    <div style={styles.container}>
      {/* 个人记录提示 */}
      {player.personalBest > 0 && Math.floor(progress.distance) < player.personalBest && (
        <div style={styles.pbIndicator}>
          <span style={styles.pbLabel}>最佳记录</span>
          <span style={styles.pbValue}>{player.personalBest}m</span>
        </div>
      )}

      {/* 第一行：血量 */}
      <div style={styles.row}>
        <div style={styles.item}>
          <span style={styles.label}>HP</span>
          <div style={styles.progressBarContainer}>
            <div style={styles.progressBar}>
              <div 
                style={{ 
                  ...styles.progressFill, 
                  width: `${healthPercent}%`, 
                  backgroundColor: healthPercent > 30 ? '#00ff88' : '#ff4444' 
                }} 
              />
            </div>
            <span style={{
              ...styles.value,
              color: healthPercent > 30 ? '#00ff88' : '#ff4444',
            }}>
              {player.health}/{player.maxHealth}
            </span>
          </div>
        </div>

        {/* 护盾状态 */}
        {player.hasShield && shieldRemaining > 0 && (
          <div style={styles.shieldItem}>
            <span>🛡️</span>
            <span style={{ color: '#00aaff', fontWeight: 'bold' }}>{shieldRemaining}s</span>
          </div>
        )}
      </div>

      {/* 第二行：等级和经验 */}
      <div style={styles.row}>
        <div style={styles.item}>
          <span style={styles.label}>Lv.{player.level}</span>
          <div style={styles.progressBarContainer}>
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: `${expPercent}%`, backgroundColor: '#ffaa00' }} />
            </div>
            <span style={{ ...styles.value, color: '#ffaa00' }}>
              还需{expNeeded}
            </span>
          </div>
        </div>
      </div>

      {/* 第三行：统计数据 */}
      <div style={styles.statsRow}>
        <div style={styles.statItem}>
          <span style={styles.statLabel}>积分</span>
          <span style={{ ...styles.statValue, color: '#ffcc00' }}>{player.score.toLocaleString()}</span>
        </div>
        <div style={styles.statItem}>
          <span style={styles.statLabel}>距离</span>
          <span style={{ ...styles.statValue, color: '#00aaff' }}>{Math.floor(progress.distance)}m</span>
        </div>
        <div style={styles.statItem}>
          <span style={styles.statLabel}>击杀</span>
          <span style={{ ...styles.statValue, color: '#ff6666' }}>{progress.enemiesKilled}</span>
        </div>
        <div style={styles.statItem}>
          <span style={styles.statLabel}>弹道</span>
          <span style={{ ...styles.statValue, color: '#00ffff' }}>x{player.bulletLanes}</span>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    padding: '8px 12px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    fontFamily: 'monospace',
    color: '#fff',
    zIndex: 50,
    textShadow: '1px 1px 2px rgba(0,0,0,0.8), 0 0 4px rgba(0,0,0,0.5)',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
  },
  label: {
    fontSize: '12px',
    color: '#fff',
    fontWeight: 'bold',
    minWidth: '35px',
  },
  progressBarContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
  },
  progressBar: {
    flex: 1,
    height: '8px',
    backgroundColor: 'rgba(50, 50, 50, 0.7)',
    borderRadius: '4px',
    overflow: 'hidden',
    maxWidth: '120px',
  },
  progressFill: {
    height: '100%',
    transition: 'width 0.2s',
  },
  value: {
    fontSize: '11px',
    fontWeight: 'bold',
    minWidth: '50px',
  },
  shieldItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '2px 8px',
    backgroundColor: 'rgba(0, 170, 255, 0.3)',
    borderRadius: '4px',
    fontSize: '12px',
  },
  statsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '8px',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: '9px',
    color: 'rgba(255,255,255,0.7)',
  },
  statValue: {
    fontSize: '13px',
    fontWeight: 'bold',
  },
  pbIndicator: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: '4px 8px',
    borderRadius: '4px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  pbLabel: {
    fontSize: '10px',
    color: '#aaa',
  },
  pbValue: {
    fontSize: '12px',
    color: '#fff',
    fontWeight: 'bold',
  },
};
