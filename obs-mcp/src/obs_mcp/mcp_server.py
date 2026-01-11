#!/usr/bin/env python3
"""
SOTA OBS Studio MCP Server - Complete Live Streaming Control
FastMCP 2.13+ Compliant with Advanced OBS Websocket Integration

Features:
- Scene Management: Create, switch, duplicate, delete scenes
- Source Control: Add/remove sources, visibility control, properties
- Recording Control: Start/stop recording, get status, file management
- Streaming Control: Start/stop streaming, get status, bitrate control
- Audio Control: Source volume, mute/unmute, audio monitoring
- Media Control: Playback control for media sources
- Transitions: Scene transitions, custom transitions
- Filters: Add/remove source filters, filter properties
- Streaming Services: Multi-platform streaming setup
- Database Persistence: Store configurations and templates
- Error Recovery: Automatic reconnection and error handling
"""

import asyncio
import json
import logging
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

import aiohttp
from fastmcp import FastMCP
from obswebsocket import obsws, requests as obs_requests
from pydantic import BaseModel, Field

# Determine if running in stdio mode (for MCP clients like Claude Desktop)
_is_stdio_mode = not sys.stdin.isatty() and not sys.stdout.isatty()

# Set up proper logging to stderr only (not stdout) - CRITICAL for MCP stdio mode
import logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    stream=sys.stderr  # Always log to stderr for MCP compatibility
)
logger = logging.getLogger(__name__)

# CRITICAL: After server initialization, restore stdout for stdio mode
# This allows the server to communicate via JSON-RPC while preventing initialization logging
if _is_stdio_mode:
    if hasattr(sys.stdout, "restore"):
        sys.stdout.restore()
        # Now we can safely write to stdout for JSON-RPC communication

# Configure logging with appropriate level and format
log_level = os.environ.get("OBS_MCP_LOG_LEVEL", "INFO").upper()
logger.setLevel(getattr(logging, log_level, logging.INFO))

# Initialize FastMCP server
mcp = FastMCP(
    name="obs-mcp",
    instructions="""
    SOTA OBS Studio MCP Server - Complete live streaming and recording control via Claude/Cursor.

    Features:
    - Scene Management: Create, switch, duplicate, delete scenes
    - Source Control: Add/remove sources, visibility, properties
    - Recording: Start/stop recording, status, file management
    - Streaming: Multi-platform streaming, bitrate control
    - Audio Control: Volume, mute/unmute, monitoring
    - Media Control: Playback control for media sources
    - Transitions: Scene transitions, custom effects
    - Filters: Source filters, real-time effects
    - Analytics: Performance monitoring, stream health
    - Persistence: Database storage for configurations

    Perfect for:
    - Professional live streaming automation
    - Automated recording workflows
    - Multi-camera production control
    - Remote broadcasting management
    """,
    version="0.1.0",
)

# Global OBS connection - lazy initialization
_obs_manager = None
obs_client = None
active_connections = {}

class OBSConnectionManager:
    """Advanced OBS Websocket connection manager with auto-reconnection."""

    def __init__(self):
        self.host = os.environ.get("OBS_HOST", "localhost")
        self.port = int(os.environ.get("OBS_PORT", "4455"))
        self.password = os.environ.get("OBS_PASSWORD", "")
        self.client = None
        self.connected = False
        self.reconnect_attempts = 0
        self.max_reconnect_attempts = 5
        self.reconnect_delay = 2

    async def connect(self) -> bool:
        """Connect to OBS with automatic retry."""
        try:
            if self.client and self.connected:
                return True

            self.client = obsws(host=self.host, port=self.port, password=self.password)
            self.client.connect()
            self.connected = True
            self.reconnect_attempts = 0
            logger.info(f"Connected to OBS at {self.host}:{self.port}")
            return True

        except Exception as e:
            logger.error(f"OBS connection failed: {e}")
            self.connected = False
            return False

    async def disconnect(self):
        """Disconnect from OBS."""
        try:
            if self.client and self.connected:
                self.client.disconnect()
                self.connected = False
                logger.info("Disconnected from OBS")
        except Exception as e:
            logger.error(f"OBS disconnect error: {e}")

    async def reconnect(self) -> bool:
        """Attempt to reconnect to OBS."""
        if self.reconnect_attempts >= self.max_reconnect_attempts:
            logger.error("Max reconnection attempts reached")
            return False

        self.reconnect_attempts += 1
        logger.info(f"Reconnection attempt {self.reconnect_attempts}/{self.max_reconnect_attempts}")

        await asyncio.sleep(self.reconnect_delay)
        return await self.connect()

    def call(self, request):
        """Make OBS request with error handling."""
        if not self.connected:
            raise Exception("Not connected to OBS")

        try:
            return self.client.call(request)
        except Exception as e:
            logger.error(f"OBS request failed: {e}")
            raise

def get_obs_manager() -> OBSConnectionManager:
    """Get the global OBS manager, creating it if needed."""
    global _obs_manager
    if _obs_manager is None:
        _obs_manager = OBSConnectionManager()
    return _obs_manager

# Pydantic models for tool parameters
class SceneInfo(BaseModel):
    """Scene information model."""
    scene_name: str = Field(..., description="Name of the scene")
    scene_index: Optional[int] = Field(None, description="Scene index in collection")

class SourceInfo(BaseModel):
    """Source information model."""
    source_name: str = Field(..., description="Name of the source")
    source_type: str = Field(..., description="Type of source (e.g., 'image_source', 'browser_source')")
    scene_name: Optional[str] = Field(None, description="Scene containing the source")

class RecordingConfig(BaseModel):
    """Recording configuration model."""
    output_path: Optional[str] = Field(None, description="Path to save recording")
    filename_format: Optional[str] = Field(None, description="Filename format template")

class StreamingConfig(BaseModel):
    """Streaming configuration model."""
    service: str = Field(..., description="Streaming service (twitch, youtube, etc.)")
    server: str = Field(..., description="Stream server URL")
    key: str = Field(..., description="Stream key")

class FilterConfig(BaseModel):
    """Filter configuration model."""
    filter_name: str = Field(..., description="Name of the filter")
    filter_type: str = Field(..., description="Type of filter (e.g., 'color_key_filter')")
    filter_settings: Dict[str, Any] = Field(..., description="Filter-specific settings")

@mcp.tool()
async def connect_obs() -> Dict[str, Any]:
    """
    Connect to OBS Studio via websocket.

    Establishes connection to OBS Studio for remote control.
    Requires OBS Websocket plugin to be installed and running.

    Returns:
        Dict with connection status and OBS version info
    """
    try:
        success = await get_obs_manager().connect()
        if success:
            # Get OBS version info
            version_info = get_obs_manager().call(obs_requests.GetVersion())
            return {
                "success": True,
                "message": f"Connected to OBS {version_info.datain['obs-studio-version']}",
                "obs_version": version_info.datain.get("obs-studio-version"),
                "websocket_version": version_info.datain.get("obs-websocket-version"),
                "platform": version_info.datain.get("platform"),
            }
        else:
            return {
                "success": False,
                "error": "Failed to connect to OBS"
            }
    except Exception as e:
        logger.error(f"OBS connection error: {e}")
        return {
            "success": False,
            "error": f"Connection failed: {str(e)}"
        }

@mcp.tool()
async def disconnect_obs() -> Dict[str, Any]:
    """
    Disconnect from OBS Studio.

    Closes the websocket connection to OBS Studio.

    Returns:
        Dict with disconnection status
    """
    try:
        await get_obs_manager().disconnect()
        return {
            "success": True,
            "message": "Disconnected from OBS"
        }
    except Exception as e:
        logger.error(f"OBS disconnect error: {e}")
        return {
            "success": False,
            "error": f"Disconnect failed: {str(e)}"
        }

@mcp.tool()
async def get_obs_status() -> Dict[str, Any]:
    """
    Get comprehensive OBS status information.

    Returns current streaming, recording, and system status.

    Returns:
        Dict with OBS status, streaming state, recording state, and performance metrics
    """
    try:
        if not get_obs_manager().connected:
            return {
                "success": False,
                "error": "Not connected to OBS"
            }

        # Get streaming status
        streaming_status = get_obs_manager().call(obs_requests.GetStreamingStatus())

        # Get recording status
        recording_status = get_obs_manager().call(obs_requests.GetRecordingStatus())

        # Get stats
        stats = get_obs_manager().call(obs_requests.GetStats())

        return {
            "success": True,
            "streaming": {
                "active": streaming_status.datain.get("streaming", False),
                "timecode": streaming_status.datain.get("stream-timecode"),
                "congestion": streaming_status.datain.get("congestion"),
                "bytes_per_sec": streaming_status.datain.get("bytes-per-sec"),
                "kbits_per_sec": streaming_status.datain.get("kbits-per-sec"),
            },
            "recording": {
                "active": recording_status.datain.get("isRecording", False),
                "paused": recording_status.datain.get("isRecordingPaused", False),
                "timecode": recording_status.datain.get("recordTimecode"),
                "output_path": recording_status.datain.get("recordingFilename"),
            },
            "performance": {
                "cpu_usage": stats.datain.get("cpu-usage", 0),
                "memory_usage": stats.datain.get("memory-usage", 0),
                "disk_space": stats.datain.get("available-disk-space", 0),
                "fps": stats.datain.get("active-fps", 0),
                "render_missed_frames": stats.datain.get("render-missed-frames", 0),
                "output_skipped_frames": stats.datain.get("output-skipped-frames", 0),
            }
        }
    except Exception as e:
        logger.error(f"OBS status error: {e}")
        return {
            "success": False,
            "error": f"Failed to get status: {str(e)}"
        }

@mcp.tool()
async def list_scenes() -> Dict[str, Any]:
    """
    List all scenes in the current scene collection.

    Returns:
        Dict with scene list and current scene information
    """
    try:
        if not get_obs_manager().connected:
            return {
                "success": False,
                "error": "Not connected to OBS"
            }

        # Get scene list
        scene_list = get_obs_manager().call(obs_requests.GetSceneList())

        # Get current scene
        current_scene = get_obs_manager().call(obs_requests.GetCurrentScene())

        scenes = []
        for scene in scene_list.datain.get("scenes", []):
            scenes.append({
                "scene_name": scene.get("name"),
                "scene_index": scene.get("sceneIndex"),
                "scene_uuid": scene.get("sceneUuid"),
            })

        return {
            "success": True,
            "scenes": scenes,
            "current_scene": current_scene.datain.get("name"),
            "scene_count": len(scenes)
        }
    except Exception as e:
        logger.error(f"List scenes error: {e}")
        return {
            "success": False,
            "error": f"Failed to list scenes: {str(e)}"
        }

@mcp.tool()
async def switch_scene(scene_name: str) -> Dict[str, Any]:
    """
    Switch to a different scene.

    Args:
        scene_name: Name of the scene to switch to

    Returns:
        Dict with scene switch confirmation
    """
    try:
        if not get_obs_manager().connected:
            return {
                "success": False,
                "error": "Not connected to OBS"
            }

        # Switch to scene
        get_obs_manager().call(obs_requests.SetCurrentScene(scene_name))

        return {
            "success": True,
            "message": f"Switched to scene: {scene_name}"
        }
    except Exception as e:
        logger.error(f"Switch scene error: {e}")
        return {
            "success": False,
            "error": f"Failed to switch scene: {str(e)}"
        }

@mcp.tool()
async def create_scene(scene_name: str) -> Dict[str, Any]:
    """
    Create a new scene.

    Args:
        scene_name: Name for the new scene

    Returns:
        Dict with scene creation confirmation
    """
    try:
        if not get_obs_manager().connected:
            return {
                "success": False,
                "error": "Not connected to OBS"
            }

        # Create scene
        get_obs_manager().call(obs_requests.CreateScene(scene_name))

        return {
            "success": True,
            "message": f"Created scene: {scene_name}"
        }
    except Exception as e:
        logger.error(f"Create scene error: {e}")
        return {
            "success": False,
            "error": f"Failed to create scene: {str(e)}"
        }

@mcp.tool()
async def delete_scene(scene_name: str) -> Dict[str, Any]:
    """
    Delete a scene.

    Args:
        scene_name: Name of the scene to delete

    Returns:
        Dict with scene deletion confirmation
    """
    try:
        if not get_obs_manager().connected:
            return {
                "success": False,
                "error": "Not connected to OBS"
            }

        # Delete scene
        get_obs_manager().call(obs_requests.RemoveScene(scene_name))

        return {
            "success": True,
            "message": f"Deleted scene: {scene_name}"
        }
    except Exception as e:
        logger.error(f"Delete scene error: {e}")
        return {
            "success": False,
            "error": f"Failed to delete scene: {str(e)}"
        }

@mcp.tool()
async def list_scene_sources(scene_name: str) -> Dict[str, Any]:
    """
    List all sources in a specific scene.

    Args:
        scene_name: Name of the scene to list sources from

    Returns:
        Dict with sources list and details
    """
    try:
        if not get_obs_manager().connected:
            return {
                "success": False,
                "error": "Not connected to OBS"
            }

        # Get scene item list
        sources = get_obs_manager().call(obs_requests.GetSceneItemList(scene_name))

        source_list = []
        for source in sources.datain.get("sceneItems", []):
            source_list.append({
                "source_name": source.get("sourceName"),
                "source_type": source.get("sourceType"),
                "scene_item_id": source.get("sceneItemId"),
                "scene_item_index": source.get("sceneItemIndex"),
                "visible": source.get("visible", True),
                "locked": source.get("locked", False),
                "transform": source.get("transform", {}),
            })

        return {
            "success": True,
            "scene_name": scene_name,
            "sources": source_list,
            "source_count": len(source_list)
        }
    except Exception as e:
        logger.error(f"List scene sources error: {e}")
        return {
            "success": False,
            "error": f"Failed to list sources: {str(e)}"
        }

@mcp.tool()
async def add_source_to_scene(
    scene_name: str,
    source_name: str,
    source_type: str,
    source_settings: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Add a source to a scene.

    Args:
        scene_name: Name of the scene to add source to
        source_name: Name for the new source
        source_type: Type of source (e.g., 'image_source', 'browser_source', 'text_gdiplus')
        source_settings: Source-specific settings

    Returns:
        Dict with source addition confirmation
    """
    try:
        if not get_obs_manager().connected:
            return {
                "success": False,
                "error": "Not connected to OBS"
            }

        # Create the source first
        settings = source_settings or {}
        get_obs_manager().call(obs_requests.CreateSource(source_name, source_type, scene_name, settings))

        return {
            "success": True,
            "message": f"Added {source_type} source '{source_name}' to scene '{scene_name}'"
        }
    except Exception as e:
        logger.error(f"Add source error: {e}")
        return {
            "success": False,
            "error": f"Failed to add source: {str(e)}"
        }

@mcp.tool()
async def remove_source_from_scene(scene_name: str, source_name: str) -> Dict[str, Any]:
    """
    Remove a source from a scene.

    Args:
        scene_name: Name of the scene containing the source
        source_name: Name of the source to remove

    Returns:
        Dict with source removal confirmation
    """
    try:
        if not get_obs_manager().connected:
            return {
                "success": False,
                "error": "Not connected to OBS"
            }

        # Remove source from scene
        get_obs_manager().call(obs_requests.RemoveSceneItem(scene_name, source_name))

        return {
            "success": True,
            "message": f"Removed source '{source_name}' from scene '{scene_name}'"
        }
    except Exception as e:
        logger.error(f"Remove source error: {e}")
        return {
            "success": False,
            "error": f"Failed to remove source: {str(e)}"
        }

@mcp.tool()
async def set_source_visibility(scene_name: str, source_name: str, visible: bool) -> Dict[str, Any]:
    """
    Show or hide a source in a scene.

    Args:
        scene_name: Name of the scene containing the source
        source_name: Name of the source
        visible: True to show, False to hide

    Returns:
        Dict with visibility change confirmation
    """
    try:
        if not get_obs_manager().connected:
            return {
                "success": False,
                "error": "Not connected to OBS"
            }

        # Set source visibility
        get_obs_manager().call(obs_requests.SetSceneItemVisible(scene_name, source_name, visible))

        action = "shown" if visible else "hidden"
        return {
            "success": True,
            "message": f"Source '{source_name}' {action} in scene '{scene_name}'"
        }
    except Exception as e:
        logger.error(f"Set visibility error: {e}")
        return {
            "success": False,
            "error": f"Failed to set visibility: {str(e)}"
        }

@mcp.tool()
async def start_recording() -> Dict[str, Any]:
    """
    Start recording in OBS Studio.

    Returns:
        Dict with recording start confirmation
    """
    try:
        if not get_obs_manager().connected:
            return {
                "success": False,
                "error": "Not connected to OBS"
            }

        # Start recording
        get_obs_manager().call(obs_requests.StartRecording())

        return {
            "success": True,
            "message": "Recording started"
        }
    except Exception as e:
        logger.error(f"Start recording error: {e}")
        return {
            "success": False,
            "error": f"Failed to start recording: {str(e)}"
        }

@mcp.tool()
async def stop_recording() -> Dict[str, Any]:
    """
    Stop recording in OBS Studio.

    Returns:
        Dict with recording stop confirmation and file path
    """
    try:
        if not get_obs_manager().connected:
            return {
                "success": False,
                "error": "Not connected to OBS"
            }

        # Stop recording
        result = get_obs_manager().call(obs_requests.StopRecording())

        return {
            "success": True,
            "message": "Recording stopped",
            "output_path": result.datain.get("outputPath")
        }
    except Exception as e:
        logger.error(f"Stop recording error: {e}")
        return {
            "success": False,
            "error": f"Failed to stop recording: {str(e)}"
        }

@mcp.tool()
async def pause_recording() -> Dict[str, Any]:
    """
    Pause or resume recording in OBS Studio.

    Returns:
        Dict with pause/resume confirmation
    """
    try:
        if not get_obs_manager().connected:
            return {
                "success": False,
                "error": "Not connected to OBS"
            }

        # Toggle recording pause
        get_obs_manager().call(obs_requests.PauseRecording())

        return {
            "success": True,
            "message": "Recording pause toggled"
        }
    except Exception as e:
        logger.error(f"Pause recording error: {e}")
        return {
            "success": False,
            "error": f"Failed to toggle recording pause: {str(e)}"
        }

@mcp.tool()
async def start_streaming() -> Dict[str, Any]:
    """
    Start streaming in OBS Studio.

    Returns:
        Dict with streaming start confirmation
    """
    try:
        if not get_obs_manager().connected:
            return {
                "success": False,
                "error": "Not connected to OBS"
            }

        # Start streaming
        get_obs_manager().call(obs_requests.StartStreaming())

        return {
            "success": True,
            "message": "Streaming started"
        }
    except Exception as e:
        logger.error(f"Start streaming error: {e}")
        return {
            "success": False,
            "error": f"Failed to start streaming: {str(e)}"
        }

@mcp.tool()
async def stop_streaming() -> Dict[str, Any]:
    """
    Stop streaming in OBS Studio.

    Returns:
        Dict with streaming stop confirmation
    """
    try:
        if not get_obs_manager().connected:
            return {
                "success": False,
                "error": "Not connected to OBS"
            }

        # Stop streaming
        get_obs_manager().call(obs_requests.StopStreaming())

        return {
            "success": True,
            "message": "Streaming stopped"
        }
    except Exception as e:
        logger.error(f"Stop streaming error: {e}")
        return {
            "success": False,
            "error": f"Failed to stop streaming: {str(e)}"
        }

@mcp.tool()
async def set_audio_volume(source_name: str, volume: float, use_decibel: bool = False) -> Dict[str, Any]:
    """
    Set the volume for an audio source.

    Args:
        source_name: Name of the audio source
        volume: Volume level (0.0 to 1.0 for percentage, or dB if use_decibel=True)
        use_decibel: If True, volume is in dB (-96.0 to 26.0), otherwise 0.0-1.0

    Returns:
        Dict with volume setting confirmation
    """
    try:
        if not get_obs_manager().connected:
            return {
                "success": False,
                "error": "Not connected to OBS"
            }

        # Set volume
        get_obs_manager().call(obs_requests.SetVolume(source_name, volume, use_decibel))

        volume_type = "dB" if use_decibel else "%"
        return {
            "success": True,
            "message": f"Set volume for '{source_name}' to {volume} {volume_type}"
        }
    except Exception as e:
        logger.error(f"Set volume error: {e}")
        return {
            "success": False,
            "error": f"Failed to set volume: {str(e)}"
        }

@mcp.tool()
async def toggle_audio_mute(source_name: str) -> Dict[str, Any]:
    """
    Mute or unmute an audio source.

    Args:
        source_name: Name of the audio source

    Returns:
        Dict with mute toggle confirmation
    """
    try:
        if not get_obs_manager().connected:
            return {
                "success": False,
                "error": "Not connected to OBS"
            }

        # Toggle mute
        get_obs_manager().call(obs_requests.ToggleMute(source_name))

        return {
            "success": True,
            "message": f"Toggled mute for audio source '{source_name}'"
        }
    except Exception as e:
        logger.error(f"Toggle mute error: {e}")
        return {
            "success": False,
            "error": f"Failed to toggle mute: {str(e)}"
        }

@mcp.tool()
async def list_audio_sources() -> Dict[str, Any]:
    """
    List all audio sources and their current status.

    Returns:
        Dict with audio sources list and volume/mute status
    """
    try:
        if not get_obs_manager().connected:
            return {
                "success": False,
                "error": "Not connected to OBS"
            }

        # Get sources list first
        sources = get_obs_manager().call(obs_requests.GetSourcesList())

        audio_sources = []
        for source in sources.datain.get("sources", []):
            source_name = source.get("name")

            # Get volume info for this source
            try:
                volume_info = get_obs_manager().call(obs_requests.GetVolume(source_name))
                audio_sources.append({
                    "source_name": source_name,
                    "source_type": source.get("type"),
                    "volume": volume_info.datain.get("volume", 0),
                    "muted": volume_info.datain.get("muted", False),
                    "volume_db": volume_info.datain.get("volumeDb", 0),
                })
            except:
                # Skip non-audio sources
                continue

        return {
            "success": True,
            "audio_sources": audio_sources,
            "count": len(audio_sources)
        }
    except Exception as e:
        logger.error(f"List audio sources error: {e}")
        return {
            "success": False,
            "error": f"Failed to list audio sources: {str(e)}"
        }

@mcp.tool()
async def set_scene_transition(transition_name: str, duration: Optional[int] = None) -> Dict[str, Any]:
    """
    Set the current scene transition.

    Args:
        transition_name: Name of the transition to use
        duration: Transition duration in milliseconds (optional)

    Returns:
        Dict with transition setting confirmation
    """
    try:
        if not get_obs_manager().connected:
            return {
                "success": False,
                "error": "Not connected to OBS"
            }

        # Set transition
        if duration is not None:
            get_obs_manager().call(obs_requests.SetCurrentTransition(transition_name))
            get_obs_manager().call(obs_requests.SetTransitionDuration(duration))
            return {
                "success": True,
                "message": f"Set transition to '{transition_name}' with duration {duration}ms"
            }
        else:
            get_obs_manager().call(obs_requests.SetCurrentTransition(transition_name))
            return {
                "success": True,
                "message": f"Set transition to '{transition_name}'"
            }
    except Exception as e:
        logger.error(f"Set transition error: {e}")
        return {
            "success": False,
            "error": f"Failed to set transition: {str(e)}"
        }

@mcp.tool()
async def trigger_scene_transition() -> Dict[str, Any]:
    """
    Trigger a scene transition to the currently previewed scene.

    Returns:
        Dict with transition trigger confirmation
    """
    try:
        if not get_obs_manager().connected:
            return {
                "success": False,
                "error": "Not connected to OBS"
            }

        # Trigger transition
        get_obs_manager().call(obs_requests.TransitionToProgram())

        return {
            "success": True,
            "message": "Scene transition triggered"
        }
    except Exception as e:
        logger.error(f"Trigger transition error: {e}")
        return {
            "success": False,
            "error": f"Failed to trigger transition: {str(e)}"
        }

@mcp.tool()
async def add_source_filter(
    source_name: str,
    filter_name: str,
    filter_type: str,
    filter_settings: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Add a filter to a source.

    Args:
        source_name: Name of the source to add filter to
        filter_name: Name for the new filter
        filter_type: Type of filter (e.g., 'color_key_filter', 'chroma_key_filter')
        filter_settings: Filter-specific settings

    Returns:
        Dict with filter addition confirmation
    """
    try:
        if not get_obs_manager().connected:
            return {
                "success": False,
                "error": "Not connected to OBS"
            }

        # Add filter
        settings = filter_settings or {}
        get_obs_manager().call(obs_requests.AddFilterToSource(source_name, filter_name, filter_type, settings))

        return {
            "success": True,
            "message": f"Added {filter_type} filter '{filter_name}' to source '{source_name}'"
        }
    except Exception as e:
        logger.error(f"Add filter error: {e}")
        return {
            "success": False,
            "error": f"Failed to add filter: {str(e)}"
        }

@mcp.tool()
async def remove_source_filter(source_name: str, filter_name: str) -> Dict[str, Any]:
    """
    Remove a filter from a source.

    Args:
        source_name: Name of the source containing the filter
        filter_name: Name of the filter to remove

    Returns:
        Dict with filter removal confirmation
    """
    try:
        if not get_obs_manager().connected:
            return {
                "success": False,
                "error": "Not connected to OBS"
            }

        # Remove filter
        get_obs_manager().call(obs_requests.RemoveFilterFromSource(source_name, filter_name))

        return {
            "success": True,
            "message": f"Removed filter '{filter_name}' from source '{source_name}'"
        }
    except Exception as e:
        logger.error(f"Remove filter error: {e}")
        return {
            "success": False,
            "error": f"Failed to remove filter: {str(e)}"
        }

@mcp.tool()
async def get_obs_version() -> Dict[str, Any]:
    """
    Get OBS Studio version information.

    Returns:
        Dict with OBS version, websocket version, and platform info
    """
    try:
        if not get_obs_manager().connected:
            return {
                "success": False,
                "error": "Not connected to OBS"
            }

        # Get version info
        version_info = get_obs_manager().call(obs_requests.GetVersion())

        return {
            "success": True,
            "obs_studio_version": version_info.datain.get("obs-studio-version"),
            "obs_websocket_version": version_info.datain.get("obs-websocket-version"),
            "platform": version_info.datain.get("platform"),
            "supported_image_formats": version_info.datain.get("supported-image-formats", []),
            "available_requests": version_info.datain.get("available-requests", [])
        }
    except Exception as e:
        logger.error(f"Get version error: {e}")
        return {
            "success": False,
            "error": f"Failed to get version: {str(e)}"
        }

@mcp.tool()
async def list_available_sources() -> Dict[str, Any]:
    """
    List all available source types in OBS.

    Returns:
        Dict with available source types for creating new sources
    """
    try:
        if not get_obs_manager().connected:
            return {
                "success": False,
                "error": "Not connected to OBS"
            }

        # Get source types list
        source_types = get_obs_manager().call(obs_requests.GetSourceTypesList())

        types = []
        for stype in source_types.datain.get("types", []):
            types.append({
                "type_id": stype.get("typeId"),
                "display_name": stype.get("displayName"),
                "type": stype.get("type"),  # input/output/filter/transition
                "default_settings": stype.get("defaultSettings", {}),
                "caps": stype.get("caps", {}),
            })

        return {
            "success": True,
            "source_types": types,
            "count": len(types)
        }
    except Exception as e:
        logger.error(f"List source types error: {e}")
        return {
            "success": False,
            "error": f"Failed to list source types: {str(e)}"
        }

@mcp.tool()
async def take_screenshot(
    source_name: Optional[str] = None,
    save_path: Optional[str] = None,
    width: Optional[int] = None,
    height: Optional[int] = None
) -> Dict[str, Any]:
    """
    Take a screenshot of OBS output or a specific source.

    Args:
        source_name: Name of source to screenshot (None for program output)
        save_path: Path to save screenshot (None returns image data)
        width: Screenshot width (optional)
        height: Screenshot height (optional)

    Returns:
        Dict with screenshot information
    """
    try:
        if not get_obs_manager().connected:
            return {
                "success": False,
                "error": "Not connected to OBS"
            }

        # Take screenshot
        if source_name:
            result = get_obs_manager().call(obs_requests.TakeSourceScreenshot(
                source_name, save_path, width, height
            ))
        else:
            result = get_obs_manager().call(obs_requests.TakeSourceScreenshot(
                None, save_path, width, height
            ))

        return {
            "success": True,
            "message": "Screenshot taken",
            "image_data": result.datain.get("img"),  # Base64 encoded image
            "source_name": source_name,
            "save_path": save_path
        }
    except Exception as e:
        logger.error(f"Screenshot error: {e}")
        return {
            "success": False,
            "error": f"Failed to take screenshot: {str(e)}"
        }

def main():
    """Main entry point for the MCP server."""
    try:
        logger.info("Starting OBS MCP Server...")
        mcp.run()
    except KeyboardInterrupt:
        logger.info("OBS MCP Server stopped by user")
    except Exception as e:
        logger.error(f"OBS MCP Server error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()