import React from 'react';

interface StartScreenProps {
  onStart: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>SKY FORCE</h1>
        <p style={styles.subtitle}>空战传说</p>
        
        <div style={styles.instructions}>
          <p>触摸屏幕拖动控制飞机</p>
          <p>击败敌人获得积分升级</p>
          <p>收集道具获得特殊能力</p>
        </div>

        <button style={styles.startButton} onClick={onStart}>
          开始游戏
        </button>

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
};
