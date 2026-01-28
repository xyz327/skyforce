import { useCallback, useState } from 'react';
import { useGameStore } from './store/gameStore';
import { Game } from './game/Game';
import { GameCanvas } from './components/GameCanvas';
import { GameHUD } from './components/GameHUD';
import { StartScreen } from './components/StartScreen';
import { GameOverScreen } from './components/GameOverScreen';

function App() {
  const { gameState, startGame, resetGame } = useGameStore();
  const [game, setGame] = useState<Game | null>(null);

  const handleGameReady = useCallback((gameInstance: Game) => {
    setGame(gameInstance);
  }, []);

  const handleStart = useCallback(() => {
    resetGame();
    startGame();
  }, [resetGame, startGame]);

  const handleRestart = useCallback(() => {
    if (game) {
      game.stop();
    }
    resetGame();
    startGame();
  }, [game, resetGame, startGame]);

  return (
    <div style={styles.container}>
      <div style={styles.gameArea}>
        <GameCanvas onGameReady={handleGameReady} />
        {gameState === 'playing' && <GameHUD />}
      </div>

      {gameState === 'menu' && <StartScreen onStart={handleStart} />}
      {gameState === 'gameover' && <GameOverScreen onRestart={handleRestart} />}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  gameArea: {
    width: '100%',
    height: '100%',
    display: 'flex',
    position: 'relative',
  },
};

export default App;
