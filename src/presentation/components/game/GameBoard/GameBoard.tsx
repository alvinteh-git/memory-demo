import React, { useState, useCallback, useEffect } from 'react';
import { GameEngine } from '@/core/game/GameEngine';
import { GameState, GemstoneType, GameVariation } from '@/core/game/types';
import { GEMSTONES } from '@/core/game/constants';
import { TicketManager } from '@/core/economy/TicketManager';
import { loadTicketConfig } from '@/utils/yaml-loader';
import { Gemstone } from '../Gemstone';
import { TicketDisplay } from '../TicketDisplay';
import { cn } from '@/lib/utils';

// Check if mobile/tablet
const useResponsiveLayout = () => {
  const [layout, setLayout] = useState<'diamond' | 'line'>('diamond');
  
  useEffect(() => {
    const checkLayout = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const aspectRatio = width / height;
      
      // Mobile landscape: use line layout when width > height and on smaller screens
      if (aspectRatio > 1.2 && (width < 1024 || height < 600)) {
        setLayout('line');
      } else {
        setLayout('diamond');
      }
    };
    
    checkLayout();
    window.addEventListener('resize', checkLayout);
    return () => window.removeEventListener('resize', checkLayout);
  }, []);
  
  return layout;
};

export const GameBoard: React.FC = () => {
  const [game] = useState(() => new GameEngine());
  const [ticketManager, setTicketManager] = useState<TicketManager | null>(null);
  const [gameState, setGameState] = useState<GameState>(game.getState());
  const [round, setRound] = useState(game.getRound());
  const [pattern, setPattern] = useState<GemstoneType[]>([]);
  const layout = useResponsiveLayout();
  const [menuGemSize, setMenuGemSize] = useState(62);
  const [gameGemSize, setGameGemSize] = useState(160);
  const [displayIndex, setDisplayIndex] = useState(-1);
  const [canInput, setCanInput] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [lastEarned, setLastEarned] = useState<number | undefined>();
  const [totalEarned, setTotalEarned] = useState(0);
  const [feedbackLevel, setFeedbackLevel] = useState<'small' | 'medium' | 'large' | 'mega' | undefined>();
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  
  // Variation-specific states
  const [ghostIndices, setGhostIndices] = useState<number[]>([]);
  const [shiningIndices, setShiningIndices] = useState<number[]>([]);
  const [colorMap, setColorMap] = useState<Map<GemstoneType, GemstoneType> | null>(null);
  const [chaosTimings, setChaosTimings] = useState<number[] | null>(null);
  
  // Click debounce state
  const [lastClickTime, setLastClickTime] = useState(0);

  // Load ticket configuration on mount
  useEffect(() => {
    loadTicketConfig('/ticket_config.yml').then(config => {
      const tm = new TicketManager(config);
      setTicketManager(tm);
      game.setTicketManager(tm);
    }).catch(error => {
      console.error('Failed to load ticket config:', error);
    });
  }, [game]);

  // Handle gem sizes based on viewport and layout
  useEffect(() => {
    const handleResize = () => {
      // Menu gem sizing
      if (window.innerHeight < 500) {
        setMenuGemSize(40);
      } else if (window.innerHeight < 700) {
        setMenuGemSize(50);
      } else {
        setMenuGemSize(62);
      }
      
      // Game gem sizing
      if (layout === 'line') {
        // Line layout (mobile landscape)
        if (window.innerWidth < 768) {
          setGameGemSize(80);
        } else {
          setGameGemSize(100);
        }
      } else {
        // Diamond layout
        setGameGemSize(160);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [layout]);

  const updateGameState = useCallback(() => {
    setGameState(game.getState());
    setRound(game.getRound());
    setPattern(game.getPattern());
    setScore(game.getScore());
    
    // Update ticket display if round completed
    if (game.getState() === GameState.ROUND_COMPLETE && game.getLastReward() > 0) {
      const reward = game.getLastReward();
      setLastEarned(reward);
      setTotalEarned(prev => prev + reward);
      if (ticketManager) {
        setFeedbackLevel(ticketManager.getRewardFeedbackLevel(reward));
      }
      // Clear feedback after animation
      setTimeout(() => {
        setLastEarned(undefined);
        setFeedbackLevel(undefined);
      }, 3000);
    }
  }, [game, ticketManager]);

  const startGame = useCallback(() => {
    // Use ticket system if available
    if (ticketManager) {
      if (!game.startGameWithTickets()) {
        // Insufficient funds
        return;
      }
    } else {
      game.startGame();
    }
    
    updateGameState();
    
    const currentState = game.getState();
    console.log('After startGame, state is:', currentState, 'Round:', game.getRound());
    
    if (currentState === GameState.CALIBRATION || 
        currentState === GameState.PATTERN_DISPLAY) {
      displayPattern();
    } else if (currentState === GameState.VARIATION_INTRO) {
      console.log('Showing variation intro for:', game.getCurrentVariation());
      // Show variation intro for 3 seconds, then start pattern display
      setTimeout(() => {
        console.log('Transitioning from VARIATION_INTRO to PATTERN_DISPLAY');
        game.startPatternDisplay();
        updateGameState();
        displayPattern();
      }, 3000);
    }
  }, [game, updateGameState]);

  const displayPattern = useCallback(() => {
    const patternToShow = game.getPattern();
    const speed = game.getDisplaySpeed();
    const variation = game.getCurrentVariation();
    const variationManager = game.getVariationManager();
    
    // Helper to get color name from hex
    const getColorName = (gemType: GemstoneType) => {
      const color = GEMSTONES[gemType].color;
      // Map hex colors to names based on actual game colors
      switch(color) {
        case '#0CF574': return 'green';    // Emerald
        case '#DB5461': return 'red';      // Trillion
        case '#6461A0': return 'purple';   // Marquise
        case '#1CCAD8': return 'cyan';     // Cushion
        default: return color;
      }
    };
    
    // Debug: Log the solution pattern with colored blocks and names
    const colorNames = patternToShow.map(gemType => getColorName(gemType)).join(' ');
    
    // Build the console log arguments properly
    const logArgs: any[] = ['Round ' + game.getRound() + ' Pattern:'];
    patternToShow.forEach(gemType => {
      logArgs.push('%c█');
      logArgs.push(`color: ${GEMSTONES[gemType].color}; font-size: 20px;`);
    });
    
    console.log(...logArgs);
    console.log('   Colors:', colorNames);
    
    // Check for repeated gems and warn
    const hasRepeats = patternToShow.some((gem, i) => i > 0 && patternToShow[i - 1] === gem);
    if (hasRepeats) {
      console.log('   Note: Pattern contains repeated consecutive gems');
    }
    
    if (variation && variation !== GameVariation.NONE) {
      console.log('   Variation:', variation);
      if (variation === GameVariation.REVERSE || variation === GameVariation.REVERSE_COMBINATION) {
        const reversePattern = [...patternToShow].reverse();
        const reverseNames = reversePattern.map(gemType => getColorName(gemType)).join(' ');
        
        // Build reverse pattern log
        const reverseLogArgs: any[] = ['   REVERSE MODE - Input order:'];
        reversePattern.forEach(gemType => {
          reverseLogArgs.push('%c█');
          reverseLogArgs.push(`color: ${GEMSTONES[gemType].color}; font-size: 20px;`);
        });
        
        console.log(...reverseLogArgs);
        console.log('   Expected colors:', reverseNames);
      }
    }
    
    // Reset variation states
    setGhostIndices([]);
    setShiningIndices([]);
    setColorMap(null);
    setChaosTimings(null);
    
    // Apply variation-specific effects
    if (variation === GameVariation.GHOST || (variation === GameVariation.REVERSE_COMBINATION && variationManager.getCombinationBase() === GameVariation.GHOST)) {
      const ghostInfo = variationManager.getGhostIndices(patternToShow, round);
      setGhostIndices(ghostInfo.indices);
    }
    
    if (variation === GameVariation.SPEED_CHAOS || (variation === GameVariation.REVERSE_COMBINATION && variationManager.getCombinationBase() === GameVariation.SPEED_CHAOS)) {
      const timings = variationManager.getChaosTimings(patternToShow, round);
      setChaosTimings(timings);
    }
    
    if (variation === GameVariation.SELECTIVE_ATTENTION || (variation === GameVariation.REVERSE_COMBINATION && variationManager.getCombinationBase() === GameVariation.SELECTIVE_ATTENTION)) {
      const shining = variationManager.getShiningIndices(patternToShow, round);
      setShiningIndices(shining);
    }
    
    setCanInput(false);
    setDisplayIndex(-1);
    
    // Display each gem in sequence
    if (chaosTimings) {
      // Speed Chaos: Use random timings with gaps for repeated gems
      let cumulativeTime = 0;
      patternToShow.forEach((gemType, index) => {
        // Show the gem
        setTimeout(() => {
          setDisplayIndex(index);
        }, cumulativeTime);
        
        // Check if next gem is the same
        const nextGem = patternToShow[index + 1];
        const isRepeated = nextGem === gemType;
        
        if (isRepeated) {
          // Add a brief "off" period between repeated gems
          const gapTime = Math.min(chaosTimings[index] * 0.3, 150); // 30% of time or 150ms max
          setTimeout(() => {
            setDisplayIndex(-1); // Turn off display briefly
          }, cumulativeTime + chaosTimings[index] - gapTime);
          cumulativeTime += chaosTimings[index] + gapTime;
        } else {
          cumulativeTime += chaosTimings[index];
        }
      });
      
      // After pattern display with chaos timing
      setTimeout(() => {
        setDisplayIndex(-1);
        
        // Apply Color Shuffle if active
        if (variation === GameVariation.COLOR_SHUFFLE || (variation === GameVariation.REVERSE_COMBINATION && variationManager.getCombinationBase() === GameVariation.COLOR_SHUFFLE)) {
          const shuffled = variationManager.getShuffledColors();
          setColorMap(shuffled);
        }
        
        game.startPlayerInput();
        setCanInput(true);
        setLastClickTime(0); // Reset click debounce
        updateGameState();
        startTimer();
      }, cumulativeTime + 500);
    } else {
      // Normal timing with gaps for repeated gems
      let timeOffset = 0;
      patternToShow.forEach((gemType, index) => {
        // Show the gem
        setTimeout(() => {
          setDisplayIndex(index);
        }, timeOffset);
        
        // Check if next gem is the same - if so, add a brief gap
        const nextGem = patternToShow[index + 1];
        const isRepeated = nextGem === gemType;
        
        if (isRepeated) {
          // Add a brief "off" period between repeated gems
          const gapTime = speed * 0.3; // 30% of display time as gap
          setTimeout(() => {
            setDisplayIndex(-1); // Turn off display briefly
          }, timeOffset + speed - gapTime);
          timeOffset += speed + gapTime;
        } else {
          timeOffset += speed;
        }
      });
      
      // After pattern display, start player input
      setTimeout(() => {
        setDisplayIndex(-1);
        
        // Apply Color Shuffle if active
        if (variation === GameVariation.COLOR_SHUFFLE || (variation === GameVariation.REVERSE_COMBINATION && variationManager.getCombinationBase() === GameVariation.COLOR_SHUFFLE)) {
          const shuffled = variationManager.getShuffledColors();
          setColorMap(shuffled);
        }
        
        game.startPlayerInput();
        setCanInput(true);
        setLastClickTime(0); // Reset click debounce
        updateGameState();
        startTimer();
      }, timeOffset + 500);
    }
  }, [game, updateGameState, round]);

  const startTimer = useCallback(() => {
    const timerDuration = game.getTimerSeconds();
    setTimeLeft(timerDuration);
    
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [game]);

  const handleTimeout = useCallback(() => {
    game.handlePlayerInput(GemstoneType.EMERALD); // Force fail
    updateGameState();
  }, [game, updateGameState]);

  const handleGemClick = useCallback((gemType: GemstoneType) => {
    if (!canInput) return;
    
    // Debounce rapid clicks (prevent clicks within 150ms of each other)
    const now = Date.now();
    if (now - lastClickTime < 150) {
      console.log('   Click too fast, ignoring');
      return;
    }
    setLastClickTime(now);
    
    // Prevent clicks if we've already completed the pattern
    if (game.getPlayerInput().length >= game.getPattern().length) {
      console.log('   Pattern already complete, ignoring click');
      return;
    }
    
    // Helper to get color name
    const getColorName = (gem: GemstoneType) => {
      const color = GEMSTONES[gem].color;
      switch(color) {
        case '#0CF574': return 'green';    // Emerald
        case '#DB5461': return 'red';      // Trillion
        case '#6461A0': return 'purple';   // Marquise
        case '#1CCAD8': return 'cyan';     // Cushion
        default: return color;
      }
    };
    
    // Debug: Log the clicked gem with color
    const color = GEMSTONES[gemType].color;
    const colorName = getColorName(gemType);
    const playerInputBefore = game.getPlayerInput().length;
    const clickCount = playerInputBefore + 1;
    
    // Get expected gem, accounting for variations
    const pattern = game.getPattern();
    const variation = game.getCurrentVariation();
    let expectedGem: GemstoneType | undefined;
    
    if (pattern.length > 0 && clickCount <= pattern.length) {
      if (variation === GameVariation.REVERSE || variation === GameVariation.REVERSE_COMBINATION) {
        // In reverse mode, expect pattern from the end
        expectedGem = pattern[pattern.length - clickCount];
      } else {
        // Normal mode
        expectedGem = pattern[clickCount - 1];
      }
    }
    
    console.log(`   Player clicked #${clickCount}: %c█`, `color: ${color}; font-size: 20px;`, `(${colorName})`);
    
    // Log current game state before handling input
    const gameStateBefore = game.getState();
    const success = game.handlePlayerInput(gemType);
    const playerInputAfter = game.getPlayerInput().length;
    const gameStateAfter = game.getState();
    
    // Check if game state changed unexpectedly
    if (gameStateBefore !== GameState.PLAYER_INPUT) {
      if (gameStateBefore === GameState.ROUND_FAILED) {
        console.log(`   Too late! Timer expired - round already failed`);
      } else if (gameStateBefore === GameState.ROUND_COMPLETE) {
        console.log(`   Pattern already complete`);
      } else {
        console.warn(`   WARNING: Game not in PLAYER_INPUT state! State was: ${gameStateBefore}`);
      }
    }
    if (gameStateAfter !== gameStateBefore && gameStateAfter !== GameState.ROUND_COMPLETE && gameStateAfter !== GameState.ROUND_FAILED) {
      console.warn(`   WARNING: Unexpected state change from ${gameStateBefore} to ${gameStateAfter}`);
    }
    
    // Debug: Check if input array grew as expected
    if (success && playerInputAfter !== playerInputBefore + 1) {
      console.warn(`   WARNING: Player input grew from ${playerInputBefore} to ${playerInputAfter} (expected ${playerInputBefore + 1})`);
    } else if (!success && playerInputAfter !== playerInputBefore) {
      console.warn(`   WARNING: Failed input but array still grew from ${playerInputBefore} to ${playerInputAfter}`);
    }
    
    if (!success && gameStateBefore === GameState.PLAYER_INPUT) {
      setCanInput(false);
      if (expectedGem) {
        const expectedColor = getColorName(expectedGem);
        console.log(`   Wrong gem! Expected: ${expectedColor}, Got: ${colorName}`);
      } else {
        console.log(`   Wrong gem!`);
      }
    }
    
    updateGameState();
    
    if (game.getState() === GameState.ROUND_COMPLETE) {
      console.log('   Round complete!');
      setCanInput(false);
      setTimeout(() => {
        startGame(); // This will trigger the next round
      }, 1500);
    } else if (game.getState() === GameState.VARIATION_INTRO) {
      // If we get a variation intro during input handling, handle it
      setTimeout(() => {
        game.startPatternDisplay();
        updateGameState();
        displayPattern();
      }, 3000);
    }
  }, [game, canInput, updateGameState, startGame, lastClickTime]);

  const resetGame = useCallback(() => {
    game.resetGame();
    updateGameState();
    setDisplayIndex(-1);
    setCanInput(false);
    setTimeLeft(0);
    setLastEarned(undefined);
    setTotalEarned(0);
    setFeedbackLevel(undefined);
  }, [game, updateGameState]);

  const resetTickets = useCallback(() => {
    if (ticketManager) {
      ticketManager.reset();
      resetGame();
    }
  }, [ticketManager, resetGame]);

  const getTimerState = () => {
    const percentage = (timeLeft / game.getTimerSeconds()) * 100;
    if (percentage > 30) return 'normal';
    if (percentage > 10) return 'warning';
    return 'critical';
  };

  return (
    <div className="game-container flex flex-col items-center justify-center relative" style={{ backgroundColor: '#F5E6CF' }}>

      {/* Main Menu - Show when game hasn't started */}
      {gameState === GameState.INITIALIZATION && (
        <div className="flex flex-col items-center justify-center relative z-20 w-full h-full p-4">
          <div className="rounded-lg p-4 md:p-8 shadow-2xl w-full max-w-[400px] max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'rgba(245, 230, 207, 0.95)' }}>
            {/* Title */}
            <h1 className="text-2xl md:text-4xl font-bold text-center" style={{ color: '#2C2C2C', marginBottom: '12px' }}>
              GEMSTONE MEMORY
            </h1>
            
            {/* Gemstones - centered between title and buttons */}
            <div className="flex justify-between items-center mx-auto px-4" style={{ maxWidth: '320px', marginBottom: '16px', marginTop: '8px' }}>
              {Object.values(GemstoneType).map((gemType) => (
                <div key={gemType} className="flex items-center justify-center">
                  <Gemstone
                    type={gemType}
                    isActive={true}
                    size={menuGemSize}
                  />
                </div>
              ))}
            </div>

            {/* Menu Buttons */}
            <div className="space-y-2 md:space-y-4 flex flex-col items-center">
              {/* Play Game Button */}
              <div className="text-center w-full">
                <button
                  onClick={startGame}
                  disabled={!!(ticketManager && !ticketManager.canAffordGame())}
                  className={cn(
                    "w-3/4 md:w-1/2 px-4 md:px-6 py-2 md:py-3 rounded-lg font-bold text-base md:text-lg border-2",
                    ticketManager && !ticketManager.canAffordGame()
                      ? "border-gray-400 text-gray-400 cursor-not-allowed"
                      : "play-button-pulse"
                  )}
                >
                  PLAY GAME
                </button>
                {ticketManager && (
                  <p className="text-sm mt-2" style={{ color: '#4A4A4A' }}>
                    Cost: {ticketManager.getGameCost().toFixed(2)} tickets
                  </p>
                )}
              </div>

              {/* How to Play Button */}
              <button
                onClick={() => setShowHowToPlay(true)}
                className="w-3/4 md:w-1/2 px-4 md:px-6 py-2 md:py-3 rounded-lg font-bold text-base md:text-lg border-2 border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white transition-all hover:scale-[1.02]"
              >
                HOW TO PLAY
              </button>

              {/* Settings Button */}
              <button
                onClick={() => setShowSettings(true)}
                className="w-3/4 md:w-1/2 px-4 md:px-6 py-2 md:py-3 rounded-lg font-bold text-base md:text-lg border-2 border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white transition-all hover:scale-[1.02]"
              >
                SETTINGS
              </button>

              {/* About Button */}
              <button
                onClick={() => setShowAbout(true)}
                className="w-3/4 md:w-1/2 px-4 md:px-6 py-2 md:py-3 rounded-lg font-bold text-base md:text-lg border-2 border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white transition-all hover:scale-[1.02]"
              >
                ABOUT
              </button>
            </div>

            {/* Balance Section */}
            {ticketManager && (
              <div className="mt-6 md:mt-12 text-center">
                <p className="text-base md:text-lg mb-2 md:mb-3" style={{ color: '#2C2C2C' }}>
                  Balance: <span className="font-bold" style={{ color: '#6461A0' }}>{ticketManager.getBalance().toFixed(2)} tickets</span>
                </p>
                <button
                  onClick={resetTickets}
                  className="px-4 md:px-6 py-1.5 md:py-2 rounded-lg border-2 border-gray-500 text-gray-600 hover:bg-gray-600 hover:text-white transition-all text-xs md:text-sm font-semibold"
                >
                  RESET BALANCE
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* How to Play Modal */}
      {showHowToPlay && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 overflow-hidden">
          <div className="bg-gray-900 rounded-lg border-2 border-white/30 p-8 max-w-md">
            <h2 className="text-2xl font-bold text-white mb-4">How to Play</h2>
            <ul className="text-gray-300 space-y-3 mb-6">
              <li>• Watch the gemstone pattern carefully</li>
              <li>• Repeat the pattern in the correct order</li>
              <li>• Patterns get longer and faster each round</li>
              <li>• Special variations unlock as you progress</li>
              <li>• Earn tickets based on your performance</li>
            </ul>
            <button
              onClick={() => setShowHowToPlay(false)}
              className="w-full px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all font-semibold"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 overflow-hidden">
          <div className="bg-gray-900 rounded-lg border-2 border-white/30 p-8 max-w-md">
            <h2 className="text-2xl font-bold text-white mb-4">Settings</h2>
            <div className="text-gray-300 space-y-4 mb-6">
              <div>
                <label className="block mb-2">Sound Effects</label>
                <button className="px-4 py-2 rounded bg-gray-700 text-white">Coming Soon</button>
              </div>
              <div>
                <label className="block mb-2">Difficulty</label>
                <button className="px-4 py-2 rounded bg-gray-700 text-white">Normal</button>
              </div>
            </div>
            <button
              onClick={() => setShowSettings(false)}
              className="w-full px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all font-semibold"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 overflow-hidden">
          <div className="bg-gray-900 rounded-lg border-2 border-white/30 p-8 max-w-md">
            <h2 className="text-2xl font-bold text-white mb-4">About</h2>
            <div className="text-gray-300 space-y-3 mb-6">
              <p>Gemstone Memory is a progressive pattern-matching game that tests your memory and reflexes.</p>
              <p>Version: 1.0.0</p>
              <p>Built with React, TypeScript, and Vite</p>
            </div>
            <button
              onClick={() => setShowAbout(false)}
              className="w-full px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all font-semibold"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
      
      {/* Three-section Game Layout */}
      {gameState !== GameState.INITIALIZATION && (
        <div className="fixed flex flex-col" style={{ backgroundColor: '#F5E6CF', left: '10px', right: '10px', top: '0', bottom: '0' }}>
          
          {/* Section 1: Header - 20% height */}
          <div className="bg-black/20 text-white px-6 flex flex-col justify-center" style={{ height: '20vh' }}>
            {/* Row 1: Balance and Round */}
            <div className="flex justify-between w-full text-lg font-mono">
              <div>Balance: {ticketManager ? ticketManager.getBalance().toFixed(2) : '0.00'}</div>
              <div>Round: {String(round).padStart(2, '0')}</div>
            </div>
            
            {/* Row 2: Earned and Next */}
            <div className="flex justify-between w-full text-lg font-mono mt-2">
              <div>Earned: {totalEarned.toFixed(2)}</div>
              <div>Next: {ticketManager ? ticketManager.calculateReward(round, game.getCurrentVariation()).toFixed(2) : '0.00'}</div>
            </div>
            
            {/* Timer Bar */}
            <div className="mt-3 w-full">
              <div className="timer-bar">
                <div 
                  className={cn("timer-fill", gameState === GameState.PLAYER_INPUT ? getTimerState() : '')}
                  style={{ 
                    width: gameState === GameState.PLAYER_INPUT ? `${(timeLeft / game.getTimerSeconds()) * 100}%` : '0%',
                    opacity: gameState === GameState.PLAYER_INPUT ? 1 : 0
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Gemstone Board - 70% height */}
          <div className="relative overflow-hidden" style={{ height: '70vh', backgroundColor: '#F5E6CF' }}>
            {/* Game State Messages Overlay */}
            {(gameState === GameState.CALIBRATION || gameState === GameState.VARIATION_INTRO || 
              gameState === GameState.PATTERN_DISPLAY || gameState === GameState.PLAYER_INPUT) && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none">
                {gameState === GameState.CALIBRATION && (
                  <div className="text-center bg-yellow-900/30 backdrop-blur-sm rounded-xl p-3 border border-yellow-500/30">
                    <div className="text-lg font-bold text-yellow-400">Calibration Round</div>
                    <div className="text-sm text-yellow-300 mt-1">Watch and memorize all 4 gemstones!</div>
                  </div>
                )}
                {gameState === GameState.VARIATION_INTRO && (
                  <div className="text-center bg-purple-900/30 backdrop-blur-sm rounded-xl p-3 border border-purple-500/30">
                    <div className="text-lg font-bold text-purple-400">New Variation!</div>
                    <div className="text-sm text-purple-300 mt-1">{game.getCurrentVariation()}</div>
                  </div>
                )}
                {gameState === GameState.PATTERN_DISPLAY && (
                  <div className="text-center bg-blue-900/30 backdrop-blur-sm rounded-xl p-3 border border-blue-500/30">
                    <div className="text-lg font-bold text-blue-400">Watch the Pattern!</div>
                  </div>
                )}
                {gameState === GameState.PLAYER_INPUT && (
                  <div className="text-center bg-green-900/30 backdrop-blur-sm rounded-xl p-3 border border-green-500/30">
                    <div className="text-lg font-bold text-green-400">Your Turn!</div>
                    <div className="text-sm text-green-300 mt-1">Repeat the pattern</div>
                  </div>
                )}
              </div>
            )}
            
            {/* Gemstones Container */}
            {layout === 'diamond' ? (
              // Diamond layout - use percentage-based positioning
              <div className="relative w-full h-full">
                {/* Top gem (Emerald) */}
                <div className="absolute" style={{ left: '50%', top: '20%', transform: 'translate(-50%, -50%)' }}>
                  <Gemstone
                    type={colorMap && canInput ? 
                      Array.from(colorMap.entries()).find(([k, v]) => v === GemstoneType.EMERALD)?.[0] || GemstoneType.EMERALD :
                      GemstoneType.EMERALD}
                    isActive={canInput || pattern[displayIndex] === GemstoneType.EMERALD}
                    isHighlighted={pattern[displayIndex] === GemstoneType.EMERALD}
                    isGhost={pattern[displayIndex] === GemstoneType.EMERALD && ghostIndices.includes(displayIndex)}
                    isShining={pattern[displayIndex] === GemstoneType.EMERALD && shiningIndices.includes(displayIndex)}
                    onClick={() => handleGemClick(GemstoneType.EMERALD)}
                    size={140}
                    className="emerald"
                  />
                </div>
                
                {/* Left gem (Cushion) */}
                <div className="absolute" style={{ left: '15%', top: '50%', transform: 'translate(-50%, -50%)' }}>
                  <Gemstone
                    type={colorMap && canInput ? 
                      Array.from(colorMap.entries()).find(([k, v]) => v === GemstoneType.CUSHION)?.[0] || GemstoneType.CUSHION :
                      GemstoneType.CUSHION}
                    isActive={canInput || pattern[displayIndex] === GemstoneType.CUSHION}
                    isHighlighted={pattern[displayIndex] === GemstoneType.CUSHION}
                    isGhost={pattern[displayIndex] === GemstoneType.CUSHION && ghostIndices.includes(displayIndex)}
                    isShining={pattern[displayIndex] === GemstoneType.CUSHION && shiningIndices.includes(displayIndex)}
                    onClick={() => handleGemClick(GemstoneType.CUSHION)}
                    size={140}
                    className="cushion"
                  />
                </div>
                
                {/* Right gem (Trillion) */}
                <div className="absolute" style={{ left: '85%', top: '50%', transform: 'translate(-50%, -50%)' }}>
                  <Gemstone
                    type={colorMap && canInput ? 
                      Array.from(colorMap.entries()).find(([k, v]) => v === GemstoneType.TRILLION)?.[0] || GemstoneType.TRILLION :
                      GemstoneType.TRILLION}
                    isActive={canInput || pattern[displayIndex] === GemstoneType.TRILLION}
                    isHighlighted={pattern[displayIndex] === GemstoneType.TRILLION}
                    isGhost={pattern[displayIndex] === GemstoneType.TRILLION && ghostIndices.includes(displayIndex)}
                    isShining={pattern[displayIndex] === GemstoneType.TRILLION && shiningIndices.includes(displayIndex)}
                    onClick={() => handleGemClick(GemstoneType.TRILLION)}
                    size={140}
                    className="trillion"
                  />
                </div>
                
                {/* Bottom gem (Marquise) */}
                <div className="absolute" style={{ left: '50%', top: '80%', transform: 'translate(-50%, -50%)' }}>
                  <Gemstone
                    type={colorMap && canInput ? 
                      Array.from(colorMap.entries()).find(([k, v]) => v === GemstoneType.MARQUISE)?.[0] || GemstoneType.MARQUISE :
                      GemstoneType.MARQUISE}
                    isActive={canInput || pattern[displayIndex] === GemstoneType.MARQUISE}
                    isHighlighted={pattern[displayIndex] === GemstoneType.MARQUISE}
                    isGhost={pattern[displayIndex] === GemstoneType.MARQUISE && ghostIndices.includes(displayIndex)}
                    isShining={pattern[displayIndex] === GemstoneType.MARQUISE && shiningIndices.includes(displayIndex)}
                    onClick={() => handleGemClick(GemstoneType.MARQUISE)}
                    size={140}
                    className="marquise"
                  />
                </div>
              </div>
            ) : (
              // Line layout
              <div className="w-full h-full flex items-center justify-center">
                {Object.values(GemstoneType).map((gemType) => {
                  const isHighlighted = pattern[displayIndex] === gemType;
                  const isActive = canInput || isHighlighted;
                  
                  // Apply variation visual effects
                  const isGhostGem = isHighlighted && ghostIndices.includes(displayIndex);
                  const isShining = isHighlighted && shiningIndices.includes(displayIndex);
                  
                  // Apply color shuffle
                  const displayType = colorMap && canInput ? 
                    Array.from(colorMap.entries()).find(([k, v]) => v === gemType)?.[0] || gemType :
                    gemType;
                  
                  return (
                    <div key={gemType} className="mx-4">
                      <Gemstone
                        type={displayType}
                        isActive={isActive}
                        isHighlighted={isHighlighted}
                        isGhost={isGhostGem}
                        isShining={isShining}
                        onClick={() => handleGemClick(gemType)}
                        size={100}
                        className={gemType.toLowerCase()}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 3: Footer - 10% height */}
          <div className="bg-black/20 text-white flex items-center justify-center" style={{ height: '10vh' }}>
            <div className="text-center text-lg font-mono">
              Current Round Reward: {ticketManager ? ticketManager.calculateReward(round, game.getCurrentVariation()).toFixed(2) : '0.00'}
            </div>
          </div>
        </div>
      )}


      {/* Game Over Overlay */}
      {gameState === GameState.ROUND_FAILED && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="text-center space-y-4 bg-gray-900 p-8 rounded-lg">
            <div className="text-3xl font-bold text-red-400">
              Game Over!
            </div>
            <div className="text-xl text-gray-300">
              Reached Round {round}
            </div>
            <div className="text-lg text-gray-300">
              Total Earned: {totalEarned.toFixed(2)} tickets
            </div>
            <button
              onClick={resetGame}
              className="px-8 py-3 rounded-lg font-semibold transition-colors bg-blue-600 text-white hover:bg-blue-700"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
      
      {/* Round Complete Overlay */}
      {gameState === GameState.ROUND_COMPLETE && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="text-center bg-green-900/30 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
            <div className="text-2xl font-bold text-green-400">
              Round Complete!
            </div>
            <div className="text-lg text-green-300 mt-2">
              +{game.getLastReward() > 0 ? game.getLastReward().toFixed(2) : '0.00'} tickets
            </div>
          </div>
        </div>
      )}

    </div>
  );
};