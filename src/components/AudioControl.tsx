import { useState } from 'react';
import { audioManager } from '../game/AudioManager';

export const AudioControl: React.FC = () => {
  const [sfxEnabled, setSfxEnabled] = useState(audioManager.isEnabled());
  const [musicEnabled, setMusicEnabled] = useState(audioManager.isMusicEnabled());

  const toggleSfx = async () => {
    // 确保音频上下文已初始化（移动端）
    await audioManager.initOnUserInteraction();
    const newState = !sfxEnabled;
    setSfxEnabled(newState);
    audioManager.setEnabled(newState);
  };

  const toggleMusic = async () => {
    // 确保音频上下文已初始化（移动端）
    await audioManager.initOnUserInteraction();
    const newState = !musicEnabled;
    setMusicEnabled(newState);
    audioManager.setMusicEnabled(newState);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '90px',
        right: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        zIndex: 1000,
      }}
    >
      <button
        onClick={toggleSfx}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '6px',
          border: '1px solid rgba(255, 255, 255, 0.6)',
          backgroundColor: sfxEnabled ? 'rgba(0, 255, 136, 0.85)' : 'rgba(80, 80, 80, 0.85)',
          color: '#fff',
          fontSize: '16px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(4px)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
        title={sfxEnabled ? '音效：开' : '音效：关'}
      >
        {sfxEnabled ? '🔊' : '🔇'}
      </button>
      <button
        onClick={toggleMusic}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '6px',
          border: '1px solid rgba(255, 255, 255, 0.6)',
          backgroundColor: musicEnabled ? 'rgba(0, 255, 136, 0.85)' : 'rgba(80, 80, 80, 0.85)',
          color: '#fff',
          fontSize: '16px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(4px)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
        title={musicEnabled ? '音乐：开' : '音乐：关'}
      >
        {musicEnabled ? '🎵' : '🎶'}
      </button>
    </div>
  );
};
