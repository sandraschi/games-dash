#!/usr/bin/env python3
"""
Game Sound Service - Generates and serves game sounds
Supports various game sound effects for all games
Eventually integrates with OSC-MCP for VCV Rack audio generation
"""

import asyncio
import logging
import sys
import time
import traceback
from pathlib import Path

import numpy as np
from aiohttp import web
from pydub import AudioSegment
from pydub.generators import Sawtooth, Sine, Square, Triangle, WhiteNoise

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import server manager
try:
    from server_manager import (
        get_restart_history,
        get_server_status,
        restart_game_server,
        server_manager,
        start_game_server,
        stop_game_server,
    )

    SERVER_MANAGER_AVAILABLE = True
except ImportError:
    SERVER_MANAGER_AVAILABLE = False
    logger.warning(
        "Server manager not available - server restart functionality disabled"
    )


class GameSoundService:
    """Service for generating and serving game sound effects"""

    def __init__(self):
        self.sound_library = {}
        self.active_games = {}
        self.sound_cache = {}
        self.sample_rate = 44100
        self.temp_dir = Path("temp_sounds")
        self.temp_dir.mkdir(exist_ok=True)

        # Initialize sound generators
        self.generators = {
            "sine": Sine,
            "square": Square,
            "triangle": Triangle,
            "sawtooth": Sawtooth,
            "noise": WhiteNoise,
        }

    async def generate_sound(self, sound_type: str, **params) -> bytes:
        """Generate audio data for a specific sound type"""
        try:
            if sound_type in self.sound_cache:
                return self.sound_cache[sound_type]

            audio_data = None

            if sound_type == "chess_move":
                audio_data = self._generate_chess_move()
            elif sound_type == "chess_capture":
                audio_data = self._generate_chess_capture()
            elif sound_type == "frog_hop":
                audio_data = self._generate_frog_hop()
            elif sound_type == "dice_roll":
                audio_data = self._generate_dice_roll()
            elif sound_type == "card_shuffle":
                audio_data = self._generate_card_shuffle()
            elif sound_type == "gong":
                audio_data = self._generate_gong()
            elif sound_type == "coin_collect":
                audio_data = self._generate_coin_collect()
            elif sound_type == "level_complete":
                audio_data = self._generate_level_complete()
            elif sound_type == "game_over":
                audio_data = self._generate_game_over()
            elif sound_type == "button_click":
                audio_data = self._generate_button_click()
            elif sound_type == "pipe_place":
                audio_data = self._generate_pipe_place()
            elif sound_type == "wolf_howl":
                audio_data = self._generate_wolf_howl()
            elif sound_type == "teleport":
                audio_data = self._generate_teleport()
            elif sound_type == "power_up":
                audio_data = self._generate_power_up()
            else:
                # Generic tone
                audio_data = self._generate_tone(
                    frequency=params.get("frequency", 440),
                    duration=params.get("duration", 0.5),
                    wave_type=params.get("wave_type", "sine"),
                )

            if audio_data:
                # Convert to WAV bytes
                wav_data = audio_data.export(format="wav").read()
                self.sound_cache[sound_type] = wav_data
                return wav_data

        except Exception as e:
            logger.error(f"Error generating sound {sound_type}: {e}")
            return self._generate_fallback_tone()

    def _generate_chess_move(self) -> AudioSegment:
        """Generate chess piece placement sound"""
        # Quick, crisp tone
        tone1 = Sine(800).to_audio_segment(duration=100, volume=-10)
        tone2 = Sine(600).to_audio_segment(duration=150, volume=-15)
        return tone1.overlay(tone2)

    def _generate_chess_capture(self) -> AudioSegment:
        """Generate chess capture sound"""
        # Harsh, discordant sound
        tone1 = Square(200).to_audio_segment(duration=200, volume=-8)
        tone2 = Sawtooth(150).to_audio_segment(duration=200, volume=-12)
        noise = WhiteNoise().to_audio_segment(duration=100, volume=-20)
        return tone1.overlay(tone2).overlay(noise)

    def _generate_frog_hop(self) -> AudioSegment:
        """Generate frog hop sound - boing!"""
        # Bouncy, spring-like sound
        tone1 = Sine(400).to_audio_segment(duration=150, volume=-12)
        tone2 = Sine(300).to_audio_segment(duration=100, volume=-15)
        tone3 = Sine(500).to_audio_segment(duration=80, volume=-18)
        return tone1 + tone2 + tone3

    def _generate_dice_roll(self) -> AudioSegment:
        """Generate dice rolling sound"""
        # Rattling noise with final click
        rattle = WhiteNoise().to_audio_segment(duration=800, volume=-25)
        # Add some pitched elements for rolling
        roll1 = Triangle(200).to_audio_segment(duration=400, volume=-30)
        roll2 = Triangle(180).to_audio_segment(duration=400, volume=-30)
        # Final click
        click = Square(1000).to_audio_segment(duration=50, volume=-10)
        return rattle.overlay(roll1).overlay(roll2) + click

    def _generate_card_shuffle(self) -> AudioSegment:
        """Generate card shuffling sound"""
        # Multiple quick shuffles
        shuffles = []
        for i in range(5):
            duration = np.random.randint(50, 150)
            shuffle = WhiteNoise().to_audio_segment(duration=duration, volume=-25)
            shuffles.append(shuffle)

        result = shuffles[0]
        for shuffle in shuffles[1:]:
            result = result.overlay(shuffle, position=np.random.randint(0, 100))

        return result

    def _generate_gong(self) -> AudioSegment:
        """Generate gong/clack sound"""
        # Deep, resonant tone with decay
        base_freq = 80
        gong = Sine(base_freq).to_audio_segment(duration=2000, volume=-5)

        # Add harmonics
        harmonic1 = Sine(base_freq * 2).to_audio_segment(duration=1500, volume=-15)
        harmonic2 = Sine(base_freq * 3).to_audio_segment(duration=1000, volume=-20)

        # Add some noise for the "clack"
        clack = WhiteNoise().to_audio_segment(duration=100, volume=-15)

        return gong.overlay(harmonic1).overlay(harmonic2).overlay(clack, position=0)

    def _generate_coin_collect(self) -> AudioSegment:
        """Generate coin collection sound"""
        # Pleasant chime
        chime1 = Sine(800).to_audio_segment(duration=200, volume=-12)
        chime2 = Sine(1000).to_audio_segment(duration=150, volume=-15)
        chime3 = Sine(1200).to_audio_segment(duration=100, volume=-18)
        return chime1 + chime2 + chime3

    def _generate_level_complete(self) -> AudioSegment:
        """Generate level completion fanfare"""
        # Triumphant melody
        notes = [523, 659, 784, 1047]  # C5, E5, G5, C6
        fanfare = AudioSegment.silent(duration=0)

        for freq in notes:
            note = Sine(freq).to_audio_segment(duration=300, volume=-10)
            fanfare += note

        return fanfare

    def _generate_game_over(self) -> AudioSegment:
        """Generate game over sound"""
        # Descending, sad tones
        notes = [440, 392, 349, 294, 262]  # A4, G4, F4, D4, C4
        sad_sound = AudioSegment.silent(duration=0)

        for freq in notes:
            note = Sine(freq).to_audio_segment(duration=400, volume=-12)
            sad_sound += note

        return sad_sound

    def _generate_button_click(self) -> AudioSegment:
        """Generate UI button click"""
        # Quick, clean click
        click = Square(1200).to_audio_segment(duration=50, volume=-15)
        return click

    def _generate_pipe_place(self) -> AudioSegment:
        """Generate pipe placement sound"""
        # Satisfying clunk
        clunk1 = Triangle(200).to_audio_segment(duration=100, volume=-12)
        clunk2 = Triangle(150).to_audio_segment(duration=150, volume=-15)
        return clunk1.overlay(clunk2)

    def _generate_wolf_howl(self) -> AudioSegment:
        """Generate wolf howl sound"""
        # Rising, eerie howl
        base_freq = 150
        howl = Sine(base_freq).to_audio_segment(duration=1000, volume=-8)

        # Add vibrato
        vibrato = Sine(base_freq * 1.1).to_audio_segment(duration=800, volume=-12)
        howl = howl.overlay(vibrato, position=200)

        # Add some growl
        growl = Sawtooth(80).to_audio_segment(duration=600, volume=-20)
        return howl.overlay(growl, position=400)

    def _generate_teleport(self) -> AudioSegment:
        """Generate teleport sound"""
        # Whoosh effect
        whoosh1 = (
            Sine(300)
            .to_audio_segment(duration=200, volume=-15)
            .fade_in(50)
            .fade_out(50)
        )
        whoosh2 = (
            Sine(600)
            .to_audio_segment(duration=150, volume=-18)
            .fade_in(30)
            .fade_out(30)
        )
        return whoosh1.overlay(whoosh2, position=50)

    def _generate_power_up(self) -> AudioSegment:
        """Generate power-up collection sound"""
        # Magical chime
        chime1 = Sine(1000).to_audio_segment(duration=100, volume=-10)
        chime2 = Sine(1200).to_audio_segment(duration=100, volume=-12)
        chime3 = Sine(1400).to_audio_segment(duration=100, volume=-14)
        sparkle = WhiteNoise().to_audio_segment(duration=200, volume=-25)
        return (chime1 + chime2 + chime3).overlay(sparkle)

    def _generate_tone(
        self, frequency: float, duration: float, wave_type: str = "sine"
    ) -> AudioSegment:
        """Generate a generic tone"""
        generator_class = self.generators.get(wave_type, Sine)
        return generator_class(frequency).to_audio_segment(
            duration=int(duration * 1000), volume=-10
        )

    def _generate_fallback_tone(self) -> bytes:
        """Generate a simple fallback tone"""
        tone = Sine(440).to_audio_segment(duration=500, volume=-10)
        return tone.export(format="wav").read()

    async def play_sound_for_game(self, game_id: str, sound_type: str, **params):
        """Play a sound for a specific game"""
        try:
            audio_data = await self.generate_sound(sound_type, **params)

            # Store for the game
            if game_id not in self.active_games:
                self.active_games[game_id] = []

            self.active_games[game_id].append(
                {
                    "sound_type": sound_type,
                    "timestamp": time.time(),
                    "audio_data": audio_data,
                }
            )

            # Keep only recent sounds (last 10 per game)
            if len(self.active_games[game_id]) > 10:
                self.active_games[game_id] = self.active_games[game_id][-10:]

            logger.info(f"Generated sound {sound_type} for game {game_id}")

        except Exception as e:
            logger.error(f"Error playing sound for game {game_id}: {e}")


# Global sound service instance
sound_service = GameSoundService()


# Web server routes
async def play_sound(request):
    """API endpoint to play a sound"""
    try:
        data = await request.json()
        game_id = data.get("game_id", "default")
        sound_type = data.get("sound_type", "button_click")
        params = data.get("params", {})

        await sound_service.play_sound_for_game(game_id, sound_type, **params)

        return web.json_response(
            {"status": "success", "game_id": game_id, "sound_type": sound_type}
        )

    except Exception as e:
        logger.error(f"Error in play_sound endpoint: {e}")
        return web.json_response({"status": "error", "message": str(e)}, status=500)


async def get_sound(request):
    """API endpoint to get sound data"""
    try:
        sound_type = request.match_info.get("sound_type", "button_click")

        audio_data = await sound_service.generate_sound(sound_type)

        return web.Response(
            body=audio_data,
            content_type="audio/wav",
            headers={"Content-Disposition": f'inline; filename="{sound_type}.wav"'},
        )

    except Exception as e:
        logger.error(f"Error in get_sound endpoint: {e}")
        return web.json_response({"status": "error", "message": str(e)}, status=500)


async def list_sounds(request):
    """API endpoint to list available sounds"""
    sounds = [
        "chess_move",
        "chess_capture",
        "frog_hop",
        "dice_roll",
        "card_shuffle",
        "gong",
        "coin_collect",
        "level_complete",
        "game_over",
        "button_click",
        "pipe_place",
        "wolf_howl",
        "teleport",
        "power_up",
    ]

    return web.json_response({"status": "success", "sounds": sounds})


async def health_check(request):
    """Health check endpoint"""
    return web.json_response(
        {"status": "healthy", "service": "Game Sound Service", "version": "1.0.0"}
    )


async def restart_server(request):
    """Allow remote restart of crashed services"""
    try:
        data = await request.json()
        service_name = data.get("service", "")
        reason = data.get("reason", "Remote restart requested")

        logger.warning(
            f"Remote restart requested for service: {service_name}, reason: {reason}"
        )

        # In a real implementation, this would trigger service restart
        # For now, just log and return success

        return web.json_response(
            {
                "status": "restarting",
                "service": service_name,
                "message": f"Service {service_name} restart initiated",
            }
        )

    except Exception as e:
        logger.error(f"Error in restart_server endpoint: {e}")
        return web.json_response({"status": "error", "message": str(e)}, status=500)


def create_app():
    """Create the web application"""
    app = web.Application()

    # Routes
    app.router.add_post("/play", play_sound)
    app.router.add_get("/sound/{sound_type}", get_sound)
    app.router.add_get("/sounds", list_sounds)
    app.router.add_get("/health", health_check)
    app.router.add_post("/restart", restart_server)

    # Server management routes (if available)
    if SERVER_MANAGER_AVAILABLE:
        app.router.add_get("/servers", get_server_status)
        app.router.add_post("/servers/restart", restart_game_server)
        app.router.add_post("/servers/start", start_game_server)
        app.router.add_post("/servers/stop", stop_game_server)
        app.router.add_get("/servers/history", get_restart_history)

    return app


async def main():
    """Main application entry point"""
    try:
        app = create_app()
        runner = web.AppRunner(app)
        await runner.setup()

        port = 11879
        if len(sys.argv) > 1:
            try:
                port = int(sys.argv[1])
            except ValueError:
                pass

        site = web.TCPSite(runner, "0.0.0.0", port)
        await site.start()

        # Start the server watchdog if available
        if SERVER_MANAGER_AVAILABLE:
            server_manager.start_watchdog()
            logger.info("🐕 Server watchdog active")

        logger.info(f"🎵 Game Sound Service started on http://0.0.0.0:{port}")
        logger.info("Available endpoints:")
        logger.info("  POST /play - Play a sound for a game")
        logger.info("  GET /sound/{type} - Get sound file")
        logger.info("  GET /sounds - List available sounds")
        logger.info("  GET /health - Health check")
        logger.info("  POST /restart - Remote server restart")

        # Keep the server running
        while True:
            await asyncio.sleep(1)

    except KeyboardInterrupt:
        logger.info("Shutting down Game Sound Service...")
    except Exception as e:
        logger.error(f"Error starting server: {e}")
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())
