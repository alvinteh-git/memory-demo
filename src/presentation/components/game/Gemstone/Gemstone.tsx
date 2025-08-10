import React from 'react';
import { GemstoneType } from '@/core/game/types';
import { GEMSTONES } from '@/core/game/constants';
import { cn } from '@/lib/utils';

interface GemstoneProps {
  type: GemstoneType;
  isActive: boolean;
  isHighlighted?: boolean;
  isGhost?: boolean;
  isShining?: boolean;
  onClick?: () => void;
  size?: number;
  className?: string;
}

const GemstoneShapes: Record<GemstoneType, () => React.ReactElement> = {
  [GemstoneType.EMERALD]: () => (
    <g strokeLinejoin="miter">
      {/* Outer shape with cut corners - filled */}
      <path d="M 25 15 L 75 15 L 85 25 L 85 75 L 75 85 L 25 85 L 15 75 L 15 25 Z" 
            fill="currentColor" opacity="0.9"/>
      {/* Top facets */}
      <line x1="25" y1="15" x2="35" y2="30" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
      <line x1="75" y1="15" x2="65" y2="30" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
      {/* Bottom facets */}
      <line x1="25" y1="85" x2="35" y2="70" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5"/>
      <line x1="75" y1="85" x2="65" y2="70" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5"/>
      {/* Side facets */}
      <line x1="15" y1="25" x2="30" y2="35" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
      <line x1="85" y1="25" x2="70" y2="35" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5"/>
      <line x1="15" y1="75" x2="30" y2="65" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5"/>
      <line x1="85" y1="75" x2="70" y2="65" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5"/>
      {/* Center rectangle highlight */}
      <rect x="30" y="30" width="40" height="40" fill="rgba(255,255,255,0.2)"/>
    </g>
  ),
  [GemstoneType.TRILLION]: () => (
    <g strokeLinejoin="miter">
      {/* Outer triangle with slightly curved sides - filled */}
      <path d="M 50 15 Q 72 42 80 72 Q 65 82 50 85 Q 35 82 20 72 Q 28 42 50 15 Z" 
            fill="currentColor" opacity="0.9"/>
      {/* Center to corners */}
      <line x1="50" y1="50" x2="50" y2="15" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
      <line x1="50" y1="50" x2="20" y2="72" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
      <line x1="50" y1="50" x2="80" y2="72" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
      {/* Edge facets */}
      <line x1="50" y1="15" x2="35" y2="43" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
      <line x1="50" y1="15" x2="65" y2="43" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
      <line x1="20" y1="72" x2="35" y2="57" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5"/>
      <line x1="80" y1="72" x2="65" y2="57" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5"/>
      {/* Inner triangle highlight */}
      <path d="M 50 35 L 65 57 L 35 57 Z" fill="rgba(255,255,255,0.2)"/>
    </g>
  ),
  [GemstoneType.MARQUISE]: () => (
    <g strokeLinejoin="miter">
      {/* Outer marquise shape (eye/football shape) - filled */}
      <path d="M 15 50 Q 25 25 50 25 Q 75 25 85 50 Q 75 75 50 75 Q 25 75 15 50 Z" 
            fill="currentColor" opacity="0.9"/>
      {/* Center line */}
      <line x1="15" y1="50" x2="85" y2="50" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5"/>
      {/* Top facets */}
      <line x1="50" y1="25" x2="30" y2="40" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
      <line x1="50" y1="25" x2="70" y2="40" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
      <line x1="50" y1="25" x2="50" y2="50" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
      {/* Bottom facets */}
      <line x1="50" y1="75" x2="30" y2="60" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5"/>
      <line x1="50" y1="75" x2="70" y2="60" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5"/>
      <line x1="50" y1="75" x2="50" y2="50" stroke="rgba(0,0,0,0.1)" strokeWidth="1.5"/>
      {/* Side facets */}
      <line x1="15" y1="50" x2="30" y2="40" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
      <line x1="15" y1="50" x2="30" y2="60" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5"/>
      <line x1="85" y1="50" x2="70" y2="40" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
      <line x1="85" y1="50" x2="70" y2="60" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5"/>
      {/* Inner marquise highlight */}
      <path d="M 30 50 Q 35 40 50 40 Q 65 40 70 50 Q 65 60 50 60 Q 35 60 30 50 Z" 
            fill="rgba(255,255,255,0.2)"/>
    </g>
  ),
  [GemstoneType.CUSHION]: () => (
    <g strokeLinejoin="miter">
      {/* Outer cushion shape (rounded square) - filled */}
      <rect x="20" y="20" width="60" height="60" rx="12" ry="12" 
            fill="currentColor" opacity="0.9"/>
      {/* Corner to corner diagonals */}
      <line x1="20" y1="20" x2="80" y2="80" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5"/>
      <line x1="80" y1="20" x2="20" y2="80" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5"/>
      {/* Center cross */}
      <line x1="50" y1="20" x2="50" y2="80" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"/>
      <line x1="20" y1="50" x2="80" y2="50" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"/>
      {/* Corner facets */}
      <line x1="32" y1="20" x2="20" y2="32" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
      <line x1="68" y1="20" x2="80" y2="32" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
      <line x1="32" y1="80" x2="20" y2="68" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5"/>
      <line x1="68" y1="80" x2="80" y2="68" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5"/>
      {/* Mid facets */}
      <line x1="50" y1="35" x2="35" y2="50" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
      <line x1="50" y1="35" x2="65" y2="50" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
      <line x1="50" y1="65" x2="35" y2="50" stroke="rgba(0,0,0,0.15)" strokeWidth="1.5"/>
      <line x1="50" y1="65" x2="65" y2="50" stroke="rgba(0,0,0,0.15)" strokeWidth="1.5"/>
      {/* Inner cushion highlight */}
      <rect x="35" y="35" width="30" height="30" rx="6" ry="6" 
            fill="rgba(255,255,255,0.2)"/>
    </g>
  )
};

export const Gemstone: React.FC<GemstoneProps> = ({ 
  type, 
  isActive,
  isHighlighted = false,
  isGhost = false,
  isShining = false,
  onClick, 
  size = 80,
  className
}) => {
  const config = GEMSTONES[type];
  const color = isActive ? config.color : config.inactiveColor;
  const gemClassName = type.toLowerCase();
  
  // If no onClick handler, render as div instead of button
  const Container = onClick ? 'button' : 'div';
  
  const handleClick = onClick ? (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isActive && onClick) {
      onClick();
    }
  } : undefined;

  return (
    <Container
      onClick={handleClick}
      disabled={onClick ? !isActive : undefined}
      className={cn(
        "gemstone-container",
        className
      )}
      style={{
        width: size,
        height: size,
        background: 'transparent',
        border: 'none',
        outline: 'none',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className={cn(
          "gemstone",
          gemClassName,
          isHighlighted && "highlighted",
          !isActive && "inactive",
          isGhost && "ghost",
          isShining && "shining"
        )}
        style={{ 
          '--ghost-opacity': isGhost ? '0.4' : '1',
          color: color,
          fill: color
        } as React.CSSProperties}
      >
        {GemstoneShapes[type]()}
      </svg>
    </Container>
  );
};