import React, { useRef, useEffect, useCallback } from 'react';
import { Game } from '../game/Game';
import { useGameStore } from '../store/gameStore';
import { CONFIG } from '../game/config';
import { audioManager } from '../game/AudioManager';

interface GameCanvasProps {
  onGameReady: (game: Game) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ onGameReady }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Game | null>(null);
  const { gameState } = useGameStore();

  // 计算 Canvas 缩放比例
  const getScale = useCallback(() => {
    if (!containerRef.current) return 1;
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    const scaleX = containerWidth / CONFIG.GAME_WIDTH;
    const scaleY = containerHeight / CONFIG.GAME_HEIGHT;
    return Math.min(scaleX, scaleY);
  }, []);

  // 初始化游戏
  useEffect(() => {
    if (!canvasRef.current) return;

    const game = new Game(canvasRef.current);
    gameRef.current = game;
    onGameReady(game);

    return () => {
      game.stop();
    };
  }, [onGameReady]);

  // 游戏状态变化时启动/停止游戏
  useEffect(() => {
    if (!gameRef.current) return;

    if (gameState === 'playing') {
      gameRef.current.start();
    } else if (gameState === 'gameover') {
      gameRef.current.stop();
    }
  }, [gameState]);

  // 触摸事件处理
  const handleTouch = useCallback(async (e: React.TouchEvent | React.MouseEvent, isEnd: boolean = false) => {
    if (!gameRef.current || !canvasRef.current) return;
    if (gameState !== 'playing') return;

    e.preventDefault();

    // 在第一次触摸时确保音频上下文已激活（移动端必需）
    if (!isEnd) {
      await audioManager.initOnUserInteraction();
    }

    if (isEnd) {
      gameRef.current.setTargetPosition(null, null);
      return;
    }

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scale = getScale();

    let clientX: number, clientY: number;

    if ('touches' in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    // 转换为游戏坐标
    const x = (clientX - rect.left) / scale;
    const y = (clientY - rect.top) / scale;

    gameRef.current.setTargetPosition(x, y);
  }, [gameState, getScale]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => handleTouch(e), [handleTouch]);
  const handleTouchMove = useCallback((e: React.TouchEvent) => handleTouch(e), [handleTouch]);
  const handleTouchEnd = useCallback((e: React.TouchEvent) => handleTouch(e, true), [handleTouch]);
  
  const handleMouseDown = useCallback((e: React.MouseEvent) => handleTouch(e), [handleTouch]);
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (e.buttons === 1) handleTouch(e);
  }, [handleTouch]);
  const handleMouseUp = useCallback((e: React.MouseEvent) => handleTouch(e, true), [handleTouch]);
  const handleMouseLeave = useCallback((e: React.MouseEvent) => handleTouch(e, true), [handleTouch]);

  const scale = getScale();

  return (
    <div ref={containerRef} style={styles.container}>
      <canvas
        ref={canvasRef}
        style={{
          ...styles.canvas,
          width: CONFIG.GAME_WIDTH * scale,
          height: CONFIG.GAME_HEIGHT * scale,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a0a1a',
    overflow: 'hidden',
    touchAction: 'none',
  },
  canvas: {
    imageRendering: 'pixelated',
    touchAction: 'none',
  },
};
