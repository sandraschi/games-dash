/**
 * Sound Management System
 * **Timestamp**: 2026-01-21
 *
 * Unified sound system for games:
 * - Audio context management
 * - Sound effect playback
 * - Background music
 * - Volume controls
 * - Web Audio API integration
 * - Fallback support
 */

class SoundManager {
    constructor(options = {}) {
        this.options = {
            enableSound: options.enableSound ?? true,
            masterVolume: options.masterVolume || 0.7,
            sfxVolume: options.sfxVolume || 0.8,
            musicVolume: options.musicVolume || 0.5,
            maxConcurrentSounds: options.maxConcurrentSounds || 10,
            ...options
        };

        this.audioContext = null;
        this.sounds = new Map();
        this.musicTracks = new Map();
        this.activeSounds = new Set();
        this.currentMusic = null;
        this.isInitialized = false;

        this.init();
    }

    /**
     * Initialize audio system
     */
    async init() {
        if (!this.options.enableSound) {
            console.log('🔇 Sound system disabled');
            return;
        }

        try {
            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Resume context if suspended (required by browsers)
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            // Set up gain nodes
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = this.options.masterVolume;
            this.masterGain.connect(this.audioContext.destination);

            this.sfxGain = this.audioContext.createGain();
            this.sfxGain.gain.value = this.options.sfxVolume;
            this.sfxGain.connect(this.masterGain);

            this.musicGain = this.audioContext.createGain();
            this.musicGain.gain.value = this.options.musicVolume;
            this.musicGain.connect(this.masterGain);

            this.isInitialized = true;
            console.log('🔊 Sound system initialized');

        } catch (error) {
            console.warn('Failed to initialize Web Audio API:', error);
            this.fallbackMode = true;
        }
    }

    /**
     * Load sound effect
     */
    async loadSound(name, url, options = {}) {
        if (!this.isInitialized) return;

        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

            this.sounds.set(name, {
                buffer: audioBuffer,
                volume: options.volume || 1.0,
                loop: options.loop || false,
                category: options.category || 'sfx'
            });

            console.log(`📁 Loaded sound: ${name}`);

        } catch (error) {
            console.warn(`Failed to load sound ${name}:`, error);
        }
    }

    /**
     * Load music track
     */
    async loadMusic(name, url, options = {}) {
        if (!this.isInitialized) return;

        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

            this.musicTracks.set(name, {
                buffer: audioBuffer,
                volume: options.volume || 1.0,
                loop: options.loop ?? true
            });

            console.log(`🎵 Loaded music: ${name}`);

        } catch (error) {
            console.warn(`Failed to load music ${name}:`, error);
        }
    }

    /**
     * Play sound effect
     */
    playSound(name, options = {}) {
        if (!this.isInitialized || !this.sounds.has(name)) {
            // Fallback to HTML5 audio if available
            if (this.fallbackMode && options.fallbackUrl) {
                this.playFallbackSound(options.fallbackUrl, options.volume || 1.0);
            }
            return;
        }

        const sound = this.sounds.get(name);
        const {
            volume = sound.volume,
            loop = sound.loop,
            rate = 1.0,
            pan = 0
        } = options;

        // Limit concurrent sounds
        if (this.activeSounds.size >= this.options.maxConcurrentSounds) {
            this.stopOldestSound();
        }

        try {
            const source = this.audioContext.createBufferSource();
            source.buffer = sound.buffer;
            source.loop = loop;
            source.playbackRate.value = rate;

            // Create gain node for volume control
            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = volume;

            // Create stereo panner for spatial audio
            const pannerNode = this.audioContext.createStereoPanner();
            pannerNode.pan.value = pan;

            // Connect nodes
            source.connect(gainNode);
            gainNode.connect(pannerNode);
            pannerNode.connect(this.sfxGain);

            // Track active sound
            const soundId = Date.now() + Math.random();
            this.activeSounds.add(soundId);

            source.onended = () => {
                this.activeSounds.delete(soundId);
            };

            // Start playback
            source.start(0);

            return soundId;

        } catch (error) {
            console.warn(`Failed to play sound ${name}:`, error);
        }
    }

    /**
     * Play music track
     */
    playMusic(name, options = {}) {
        if (!this.isInitialized || !this.musicTracks.has(name)) return;

        // Stop current music
        this.stopMusic();

        const music = this.musicTracks.get(name);
        const { volume = music.volume, fadeIn = 0 } = options;

        try {
            const source = this.audioContext.createBufferSource();
            source.buffer = music.buffer;
            source.loop = music.loop;

            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = 0; // Start silent for fade in

            source.connect(gainNode);
            gainNode.connect(this.musicGain);

            source.start(0);
            this.currentMusic = { source, gainNode, name };

            // Fade in
            if (fadeIn > 0) {
                const startTime = this.audioContext.currentTime;
                gainNode.gain.setValueAtTime(0, startTime);
                gainNode.gain.linearRampToValueAtTime(volume, startTime + fadeIn);
            } else {
                gainNode.gain.value = volume;
            }

            console.log(`🎵 Playing music: ${name}`);

        } catch (error) {
            console.warn(`Failed to play music ${name}:`, error);
        }
    }

    /**
     * Stop music
     */
    stopMusic(fadeOut = 0) {
        if (!this.currentMusic) return;

        const { source, gainNode, name } = this.currentMusic;

        if (fadeOut > 0) {
            const startTime = this.audioContext.currentTime;
            gainNode.gain.setValueAtTime(gainNode.gain.value, startTime);
            gainNode.gain.linearRampToValueAtTime(0, startTime + fadeOut);

            setTimeout(() => {
                source.stop();
                this.currentMusic = null;
            }, fadeOut * 1000);
        } else {
            source.stop();
            this.currentMusic = null;
        }

        console.log(`🎵 Stopped music: ${name}`);
    }

    /**
     * Pause music
     */
    pauseMusic() {
        if (this.currentMusic) {
            this.currentMusic.source.stop();
            this.currentMusic.paused = true;
        }
    }

    /**
     * Resume music
     */
    resumeMusic() {
        if (this.currentMusic && this.currentMusic.paused) {
            this.playMusic(this.currentMusic.name);
        }
    }

    /**
     * Stop oldest active sound
     */
    stopOldestSound() {
        if (this.activeSounds.size > 0) {
            const oldestId = this.activeSounds.values().next().value;
            this.activeSounds.delete(oldestId);
            console.log('Stopped oldest sound to make room');
        }
    }

    /**
     * Play fallback sound using HTML5 audio
     */
    playFallbackSound(url, volume = 1.0) {
        try {
            const audio = new Audio(url);
            audio.volume = volume * this.options.masterVolume;
            audio.play().catch(e => console.warn('Fallback audio failed:', e));
        } catch (error) {
            console.warn('HTML5 audio fallback failed:', error);
        }
    }

    /**
     * Set master volume
     */
    setMasterVolume(volume) {
        this.options.masterVolume = Math.max(0, Math.min(1, volume));
        if (this.masterGain) {
            this.masterGain.gain.value = this.options.masterVolume;
        }
        this.saveSettings();
    }

    /**
     * Set SFX volume
     */
    setSFXVolume(volume) {
        this.options.sfxVolume = Math.max(0, Math.min(1, volume));
        if (this.sfxGain) {
            this.sfxGain.gain.value = this.options.sfxVolume;
        }
        this.saveSettings();
    }

    /**
     * Set music volume
     */
    setMusicVolume(volume) {
        this.options.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.musicGain) {
            this.musicGain.gain.value = this.options.musicVolume;
        }
        if (this.currentMusic) {
            this.currentMusic.gainNode.gain.value = volume;
        }
        this.saveSettings();
    }

    /**
     * Enable/disable sound
     */
    setEnabled(enabled) {
        this.options.enableSound = enabled;

        if (enabled && !this.isInitialized) {
            this.init();
        } else if (!enabled && this.audioContext) {
            this.stopAll();
        }

        this.saveSettings();
    }

    /**
     * Stop all sounds and music
     */
    stopAll() {
        // Stop active sounds
        this.activeSounds.clear();

        // Stop music
        this.stopMusic();

        console.log('🔇 Stopped all audio');
    }

    /**
     * Generate tone (useful for simple sound effects)
     */
    generateTone(frequency, duration, type = 'sine') {
        if (!this.isInitialized) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.frequency.value = frequency;
            oscillator.type = type;

            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

            oscillator.connect(gainNode);
            gainNode.connect(this.sfxGain);

            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + duration);

        } catch (error) {
            console.warn('Failed to generate tone:', error);
        }
    }

    /**
     * Create procedural sound effect
     */
    createProceduralSound(options = {}) {
        const {
            frequency = 440,
            duration = 0.2,
            type = 'square',
            attack = 0.01,
            decay = 0.1,
            sustain = 0.3,
            release = 0.1
        } = options;

        return () => this.playProceduralSound({
            frequency, duration, type, attack, decay, sustain, release
        });
    }

    /**
     * Play procedural sound
     */
    playProceduralSound(params) {
        if (!this.isInitialized) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.frequency.value = params.frequency;
            oscillator.type = params.type;

            const startTime = this.audioContext.currentTime;
            const attackTime = startTime + params.attack;
            const decayTime = attackTime + params.decay;
            const sustainTime = decayTime + params.sustain;
            const releaseTime = sustainTime + params.release;

            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(0.3, attackTime);
            gainNode.gain.linearRampToValueAtTime(params.sustain, decayTime);
            gainNode.gain.setValueAtTime(params.sustain, sustainTime);
            gainNode.gain.linearRampToValueAtTime(0, releaseTime);

            oscillator.connect(gainNode);
            gainNode.connect(this.sfxGain);

            oscillator.start(startTime);
            oscillator.stop(releaseTime);

        } catch (error) {
            console.warn('Failed to play procedural sound:', error);
        }
    }

    /**
     * Save audio settings
     */
    saveSettings() {
        try {
            const settings = {
                enableSound: this.options.enableSound,
                masterVolume: this.options.masterVolume,
                sfxVolume: this.options.sfxVolume,
                musicVolume: this.options.musicVolume
            };
            localStorage.setItem('soundSettings', JSON.stringify(settings));
        } catch (e) {
            console.warn('Failed to save sound settings:', e);
        }
    }

    /**
     * Load audio settings
     */
    loadSettings() {
        try {
            const saved = localStorage.getItem('soundSettings');
            if (saved) {
                const settings = JSON.parse(saved);
                Object.assign(this.options, settings);
            }
        } catch (e) {
            console.warn('Failed to load sound settings:', e);
        }
    }

    /**
     * Get audio statistics
     */
    getStats() {
        return {
            initialized: this.isInitialized,
            fallbackMode: this.fallbackMode,
            activeSounds: this.activeSounds.size,
            loadedSounds: this.sounds.size,
            loadedMusic: this.musicTracks.size,
            currentMusic: this.currentMusic?.name || null,
            masterVolume: this.options.masterVolume,
            sfxVolume: this.options.sfxVolume,
            musicVolume: this.options.musicVolume
        };
    }

    /**
     * Cleanup resources
     */
    destroy() {
        this.stopAll();

        if (this.audioContext) {
            this.audioContext.close();
        }

        this.sounds.clear();
        this.musicTracks.clear();

        console.log('🗑️ Sound manager destroyed');
    }
}

// Predefined sound effects
const SoundEffects = {
    // Basic UI sounds
    click: (manager) => manager.generateTone(800, 0.1, 'square'),
    hover: (manager) => manager.generateTone(600, 0.05, 'sine'),
    error: (manager) => manager.generateTone(200, 0.3, 'sawtooth'),

    // Game sounds
    move: (manager) => manager.createProceduralSound({
        frequency: 400, duration: 0.15, type: 'square',
        attack: 0.01, decay: 0.05, sustain: 0.3, release: 0.09
    }),
    capture: (manager) => manager.createProceduralSound({
        frequency: 300, duration: 0.25, type: 'sawtooth',
        attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.14
    }),
    win: (manager) => manager.createProceduralSound({
        frequency: 523, duration: 0.5, type: 'triangle',
        attack: 0.05, decay: 0.2, sustain: 0.8, release: 0.25
    }),
    lose: (manager) => manager.createProceduralSound({
        frequency: 196, duration: 0.8, type: 'sawtooth',
        attack: 0.1, decay: 0.3, sustain: 0.1, release: 0.4
    })
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SoundManager, SoundEffects };
}