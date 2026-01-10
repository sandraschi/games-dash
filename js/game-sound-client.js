/**
 * Game Sound Client - Cross-platform audio for games
 * Handles sound generation and playback for iPad and other devices
 */

class GameSoundClient {
    constructor(options = {}) {
        // Auto-detect server URL based on current location
        const currentHost = window.location.hostname;
        const currentPort = window.location.port;
        this.serverUrl = options.serverUrl || `http://${currentHost}:9879`;
        this.gameId = options.gameId || 'default';
        this.audioContext = null;
        this.soundCache = new Map();
        this.isEnabled = options.enabled !== false;
        this.volume = options.volume || 0.5;

        // Initialize Web Audio API
        this.initAudioContext();

        // Sound effect mappings for different games
        this.gameSoundMappings = {
            chess: {
                move: 'chess_move',
                capture: 'chess_capture',
                check: 'gong',
                checkmate: 'level_complete',
                stalemate: 'game_over'
            },
            frogger: {
                hop: 'frog_hop',
                splash: 'teleport',
                squish: 'game_over',
                level_complete: 'level_complete'
            },
            pipe_connect: {
                place: 'pipe_place',
                complete: 'level_complete',
                invalid: 'game_over'
            },
            maze: {
                move: 'button_click',
                collect: 'coin_collect',
                wolf: 'wolf_howl',
                teleport: 'teleport',
                complete: 'level_complete',
                caught: 'game_over'
            },
            general: {
                button_click: 'button_click',
                error: 'game_over',
                success: 'coin_collect',
                power_up: 'power_up'
            }
        };
    }

    async initAudioContext() {
        try {
            // Create AudioContext (with fallback for older browsers)
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                this.audioContext = new AudioContextClass();

                // Resume context on user interaction (required by browsers)
                if (this.audioContext.state === 'suspended') {
                    document.addEventListener('click', async () => {
                        if (this.audioContext.state === 'suspended') {
                            await this.audioContext.resume();
                        }
                    }, { once: true });
                }
            }
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
        }
    }

    async playSound(soundType, options = {}) {
        if (!this.isEnabled) return;

        try {
            const volume = options.volume || this.volume;
            const gameType = options.gameType || 'general';

            // Get the actual sound name from mappings
            const actualSoundType = this.getMappedSound(soundType, gameType);

            // Try to play via Web Audio API first (better for iPad)
            if (this.audioContext && !options.forceServer) {
                await this.playViaWebAudio(actualSoundType, volume);
            } else {
                // Fallback to server audio
                await this.playViaServer(actualSoundType, volume);
            }

        } catch (e) {
            console.warn('Sound playback failed:', e);
            // Try server fallback
            try {
                await this.playViaServer(soundType, options.volume || this.volume);
            } catch (e2) {
                console.error('All sound playback methods failed:', e2);
            }
        }
    }

    getMappedSound(soundType, gameType) {
        const mappings = this.gameSoundMappings[gameType];
        if (mappings && mappings[soundType]) {
            return mappings[soundType];
        }
        // Fallback to general mappings
        return this.gameSoundMappings.general[soundType] || soundType;
    }

    async playViaWebAudio(soundType, volume) {
        // Generate sound using Web Audio API (client-side synthesis)
        const buffer = await this.generateSoundBuffer(soundType);
        if (buffer) {
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();

            source.buffer = buffer;
            gainNode.gain.value = volume;

            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            source.start();
        }
    }

    async generateSoundBuffer(soundType) {
        // Client-side sound synthesis using Web Audio API
        const duration = 0.5; // seconds
        const sampleRate = this.audioContext.sampleRate;
        const numSamples = duration * sampleRate;
        const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
        const channelData = buffer.getChannelData(0);

        // Generate different waveforms based on sound type
        switch (soundType) {
            case 'chess_move':
                this.generateTone(channelData, 800, 0.1, 'square');
                this.generateTone(channelData, 600, 0.15, 'sine', 0.1);
                break;

            case 'chess_capture':
                this.generateTone(channelData, 200, 0.2, 'square');
                this.generateTone(channelData, 150, 0.2, 'sawtooth');
                this.generateNoise(channelData, 0.1, 0.3);
                break;

            case 'frog_hop':
                // Boing effect
                this.generateTone(channelData, 400, 0.15, 'sine');
                this.generateTone(channelData, 300, 0.1, 'sine', 0.15);
                this.generateTone(channelData, 500, 0.08, 'sine', 0.25);
                break;

            case 'dice_roll':
                this.generateNoise(channelData, 0.8, 0.3);
                this.generateTone(channelData, 200, 0.4, 'triangle', 0.0);
                this.generateTone(channelData, 180, 0.4, 'triangle', 0.0);
                this.generateTone(channelData, 1000, 0.05, 'square', 0.8);
                break;

            case 'button_click':
                this.generateTone(channelData, 1200, 0.05, 'square');
                break;

            case 'coin_collect':
                this.generateTone(channelData, 800, 0.2, 'sine');
                this.generateTone(channelData, 1000, 0.15, 'sine', 0.2);
                this.generateTone(channelData, 1200, 0.1, 'sine', 0.35);
                break;

            case 'level_complete':
                const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
                let offset = 0;
                notes.forEach((freq, index) => {
                    const noteDuration = 0.3;
                    this.generateTone(channelData, freq, noteDuration, 'sine', offset);
                    offset += noteDuration;
                });
                break;

            case 'game_over':
                const sadNotes = [440, 392, 349, 294, 262]; // Descending
                let sadOffset = 0;
                sadNotes.forEach((freq, index) => {
                    const noteDuration = 0.4;
                    this.generateTone(channelData, freq, noteDuration, 'sine', sadOffset);
                    sadOffset += noteDuration;
                });
                break;

            case 'wolf_howl':
                this.generateTone(channelData, 150, 1.0, 'sine');
                this.generateTone(channelData, 165, 0.8, 'sine', 0.2);
                this.generateTone(channelData, 80, 0.6, 'sawtooth', 0.4);
                break;

            case 'teleport':
                this.generateTone(channelData, 300, 0.2, 'sine');
                this.generateTone(channelData, 600, 0.15, 'sine', 0.05);
                break;

            case 'power_up':
                this.generateTone(channelData, 1000, 0.1, 'sine');
                this.generateTone(channelData, 1200, 0.1, 'sine', 0.1);
                this.generateTone(channelData, 1400, 0.1, 'sine', 0.2);
                this.generateNoise(channelData, 0.2, 0.0);
                break;

            case 'pipe_place':
                this.generateTone(channelData, 200, 0.1, 'triangle');
                this.generateTone(channelData, 150, 0.15, 'triangle');
                break;

            default:
                // Generic beep
                this.generateTone(channelData, 440, 0.3, 'sine');
        }

        return buffer;
    }

    generateTone(channelData, frequency, duration, waveType = 'sine', offset = 0) {
        const sampleRate = this.audioContext.sampleRate;
        const startSample = Math.floor(offset * sampleRate);
        const endSample = Math.min(startSample + duration * sampleRate, channelData.length);

        for (let i = startSample; i < endSample; i++) {
            const t = (i - startSample) / sampleRate;
            let sample = 0;

            switch (waveType) {
                case 'sine':
                    sample = Math.sin(2 * Math.PI * frequency * t);
                    break;
                case 'square':
                    sample = Math.sign(Math.sin(2 * Math.PI * frequency * t));
                    break;
                case 'triangle':
                    sample = 2 * Math.abs((t * frequency) % 1 - 0.5) - 1;
                    break;
                case 'sawtooth':
                    sample = 2 * ((t * frequency) % 1) - 1;
                    break;
            }

            // Apply fade in/out to prevent clicks
            const fadeSamples = 1000;
            if (i < startSample + fadeSamples) {
                sample *= (i - startSample) / fadeSamples;
            }
            if (i > endSample - fadeSamples) {
                sample *= (endSample - i) / fadeSamples;
            }

            channelData[i] = (channelData[i] || 0) + sample * 0.3; // Mix with existing
        }
    }

    generateNoise(channelData, duration, offset = 0) {
        const sampleRate = this.audioContext.sampleRate;
        const startSample = Math.floor(offset * sampleRate);
        const endSample = Math.min(startSample + duration * sampleRate, channelData.length);

        for (let i = startSample; i < endSample; i++) {
            channelData[i] = (channelData[i] || 0) + (Math.random() * 2 - 1) * 0.1;
        }
    }

    async playViaServer(soundType, volume) {
        // Fallback: request sound from server and play via HTML5 Audio
        try {
            const response = await fetch(`${this.serverUrl}/sound/${soundType}`);
            if (response.ok) {
                const blob = await response.blob();
                const audio = new Audio(URL.createObjectURL(blob));
                audio.volume = volume;
                audio.play().catch(e => console.warn('Server audio playback failed:', e));
            }
        } catch (e) {
            console.warn('Server sound request failed:', e);
        }
    }

    async playSequence(soundSequence, interval = 200) {
        // Play a sequence of sounds with timing
        for (const sound of soundSequence) {
            await this.playSound(sound.type, sound.options || {});
            if (interval > 0) {
                await new Promise(resolve => setTimeout(resolve, interval));
            }
        }
    }

    async preloadSounds(soundTypes) {
        // Preload sounds for better performance
        const promises = soundTypes.map(async (soundType) => {
            try {
                if (!this.soundCache.has(soundType)) {
                    const response = await fetch(`${this.serverUrl}/sound/${soundType}`);
                    if (response.ok) {
                        const blob = await response.blob();
                        this.soundCache.set(soundType, URL.createObjectURL(blob));
                    }
                }
            } catch (e) {
                console.warn(`Failed to preload sound: ${soundType}`, e);
            }
        });

        await Promise.all(promises);
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }

    enable() {
        this.isEnabled = true;
    }

    disable() {
        this.isEnabled = false;
    }

    async testSound() {
        // Play a test sound
        await this.playSound('button_click', { volume: 0.3 });
    }

    // Remote server restart functionality
    async restartServer(serviceName, reason = 'User requested restart') {
        try {
            // Try new server management endpoint first
            const response = await fetch(`${this.serverUrl}/servers/restart`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    server: serviceName,
                    reason: reason,
                    timestamp: new Date().toISOString()
                })
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    console.log(`Server restart initiated for ${serviceName}`);
                    return { success: true, message: result.message };
                }
            }

            // Fallback to old restart endpoint
            console.log('Trying fallback restart method...');
            const fallbackResponse = await fetch(`${this.serverUrl}/restart`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    service: serviceName,
                    reason: reason,
                    timestamp: new Date().toISOString()
                })
            });

            const result = await fallbackResponse.json();

            if (result.status === 'restarting') {
                console.log(`Server restart initiated for ${serviceName} (fallback)`);
                return { success: true, message: result.message };
            } else {
                console.error('Server restart failed:', result);
                return { success: false, message: result.message };
            }

        } catch (e) {
            console.error('Failed to restart server:', e);
            return { success: false, message: `Connection failed: ${e.message}` };
        }
    }

    async startServer(serviceName) {
        try {
            const response = await fetch(`${this.serverUrl}/servers/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ server: serviceName })
            });
            if (response.ok) {
                const result = await response.json();
                return { success: result.success, message: result.message };
            }
            return { success: false, message: 'Server returned error status' };
        } catch (e) {
            console.error('Failed to start server:', e);
            return { success: false, message: `Connection failed: ${e.message}` };
        }
    }

    async stopServer(serviceName) {
        try {
            const response = await fetch(`${this.serverUrl}/servers/stop`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ server: serviceName })
            });
            if (response.ok) {
                const result = await response.json();
                return { success: result.success, message: result.message };
            }
            return { success: false, message: 'Server returned error status' };
        } catch (e) {
            console.error('Failed to stop server:', e);
            return { success: false, message: `Connection failed: ${e.message}` };
        }
    }

    async getServerStatus() {
        try {
            const response = await fetch(`${this.serverUrl}/servers`);
            if (response.ok) {
                const result = await response.json();
                return result.servers || {};
            }
        } catch (e) {
            console.warn('Failed to get server status:', e);
        }
        return {};
    }
}

// Global instance for easy access
window.gameSound = new GameSoundClient();

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Enable sound on first user interaction
    document.addEventListener('click', () => {
        window.gameSound.enable();
    }, { once: true });

    console.log('🎵 Game Sound Client initialized');
});
