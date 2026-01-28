import React from 'react';
import { useGameStore } from '../store/gameStore';

interface GameOverScreenProps {
  onRestart: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ onRestart }) => {
  const { player, progress } = useGameStore();

  // 格式化游戏时间
  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>游戏结束</h1>
        
        <div style={styles.statsContainer}>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>飞行距离</span>
            <span style={styles.statValue}>{Math.floor(progress.distance)} m</span>
          </div>
          
          <div style={styles.statItem}>
            <span style={styles.statLabel}>击败敌人</span>
            <span style={styles.statValue}>{progress.enemiesKilled}</span>
          </div>
          
          <div style={styles.statItem}>
            <span style={styles.statLabel}>最终等级</span>
            <span style={styles.statValue}>Lv.{player.level}</span>
          </div>
          
          <div style={styles.statItem}>
            <span style={styles.statLabel}>游戏时长</span>
            <span style={styles.statValue}>{formatTime(progress.playTime)}</span>
          </div>
          
          <div style={styles.divider} />
          
          <div style={styles.totalScore}>
            <span style={styles.totalLabel}>总积分</span>
            <span style={styles.totalValue}>{player.score.toLocaleString()}</span>
          </div>
        </div>

        <button style={styles.restartButton} onClick={onRestart}>
          再来一次
        </button>

        <p style={styles.tip}>提示：收集护盾道具可以获得10秒无敌时间</p>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10, 10, 26, 0.95)',
    zIndex: 100,
  },
  content: {
    textAlign: 'center',
    color: '#fff',
    padding: '20px',
    maxWidth: '300px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#ff4444',
    margin: '0 0 30px',
    fontFamily: 'monospace',
  },
  statsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '30px',
  },
  statItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  statLabel: {
    fontSize: '14px',
    color: '#888',
  },
  statValue: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'monospace',
  },
  divider: {
    height: '2px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    margin: '15px 0',
  },
  totalScore: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0 0',
  },
  totalLabel: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#ffcc00',
  },
  totalValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#ffcc00',
    fontFamily: 'monospace',
  },
  restartButton: {
    padding: '15px 50px',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#0a0a1a',
    backgroundColor: '#00ff88',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: 'monospace',
    marginBottom: '20px',
  },
  tip: {
    fontSize: '12px',
    color: '#666',
    fontFamily: 'monospace',
  },
};
