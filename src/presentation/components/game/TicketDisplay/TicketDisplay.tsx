import React from 'react';
import { Card } from '@/presentation/components/ui/card';
import { Button } from '@/presentation/components/ui/button';
import { Coins, TrendingUp, Trophy, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TicketDisplayProps {
  balance: number;
  gameCost: number;
  canAfford: boolean;
  nextReward?: number;
  lastEarned?: number;
  feedbackLevel?: 'small' | 'medium' | 'large' | 'mega';
  highestRound?: number;
  gamesPlayed?: number;
  onReset?: () => void;
  showStats?: boolean;
  precision?: number;
}

export const TicketDisplay: React.FC<TicketDisplayProps> = ({
  balance,
  gameCost,
  canAfford,
  nextReward,
  lastEarned,
  feedbackLevel,
  highestRound = 0,
  gamesPlayed = 0,
  onReset,
  showStats = false,
  precision = 2
}) => {
  const formatTickets = (value: number) => {
    return value.toFixed(precision);
  };

  const getEarnedColor = () => {
    if (!feedbackLevel) return 'text-muted-foreground';
    switch (feedbackLevel) {
      case 'small': return 'text-white';
      case 'medium': return 'text-yellow-400';
      case 'large': return 'text-green-400';
      case 'mega': return 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400';
      default: return 'text-muted-foreground';
    }
  };

  const getEarnedAnimation = () => {
    if (!feedbackLevel) return '';
    switch (feedbackLevel) {
      case 'medium': return 'animate-pulse';
      case 'large': return 'animate-bounce';
      case 'mega': return 'animate-pulse scale-110';
      default: return '';
    }
  };

  return (
    <div className="space-y-3">
      {/* Main Balance Display */}
      <Card className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 p-4 border-blue-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Coins className="w-6 h-6 text-yellow-400" />
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Balance</p>
              <p className={cn(
                "text-2xl font-bold",
                canAfford ? "text-white" : "text-red-400"
              )}>
                {formatTickets(balance)}
              </p>
            </div>
          </div>
          
          {/* Cost to Play */}
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Cost to Play</p>
            <p className="text-lg font-semibold text-white">
              -{formatTickets(gameCost)}
            </p>
          </div>
        </div>
        
        {/* Insufficient Funds Warning */}
        {!canAfford && (
          <div className="mt-3 p-2 bg-red-900/30 rounded border border-red-500/50">
            <p className="text-xs text-red-400 text-center">
              Insufficient tickets! Need {formatTickets(gameCost - balance)} more
            </p>
          </div>
        )}
      </Card>

      {/* Last Earned Display */}
      {lastEarned !== undefined && lastEarned > 0 && (
        <Card className={cn(
          "p-3 bg-green-900/30 border-green-500/30 transition-all duration-500",
          getEarnedAnimation()
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-sm text-green-400">Earned</span>
            </div>
            <span className={cn(
              "text-lg font-bold",
              getEarnedColor(),
              getEarnedAnimation()
            )}>
              +{formatTickets(lastEarned)}
            </span>
          </div>
        </Card>
      )}

      {/* Next Reward Preview */}
      {nextReward !== undefined && (
        <Card className="p-3 bg-purple-900/30 border-purple-500/30">
          <div className="flex items-center justify-between">
            <span className="text-sm text-purple-300">Next Round Reward</span>
            <span className="text-lg font-semibold text-purple-200">
              {formatTickets(nextReward)}
            </span>
          </div>
        </Card>
      )}

      {/* Statistics */}
      {showStats && (
        <Card className="p-3 bg-gray-900/30 border-gray-500/30">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span className="text-muted-foreground">Highest Round</span>
              </div>
              <span className="font-semibold text-white">{highestRound}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Games Played</span>
              <span className="font-semibold text-white">{gamesPlayed}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Reset Button */}
      {onReset && (
        <Button
          onClick={onReset}
          variant="outline"
          size="sm"
          className="w-full bg-gray-900/50 border-gray-600 hover:bg-gray-800/50"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset Balance
        </Button>
      )}
    </div>
  );
};