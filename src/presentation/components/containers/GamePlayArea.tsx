import React from 'react';
import { GameState, GemstoneType, GameVariation } from '@/core/game/types';
import { GameEngine } from '@/core/game/GameEngine';
import { Gemstone } from '../game/Gemstone';
import type { LayoutType } from '@/presentation/hooks';

// Helper function to format variation names for display
const formatVariationName = (variation: GameVariation | null): string => {
  if (!variation || variation === GameVariation.NONE) return '';
  
  switch(variation) {
    case GameVariation.REVERSE:
      return 'Enter the pattern in reverse';
    case GameVariation.GHOST:
      return 'Some Gems are fainter than usual';
    case GameVariation.SPEED_CHAOS:
      return 'Something is wierd about the gems...';
    case GameVariation.COLOR_SHUFFLE:
      return 'The colors are now wrong! Remember the Gems!';
    case GameVariation.SELECTIVE_ATTENTION:
      return 'Life is not Monochrome';
    case GameVariation.REVERSE_COMBINATION:
      return 'Reverse Combo. Remember to do it in Reverse!';
  }
};

interface GamePlayAreaProps {
  gameState: GameState;
  currentVariation: GameVariation | null;
  game: GameEngine;
  layout: LayoutType;
  pattern: GemstoneType[];
  displayIndex: number;
  ghostIndices: number[];
  shiningIndices: number[];
  colorMap: Map<GemstoneType, GemstoneType> | null;
  canInput: boolean;
  onGemClick: (gemType: GemstoneType) => void;
}

export const GamePlayArea: React.FC<GamePlayAreaProps> = ({
  gameState,
  currentVariation,
  game: _game, // Prefixed with _ to indicate it's intentionally unused
  layout,
  pattern,
  displayIndex,
  ghostIndices,
  shiningIndices,
  colorMap,
  canInput,
  onGemClick
}) => {
  return (
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
              <div className="text-sm text-purple-300 mt-1">{formatVariationName(currentVariation)}</div>
            </div>
          )}
          {gameState === GameState.PATTERN_DISPLAY && (
            <div className="text-center bg-blue-900/30 backdrop-blur-sm rounded-xl p-3 border border-blue-500/30">
              <div className="text-lg font-bold text-blue-400">Watch the Pattern!</div>
              {currentVariation && currentVariation !== GameVariation.NONE && (
                <div className="text-sm text-blue-300 mt-1">
                  {formatVariationName(currentVariation)}
                </div>
              )}
            </div>
          )}
          {gameState === GameState.PLAYER_INPUT && (
            <div className="text-center bg-green-900/30 backdrop-blur-sm rounded-xl p-3 border border-green-500/30">
              <div className="text-lg font-bold text-green-400">Your Turn!</div>
              <div className="text-sm text-green-300 mt-1">
                {currentVariation && currentVariation !== GameVariation.NONE 
                  ? formatVariationName(currentVariation)
                  : 'Repeat the pattern'}
              </div>
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
                Array.from(colorMap.entries()).find(([, v]) => v === GemstoneType.EMERALD)?.[0] || GemstoneType.EMERALD :
                GemstoneType.EMERALD}
              isActive={canInput || pattern[displayIndex] === GemstoneType.EMERALD}
              isHighlighted={pattern[displayIndex] === GemstoneType.EMERALD}
              isGhost={pattern[displayIndex] === GemstoneType.EMERALD && ghostIndices.includes(displayIndex)}
              isShining={pattern[displayIndex] === GemstoneType.EMERALD && shiningIndices.includes(displayIndex)}
              onClick={() => onGemClick(GemstoneType.EMERALD)}
              size={140}
              className="emerald"
            />
          </div>
          
          {/* Left gem (Cushion) */}
          <div className="absolute" style={{ left: '15%', top: '50%', transform: 'translate(-50%, -50%)' }}>
            <Gemstone
              type={colorMap && canInput ? 
                Array.from(colorMap.entries()).find(([, v]) => v === GemstoneType.CUSHION)?.[0] || GemstoneType.CUSHION :
                GemstoneType.CUSHION}
              isActive={canInput || pattern[displayIndex] === GemstoneType.CUSHION}
              isHighlighted={pattern[displayIndex] === GemstoneType.CUSHION}
              isGhost={pattern[displayIndex] === GemstoneType.CUSHION && ghostIndices.includes(displayIndex)}
              isShining={pattern[displayIndex] === GemstoneType.CUSHION && shiningIndices.includes(displayIndex)}
              onClick={() => onGemClick(GemstoneType.CUSHION)}
              size={140}
              className="cushion"
            />
          </div>
          
          {/* Right gem (Trillion) */}
          <div className="absolute" style={{ left: '85%', top: '50%', transform: 'translate(-50%, -50%)' }}>
            <Gemstone
              type={colorMap && canInput ? 
                Array.from(colorMap.entries()).find(([, v]) => v === GemstoneType.TRILLION)?.[0] || GemstoneType.TRILLION :
                GemstoneType.TRILLION}
              isActive={canInput || pattern[displayIndex] === GemstoneType.TRILLION}
              isHighlighted={pattern[displayIndex] === GemstoneType.TRILLION}
              isGhost={pattern[displayIndex] === GemstoneType.TRILLION && ghostIndices.includes(displayIndex)}
              isShining={pattern[displayIndex] === GemstoneType.TRILLION && shiningIndices.includes(displayIndex)}
              onClick={() => onGemClick(GemstoneType.TRILLION)}
              size={140}
              className="trillion"
            />
          </div>
          
          {/* Bottom gem (Marquise) */}
          <div className="absolute" style={{ left: '50%', top: '80%', transform: 'translate(-50%, -50%)' }}>
            <Gemstone
              type={colorMap && canInput ? 
                Array.from(colorMap.entries()).find(([, v]) => v === GemstoneType.MARQUISE)?.[0] || GemstoneType.MARQUISE :
                GemstoneType.MARQUISE}
              isActive={canInput || pattern[displayIndex] === GemstoneType.MARQUISE}
              isHighlighted={pattern[displayIndex] === GemstoneType.MARQUISE}
              isGhost={pattern[displayIndex] === GemstoneType.MARQUISE && ghostIndices.includes(displayIndex)}
              isShining={pattern[displayIndex] === GemstoneType.MARQUISE && shiningIndices.includes(displayIndex)}
              onClick={() => onGemClick(GemstoneType.MARQUISE)}
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
              Array.from(colorMap.entries()).find(([, v]) => v === gemType)?.[0] || gemType :
              gemType;
            
            return (
              <div key={gemType} className="mx-4">
                <Gemstone
                  type={displayType}
                  isActive={isActive}
                  isHighlighted={isHighlighted}
                  isGhost={isGhostGem}
                  isShining={isShining}
                  onClick={() => onGemClick(gemType)}
                  size={100}
                  className={gemType.toLowerCase()}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};