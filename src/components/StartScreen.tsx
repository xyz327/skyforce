import React, { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { CONFIG, type DifficultyMode } from '../game/config';

interface StartScreenProps {
  onStart: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  const { player, setUsername, loadLeaderboard, leaderboard, difficulty, setDifficultyMode } = useGameStore();

  useEffect(() => {
    loadLeaderboard();
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>SKY FORCE</h1>
        <p style={styles.subtitle}></p>
        
        <div style={styles.inputContainer}>
          <label style={styles.label}>代号:</label>
          <input
            type="text"
            value={player.username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
          />
        </div>

        <div style={styles.difficultyContainer}>
          <div style={styles.difficultyLabel}>选择难度</div>
          <div style={styles.difficultyButtons}>
            {(Object.keys(CONFIG.DIFFICULTY_MODES) as DifficultyMode[]).map((mode) => {
              const settings = CONFIG.DIFFICULTY_MODES[mode];
              const isSelected = difficulty.mode === mode;
              return (
                <button
                  key={mode}
                  onClick={() => setDifficultyMode(mode)}
                  style={{
                    ...styles.difficultyButton,
                    backgroundColor: isSelected ? settings.color : 'rgba(255, 255, 255, 0.1)',
                    color: isSelected ? '#000' : '#888',
                    border: `1px solid ${isSelected ? settings.color : '#444'}`,
                    transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                  }}
                >
                  {settings.label}
                </button>
              );
            })}
          </div>
        </div>

        <div style={styles.instructions}>
          <p>击败敌人获得积分升级</p>
        </div>

        <button style={styles.startButton} onClick={onStart}>
          开始游戏
        </button>

        {leaderboard.length > 0 && (
          <div style={styles.leaderboard}>
            <h3 style={styles.leaderboardTitle}>王牌飞行员</h3>
            <div style={styles.leaderboardList}>
              {leaderboard.slice(0, 5).map((entry, index) => (
                <div key={index} style={styles.leaderboardItem}>
                  <span style={styles.rank}>#{index + 1}</span>
                  <span style={styles.name}>{entry.username}</span>
                  <span style={styles.score}>{entry.score}m</span>
                </div>
              ))}
            </div>
            {player.personalBest > 0 && (
               <div style={{...styles.leaderboardItem, marginTop: '10px', color: '#00ff88'}}>
                  <span style={styles.rank}>PB</span>
                  <span style={styles.name}>个人最佳</span>
                  <span style={styles.score}>{player.personalBest}m</span>
               </div>
            )}
          </div>
        )}

        <div style={styles.legend}>
          <div style={styles.legendItem}>
            <span style={{ ...styles.legendIcon, backgroundColor: '#00aaff' }}></span>
            <span>护盾 - 10秒无敌</span>
          </div>
          <div style={styles.legendItem}>
            <span style={{ ...styles.legendIcon, backgroundColor: '#ff0044' }}></span>
            <span>核弹 - 清除全屏</span>
          </div>
          <div style={styles.legendItem}>
            <span style={{ ...styles.legendIcon, backgroundColor: '#ff0000' }}></span>
            <span>导弹 - 全屏打击</span>
          </div>
          <div style={styles.legendItem}>
            <span style={{ ...styles.legendIcon, backgroundColor: '#ffffff' }}></span>
            <span>救援 - 恢复血量</span>
          </div>
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
  },
  title: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#00ff88',
    margin: 0,
    textShadow: '0 0 20px rgba(0, 255, 136, 0.5)',
    fontFamily: 'monospace',
    letterSpacing: '4px',
  },
  subtitle: {
    fontSize: '18px',
    color: '#888',
    margin: '8px 0 30px',
    fontFamily: 'monospace',
  },
  instructions: {
    fontSize: '14px',
    color: '#aaa',
    marginBottom: '30px',
    lineHeight: '2',
  },
  startButton: {
    padding: '15px 50px',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#0a0a1a',
    backgroundColor: '#00ff88',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: 'monospace',
    transition: 'all 0.2s',
  },
  legend: {
    marginTop: '30px',
    fontSize: '12px',
    color: '#888',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  legendIcon: {
    display: 'inline-block',
    width: '12px',
    height: '12px',
    borderRadius: '50%',
  },
  inputContainer: {
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  },
  label: {
    fontSize: '16px',
    color: '#00ff88',
    fontFamily: 'monospace',
  },
  input: {
    padding: '8px 12px',
    fontSize: '16px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid #00ff88',
    borderRadius: '4px',
    color: '#fff',
    fontFamily: 'monospace',
    textAlign: 'center',
    outline: 'none',
    width: '160px',
  },
  difficultyContainer: {
    marginBottom: '20px',
  },
  difficultyLabel: {
    fontSize: '12px',
    color: '#888',
    marginBottom: '8px',
  },
  difficultyButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
  },
  difficultyButton: {
    padding: '6px 12px',
    fontSize: '12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: 'monospace',
    transition: 'all 0.2s',
  },
  leaderboard: {
    marginTop: '20px',
    padding: '15px',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: '8px',
    width: '280px',
    margin: '20px auto',
    border: '1px solid #333',
  },
  leaderboardTitle: {
    margin: '0 0 10px 0',
    fontSize: '14px',
    color: '#ffaa00',
    textTransform: 'uppercase',
    letterSpacing: '2px',
  },
  leaderboardList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  leaderboardItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#ccc',
    padding: '2px 0',
  },
  rank: {
    width: '30px',
    textAlign: 'left',
    color: '#666',
  },
  name: {
    flex: 1,
    textAlign: 'left',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  score: {
    width: '60px',
    textAlign: 'right',
    color: '#fff',
    fontFamily: 'monospace',
  },
};
