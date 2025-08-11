import React, { useState, useEffect } from 'react';
import { useGameSounds } from '@/presentation/hooks';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { getMuted, setMuted, getVolume, setVolume, getMusicVolume, setMusicVolume } = useGameSounds();
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolumeState] = useState(70);
  const [musicVolume, setMusicVolumeState] = useState(50);

  useEffect(() => {
    if (isOpen) {
      setIsMuted(getMuted());
      setVolumeState(Math.round(getVolume() * 100));
      setMusicVolumeState(Math.round(getMusicVolume() * 100));
    }
  }, [isOpen, getMuted, getVolume, getMusicVolume]);

  const handleMuteToggle = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    setMuted(newMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolumeState(newVolume);
    setVolume(newVolume / 100);
  };

  const handleMusicVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setMusicVolumeState(newVolume);
    setMusicVolume(newVolume / 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 overflow-hidden p-8">
      <div className="rounded-lg border-2 border-gray-600 max-w-md w-full shadow-2xl" style={{ backgroundColor: '#F5E6CF', padding: '2ch' }}>
        <h2 className="text-2xl font-bold mb-6" style={{ color: '#2C2C2C' }}>Settings</h2>
        
        <div className="space-y-6">
          {/* Sound Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#2C2C2C' }}>Sound Effects</h3>
            
            {/* Mute Toggle */}
            <div className="flex items-center justify-between mb-4">
              <label style={{ color: '#4A4A4A' }}>Enable Sound</label>
              <button
                onClick={handleMuteToggle}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  isMuted 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isMuted ? 'OFF' : 'ON'}
              </button>
            </div>
            
            {/* Volume Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label style={{ color: '#4A4A4A' }}>Volume</label>
                <span style={{ color: '#6461A0' }}>{volume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={handleVolumeChange}
                disabled={isMuted}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
                style={{
                  background: isMuted 
                    ? '#374151' 
                    : `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${volume}%, #374151 ${volume}%, #374151 100%)`
                }}
              />
            </div>
          </div>

          {/* Background Music Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#2C2C2C' }}>Background Music</h3>
            
            {/* Music Volume Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label style={{ color: '#4A4A4A' }}>Music Volume</label>
                <span style={{ color: '#6461A0' }}>{musicVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={musicVolume}
                onChange={handleMusicVolumeChange}
                disabled={isMuted}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-purple-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
                style={{
                  background: isMuted 
                    ? '#374151' 
                    : `linear-gradient(to right, #8B5CF6 0%, #8B5CF6 ${musicVolume}%, #374151 ${musicVolume}%, #374151 100%)`
                }}
              />
            </div>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="w-full mt-8 px-6 py-3 rounded-lg border-2 border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white transition-all font-semibold"
        >
          CLOSE
        </button>
      </div>
    </div>
  );
};