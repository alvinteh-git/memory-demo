import React from 'react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 overflow-hidden p-8">
      <div className="rounded-lg border-2 border-gray-600 max-w-md w-full shadow-2xl" style={{ backgroundColor: '#F5E6CF', padding: '2ch' }}>
        <h2 className="text-2xl font-bold mb-4" style={{ color: '#2C2C2C' }}>How to Play</h2>
        <ul className="space-y-3 mb-6" style={{ color: '#4A4A4A' }}>
          <li>Watch the gemstone pattern carefully</li>
          <li>Repeat the pattern in the correct order</li>
          <li>Patterns get longer and faster each round</li>
          <li>Special variations unlock as you progress</li>
          <li>Earn tickets based on your performance</li>
        </ul>
        <button
          onClick={onClose}
          className="w-full px-6 py-3 rounded-lg border-2 border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white transition-all font-semibold"
        >
          CLOSE
        </button>
      </div>
    </div>
  );
};