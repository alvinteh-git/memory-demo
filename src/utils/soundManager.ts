import { GemstoneType } from '@/core/game/types';

// Import sound files
import BShortChime from '@/assets/sounds/BShortChime.mp3';
import CSharpShortChime from '@/assets/sounds/CSharpShortChime.mp3';
import FSharpShortChime from '@/assets/sounds/FSharpShortChime.mp3';
import GSharpShortChime from '@/assets/sounds/GSharpShortChime.mp3';
import GameBackgroundMusic from '@/assets/sounds/GameBackgroundMusic.mp3';

// Map gemstones to their sound files
const GEMSTONE_SOUNDS: Record<GemstoneType, string> = {
  [GemstoneType.EMERALD]: FSharpShortChime,    // Green - F#
  [GemstoneType.TRILLION]: GSharpShortChime,   // Red - G#
  [GemstoneType.MARQUISE]: BShortChime,        // Purple - B
  [GemstoneType.CUSHION]: CSharpShortChime,    // Cyan - C#
};

class SoundManager {
  private audioContext: AudioContext | null = null;
  private audioBuffers: Map<GemstoneType, AudioBuffer> = new Map();
  private backgroundMusicBuffer: AudioBuffer | null = null;
  private backgroundMusicSource: AudioBufferSourceNode | null = null;
  private backgroundMusicGainNode: GainNode | null = null;
  private currentSources: Set<AudioBufferSourceNode> = new Set();
  private isMuted: boolean = false;
  private volume: number = 0.1; // Default volume at 70%
  private musicVolume: number = 0.1; // Background music at 50% by default
  private musicPlaying: boolean = false;

  constructor() {
    // Initialize on first user interaction to comply with browser autoplay policies
    if (typeof window !== 'undefined') {
      this.initializeOnInteraction();
    }
  }

  private initializeOnInteraction() {
    const initHandler = async () => {
      if (!this.audioContext) {
        await this.initialize();
      }
      // Remove listeners after initialization
      document.removeEventListener('click', initHandler);
      document.removeEventListener('touchstart', initHandler);
    };

    document.addEventListener('click', initHandler, { once: true });
    document.addEventListener('touchstart', initHandler, { once: true });
  }

  private async initialize() {
    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Load all sounds
      await this.loadAllSounds();
    } catch (error) {
      console.error('Failed to initialize sound manager:', error);
    }
  }

  private async loadAllSounds() {
    if (!this.audioContext) return;

    // Load gem sounds
    const loadPromises = Object.entries(GEMSTONE_SOUNDS).map(async ([gemType, soundUrl]) => {
      try {
        const response = await fetch(soundUrl);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer);
        this.audioBuffers.set(gemType as GemstoneType, audioBuffer);
      } catch (error) {
        console.error(`Failed to load sound for ${gemType}:`, error);
      }
    });

    // Load background music
    loadPromises.push(
      fetch(GameBackgroundMusic)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => this.audioContext!.decodeAudioData(arrayBuffer))
        .then(audioBuffer => {
          this.backgroundMusicBuffer = audioBuffer;
        })
        .catch(error => {
          console.error('Failed to load background music:', error);
        })
    );

    await Promise.all(loadPromises);
  }

  public playGemSound(gemType: GemstoneType) {
    if (this.isMuted || !this.audioContext || !this.audioBuffers.has(gemType)) {
      return;
    }

    try {
      const buffer = this.audioBuffers.get(gemType)!;
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      // Set up the audio graph
      source.buffer = buffer;
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Set initial volume
      gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
      
      // Play for 2 seconds then fade out quickly (over 200ms)
      const playDuration = 2.0; // Play for 2 seconds
      const fadeOutDuration = 0.2; // Fade out over 200ms
      const fadeOutStartTime = this.audioContext.currentTime + playDuration;
      
      // Schedule the fade out
      gainNode.gain.setValueAtTime(this.volume, fadeOutStartTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, fadeOutStartTime + fadeOutDuration);
      
      // Start playing
      source.start(0);
      
      // Stop the source after fade out completes
      source.stop(fadeOutStartTime + fadeOutDuration);
      
      // Track this source
      this.currentSources.add(source);
      
      // Clean up when done
      source.onended = () => {
        this.currentSources.delete(source);
        source.disconnect();
        gainNode.disconnect();
      };
    } catch (error) {
      console.error('Error playing gem sound:', error);
    }
  }

  public async startBackgroundMusic() {
    // Ensure audio context is initialized first
    await this.ensureAudioContext();
    
    if (this.isMuted || !this.audioContext || !this.backgroundMusicBuffer || this.musicPlaying) {
      return;
    }

    try {
      // Create nodes for background music
      this.backgroundMusicSource = this.audioContext.createBufferSource();
      this.backgroundMusicGainNode = this.audioContext.createGain();
      
      // Set up the audio graph
      this.backgroundMusicSource.buffer = this.backgroundMusicBuffer;
      this.backgroundMusicSource.loop = true; // Enable looping
      this.backgroundMusicSource.connect(this.backgroundMusicGainNode);
      this.backgroundMusicGainNode.connect(this.audioContext.destination);
      
      // Set volume
      this.backgroundMusicGainNode.gain.setValueAtTime(this.musicVolume, this.audioContext.currentTime);
      
      // Start playing
      this.backgroundMusicSource.start(0);
      this.musicPlaying = true;
      
      // Handle when music ends (shouldn't happen with loop, but just in case)
      this.backgroundMusicSource.onended = () => {
        this.musicPlaying = false;
        this.backgroundMusicSource = null;
        this.backgroundMusicGainNode = null;
      };
    } catch (error) {
      console.error('Error starting background music:', error);
    }
  }

  public stopBackgroundMusic() {
    if (this.backgroundMusicSource) {
      try {
        this.backgroundMusicSource.stop();
      } catch (error) {
        // Source may have already stopped
      }
      this.backgroundMusicSource = null;
      this.backgroundMusicGainNode = null;
      this.musicPlaying = false;
    }
  }

  public setMusicVolume(volume: number) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.backgroundMusicGainNode && this.audioContext) {
      this.backgroundMusicGainNode.gain.setValueAtTime(this.musicVolume, this.audioContext.currentTime);
    }
  }

  public getMusicVolume(): number {
    return this.musicVolume;
  }

  public getIsMusicPlaying(): boolean {
    return this.musicPlaying;
  }

  public stopAllSounds() {
    this.currentSources.forEach(source => {
      try {
        source.stop();
      } catch (error) {
        // Source may have already stopped
      }
    });
    this.currentSources.clear();
    this.stopBackgroundMusic();
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopAllSounds();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume)); // Clamp between 0 and 1
  }

  public getVolume(): number {
    return this.volume;
  }

  // Ensure audio context is resumed (for browser autoplay policies)
  public async ensureAudioContext() {
    // Initialize if not already done
    if (!this.audioContext) {
      await this.initialize();
    }
    
    // Resume if suspended
    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch (error) {
        console.error('Failed to resume audio context:', error);
      }
    }
  }
}

// Export singleton instance
export const soundManager = new SoundManager();