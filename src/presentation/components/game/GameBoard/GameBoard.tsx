import React, { useState, useCallback, useEffect } from 'react';
import { GameState, GemstoneType } from '@/core/game/types';
import { 
  AboutModal, 
  HowToPlayModal, 
  SettingsModal, 
  GameOverModal, 
  RoundCompleteOverlay 
} from '../../modals';
import { 
  MenuContainer,
  GameHeader,
  GamePlayArea,
  GameFooter
} from '../../containers';
import { 
  useResponsiveLayout,
  useGameEngine,
  useTicketManager,
  useGameTimer,
  useVariationEffects,
  usePatternDisplay,
  useGemClickHandler,
  useMenuGemSize,
  useGameSounds
} from '@/presentation/hooks';

export const GameBoard: React.FC = () => {
  // Custom hooks
  const layout = useResponsiveLayout();
  const { ticketManager, resetTickets } = useTicketManager();
  const { 
    game, 
    gameState, 
    round, 
    pattern, 
    totalEarned,
    startGame: startGameBase,
    handleGemClick: handleGemClickBase,
    resetGame: resetGameBase,
    updateGameState
  } = useGameEngine(ticketManager);
  const { timeLeft, startTimer, getTimerState } = useGameTimer();
  const {
    ghostIndices,
    shiningIndices,
    colorMap,
    chaosTimings,
    applyVariationEffects,
    resetEffects,
    setColorMap
  } = useVariationEffects();
  const { displayIndex, canInput, displayPattern: displayPatternBase, resetDisplay } = usePatternDisplay();
  const { handleGemClick: handleGemClickWrapper } = useGemClickHandler();
  const menuGemSize = useMenuGemSize();
  const { playGemSound, startBackgroundMusic, stopBackgroundMusic, getIsMusicPlaying } = useGameSounds();
  
  // Component state
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  // Keep music playing as long as we're not on the main menu
  // Music continues during game over screen



  const startGame = useCallback(async () => {
    startGameBase();
    
    // Start background music when game begins (if not already playing)
    if (!getIsMusicPlaying()) {
      await startBackgroundMusic();
    }
    
    const currentState = game.getState();
    
    if (currentState === GameState.CALIBRATION || 
        currentState === GameState.PATTERN_DISPLAY) {
      displayPattern();
    } else if (currentState === GameState.VARIATION_INTRO) {
      // Show variation intro for 3 seconds, then start pattern display
      setTimeout(() => {
        game.startPatternDisplay();
        updateGameState();
        displayPattern();
      }, 3000);
    }
  }, [game, startGameBase, updateGameState, startBackgroundMusic, getIsMusicPlaying]);

  const handleTimeout = useCallback(() => {
    game.handlePlayerInput(GemstoneType.EMERALD); // Force fail
    updateGameState();
  }, [game, updateGameState]);

  const startTimerWithTimeout = useCallback(() => {
    const timerDuration = game.getTimerSeconds();
    startTimer(timerDuration, handleTimeout);
  }, [game, startTimer, handleTimeout]);

  const displayPattern = useCallback(() => {
    displayPatternBase(
      game,
      round,
      applyVariationEffects,
      setColorMap,
      chaosTimings,
      () => {
        game.startPlayerInput();
        updateGameState();
        startTimerWithTimeout();
      },
      playGemSound // Pass the sound playing function
    );
  }, [game, round, applyVariationEffects, setColorMap, chaosTimings, displayPatternBase, updateGameState, startTimerWithTimeout, playGemSound]);

  const handleGemClick = useCallback((gemType: GemstoneType) => {
    // Play sound when gem is clicked
    playGemSound(gemType);
    
    handleGemClickWrapper(
      gemType,
      game,
      canInput,
      handleGemClickBase,
      (value) => { /* setCanInput is managed by usePatternDisplay hook */ },
      startGame, // onRoundComplete
      () => { // onVariationIntro
        game.startPatternDisplay();
        updateGameState();
        displayPattern();
      }
    );
  }, [game, canInput, handleGemClickBase, handleGemClickWrapper, startGame, updateGameState, displayPattern, playGemSound]);

  const resetGame = useCallback(() => {
    resetGameBase();
    resetDisplay();
    resetEffects();
    // Stop music when returning to main menu
    stopBackgroundMusic();
  }, [resetGameBase, resetDisplay, resetEffects, stopBackgroundMusic]);

  const resetTicketsAndGame = useCallback(() => {
    resetTickets();
    resetGame();
  }, [resetTickets, resetGame]);


  return (
    <div className="game-container flex flex-col items-center justify-center relative" style={{ backgroundColor: '#F5E6CF' }}>

      {/* Main Menu - Show when game hasn't started */}
      {gameState === GameState.INITIALIZATION && (
        <MenuContainer
          ticketManager={ticketManager}
          menuGemSize={menuGemSize}
          onStartGame={startGame}
          onShowHowToPlay={() => setShowHowToPlay(true)}
          onShowSettings={() => setShowSettings(true)}
          onShowAbout={() => setShowAbout(true)}
          onResetTickets={resetTicketsAndGame}
        />
      )}

      {/* How to Play Modal */}
      <HowToPlayModal isOpen={showHowToPlay} onClose={() => setShowHowToPlay(false)} />

      {/* Settings Modal */}
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />

      {/* About Modal */}
      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
      
      {/* Three-section Game Layout */}
      {gameState !== GameState.INITIALIZATION && (
        <div className="fixed flex flex-col" style={{ backgroundColor: '#F5E6CF', left: '10px', right: '10px', top: '0', bottom: '0' }}>
          
          {/* Section 1: Header - 20% height */}
          <GameHeader
            ticketManager={ticketManager}
            round={round}
            totalEarned={totalEarned}
            currentVariation={game.getCurrentVariation()}
            gameState={gameState}
            timeLeft={timeLeft}
            timerSeconds={game.getTimerSeconds()}
            getTimerState={getTimerState}
          />

          {/* Section 2: Gemstone Board - 70% height */}
          <GamePlayArea
            gameState={gameState}
            currentVariation={game.getCurrentVariation()}
            game={game}
            layout={layout}
            pattern={pattern}
            displayIndex={displayIndex}
            ghostIndices={ghostIndices}
            shiningIndices={shiningIndices}
            colorMap={colorMap}
            canInput={canInput}
            onGemClick={handleGemClick}
          />

          {/* Section 3: Footer - 10% height */}
          <GameFooter
            ticketManager={ticketManager}
            round={round}
            currentVariation={game.getCurrentVariation()}
          />
        </div>
      )}


      {/* Game Over Overlay */}
      <GameOverModal 
        gameState={gameState}
        round={round}
        totalEarned={totalEarned}
        onPlayAgain={resetGame}
      />
      
      {/* Round Complete Overlay */}
      <RoundCompleteOverlay 
        gameState={gameState}
        reward={game.getLastReward()}
      />

    </div>
  );
};