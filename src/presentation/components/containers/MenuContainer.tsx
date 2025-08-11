import React from 'react';
import { GemstoneType } from '@/core/game/types';
import { TicketManager } from '@/core/economy/TicketManager';
import { Gemstone } from '../game/Gemstone';
import { cn } from '@/lib/utils';

interface MenuContainerProps {
  ticketManager: TicketManager | null;
  menuGemSize: number;
  onStartGame: () => void;
  onShowHowToPlay: () => void;
  onShowSettings: () => void;
  onShowAbout: () => void;
  onResetTickets: () => void;
}

export const MenuContainer: React.FC<MenuContainerProps> = ({
  ticketManager,
  menuGemSize,
  onStartGame,
  onShowHowToPlay,
  onShowSettings,
  onShowAbout,
  onResetTickets
}) => {
  return (
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
              onClick={onStartGame}
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
            onClick={onShowHowToPlay}
            className="w-3/4 md:w-1/2 px-4 md:px-6 py-2 md:py-3 rounded-lg font-bold text-base md:text-lg border-2 border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white transition-all hover:scale-[1.02]"
          >
            HOW TO PLAY
          </button>

          {/* Settings Button */}
          <button
            onClick={onShowSettings}
            className="w-3/4 md:w-1/2 px-4 md:px-6 py-2 md:py-3 rounded-lg font-bold text-base md:text-lg border-2 border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white transition-all hover:scale-[1.02]"
          >
            SETTINGS
          </button>

          {/* About Button */}
          <button
            onClick={onShowAbout}
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
              onClick={onResetTickets}
              className="px-4 md:px-6 py-1.5 md:py-2 rounded-lg border-2 border-gray-500 text-gray-600 hover:bg-gray-600 hover:text-white transition-all text-xs md:text-sm font-semibold"
            >
              RESET BALANCE
            </button>
          </div>
        )}
      </div>
    </div>
  );
};