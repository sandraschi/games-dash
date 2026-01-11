# OBS MCP Server - SOTA OBS Studio Control

**Complete Live Streaming and Recording Automation via Claude/Cursor**

[![Version](https://img.shields.io/badge/version-0.1.0--sota-blue.svg)](.)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Available Tools](#-available-tools)
- [OBS Integration](#-obs-integration)
- [Examples & Use Cases](#-examples--use-cases)
- [Troubleshooting](#-troubleshooting)
- [Architecture](#-architecture)
- [API Reference](#-api-reference)

---

## 🎯 Overview

The OBS MCP Server provides complete programmatic control over OBS Studio through Claude/Cursor. Transform your live streaming and recording workflows with AI-powered automation.

### Key Features

- 🎬 **Scene Management**: Create, switch, duplicate, delete scenes
- 🎯 **Source Control**: Add/remove sources, visibility control, properties
- 📹 **Recording Control**: Start/stop recording, pause/resume, file management
- 📺 **Streaming Control**: Multi-platform streaming, bitrate monitoring
- 🔊 **Audio Control**: Volume control, mute/unmute, audio monitoring
- 🎵 **Media Control**: Playback control for media sources
- ✨ **Transitions**: Scene transitions with custom durations
- 🎨 **Filters**: Real-time source filters and effects
- 📸 **Screenshots**: Capture program output or individual sources
- 📊 **Performance Monitoring**: CPU, memory, FPS, and stream health
- 🔄 **Auto-Reconnection**: Robust connection management with retry logic

### Perfect For

- **Professional Streaming**: Automated scene switching and source management
- **Content Creation**: Multi-camera production control and effects automation
- **Live Events**: Remote broadcasting and stream management
- **Educational Content**: Automated recording workflows and scene transitions
- **Gaming Streams**: Game capture automation and overlay control

---

## 🚀 Quick Start

### 1. Install Dependencies
```powershell
cd obs-mcp
pip install -e .
```

### 2. Install OBS Websocket Plugin
1. Download OBS Websocket from [obsproject.com](https://obsproject.com/forum/resources/obs-websocket-remote-control-obs-studio-from-websockets.466/)
2. Install the plugin in OBS Studio
3. Enable the websocket server in OBS settings

### 3. Configure Claude Desktop
Add to your MCP settings:
```json
{
  "mcpServers": {
    "obs-mcp": {
      "command": "python",
      "args": ["-m", "obs_mcp.mcp_server"],
      "cwd": "D:\\Dev\\repos\\games-app\\obs-mcp"
    }
  }
}
```

### 4. Test Connection
```powershell
python -m obs_mcp.mcp_server
# Should start without errors
```

---

## 📦 Installation

### Requirements
- Python 3.10+
- OBS Studio 28+
- OBS Websocket Plugin 5.0+
- Claude Desktop or Cursor IDE

### Package Installation
```powershell
# Clone and install
cd obs-mcp
pip install -e .

# Verify installation
python -c "import obs_mcp.mcp_server; print('✅ Installation successful')"
```

### OBS Studio Setup

#### Install OBS Websocket Plugin
1. **Download**: Get the latest release from [GitHub](https://github.com/obsproject/obs-websocket/releases)
2. **Install**: Extract to `C:\Program Files\obs-studio\obs-plugins\64bit\`
3. **Restart**: Restart OBS Studio

#### Configure Websocket Server
1. Open OBS Studio → Tools → WebSocket Server Settings
2. **Enable**: Check "Enable WebSocket server"
3. **Port**: Set to `4455` (default)
4. **Password**: Set a secure password (optional but recommended)
5. **Apply**: Click OK

#### Environment Variables (Optional)
```powershell
# OBS connection settings
$env:OBS_HOST = "localhost"
$env:OBS_PORT = "4455"
$env:OBS_PASSWORD = "your_password_here"

# Logging
$env:OBS_MCP_LOG_LEVEL = "DEBUG"
```

---

## ⚙️ Configuration

### MCP Client Configuration

#### Claude Desktop (Windows)
Location: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "obs-mcp": {
      "command": "python",
      "args": ["-m", "obs_mcp.mcp_server"],
      "cwd": "D:\\Dev\\repos\\games-app\\obs-mcp"
    }
  }
}
```

#### Cursor IDE
Add to Cursor's MCP settings panel with the same configuration.

### OBS Websocket Configuration

#### Server Settings
- **Host**: `localhost` (default)
- **Port**: `4455` (default)
- **Password**: Set in OBS Tools → WebSocket Server Settings

#### Authentication
For security, always set a password in OBS websocket settings:
```
Tools → WebSocket Server Settings → Server Password
```

---

## 🛠️ Available Tools

### 🔗 Connection Management

#### `connect_obs()`
Connect to OBS Studio websocket
**Returns**: Connection status and OBS version info

#### `disconnect_obs()`
Disconnect from OBS Studio
**Returns**: Disconnection confirmation

#### `get_obs_status()`
Get comprehensive OBS status (streaming, recording, performance)
**Returns**: Full system status with metrics

### 🎬 Scene Management

#### `list_scenes()`
List all scenes in current collection
**Returns**: Scene list with current scene highlighted

#### `switch_scene(scene_name)`
Switch to specified scene
**Parameters**: `scene_name` - Target scene name

#### `create_scene(scene_name)`
Create new scene
**Parameters**: `scene_name` - New scene name

#### `delete_scene(scene_name)`
Delete existing scene
**Parameters**: `scene_name` - Scene to delete

### 🎯 Source Control

#### `list_scene_sources(scene_name)`
List all sources in specified scene
**Parameters**: `scene_name` - Scene name

#### `add_source_to_scene(scene_name, source_name, source_type, source_settings)`
Add source to scene
**Parameters**:
- `scene_name` - Target scene
- `source_name` - New source name
- `source_type` - Source type (image_source, browser_source, etc.)
- `source_settings` - Source configuration

#### `remove_source_from_scene(scene_name, source_name)`
Remove source from scene
**Parameters**: `scene_name`, `source_name`

#### `set_source_visibility(scene_name, source_name, visible)`
Show/hide source in scene
**Parameters**: `scene_name`, `source_name`, `visible` (boolean)

### 📹 Recording Control

#### `start_recording()`
Start recording
**Returns**: Recording start confirmation

#### `stop_recording()`
Stop recording
**Returns**: Recording stop confirmation with output path

#### `pause_recording()`
Toggle recording pause/resume
**Returns**: Pause state confirmation

### 📺 Streaming Control

#### `start_streaming()`
Start streaming to configured service
**Returns**: Streaming start confirmation

#### `stop_streaming()`
Stop streaming
**Returns**: Streaming stop confirmation

### 🔊 Audio Control

#### `set_audio_volume(source_name, volume, use_decibel)`
Set volume for audio source
**Parameters**:
- `source_name` - Audio source name
- `volume` - Volume level (0.0-1.0 or dB)
- `use_decibel` - Use dB scale if true

#### `toggle_audio_mute(source_name)`
Mute/unmute audio source
**Parameters**: `source_name` - Audio source name

#### `list_audio_sources()`
List all audio sources with status
**Returns**: Audio sources with volume and mute status

### ✨ Transitions & Effects

#### `set_scene_transition(transition_name, duration)`
Set current scene transition
**Parameters**: `transition_name`, `duration` (optional ms)

#### `trigger_scene_transition()`
Trigger transition to preview scene
**Returns**: Transition trigger confirmation

### 🎨 Filters & Effects

#### `add_source_filter(source_name, filter_name, filter_type, filter_settings)`
Add filter to source
**Parameters**:
- `source_name` - Target source
- `filter_name` - New filter name
- `filter_type` - Filter type (color_key, chroma_key, etc.)
- `filter_settings` - Filter configuration

#### `remove_source_filter(source_name, filter_name)`
Remove filter from source
**Parameters**: `source_name`, `filter_name`

### 📊 System Information

#### `get_obs_version()`
Get OBS version information
**Returns**: OBS Studio, websocket, and platform versions

#### `list_available_sources()`
List all available source types
**Returns**: Available source types for creating new sources

#### `take_screenshot(source_name, save_path, width, height)`
Take screenshot of program or source
**Parameters**:
- `source_name` - Source to screenshot (None for program)
- `save_path` - Save path (optional)
- `width`, `height` - Screenshot dimensions

---

## 🔌 OBS Integration

### OBS Websocket Plugin

The server communicates with OBS Studio via the official websocket plugin:

- **Protocol**: WebSocket (TCP)
- **Default Port**: 4455
- **Authentication**: Password-based (recommended)
- **Auto-Reconnection**: Built-in retry logic

### Connection States

- **Disconnected**: Initial state, no communication
- **Connecting**: Attempting to establish connection
- **Connected**: Active websocket connection
- **Reconnecting**: Automatic reconnection attempts
- **Error**: Connection failed, manual intervention needed

### Error Handling

- **Connection Loss**: Automatic reconnection with exponential backoff
- **Request Failures**: Detailed error messages with recovery suggestions
- **OBS Errors**: Translated OBS error codes to human-readable messages
- **Timeout Handling**: Configurable timeouts with graceful degradation

---

## 💡 Examples & Use Cases

### Basic Scene Management
```python
# Create and manage scenes
await create_scene("Starting Soon")
await create_scene("Live Stream")
await create_scene("Ending")

# Switch scenes
await switch_scene("Live Stream")

# List all scenes
scenes = await list_scenes()
print(f"Current scene: {scenes['current_scene']}")
```

### Live Streaming Workflow
```python
# Start streaming session
await start_streaming()

# Scene transitions during stream
await switch_scene("Interview")
await set_scene_transition("Fade", 1000)
await trigger_scene_transition()

# Audio management
await set_audio_volume("Microphone", 0.8)
await toggle_audio_mute("Music")  # Mute background music

# End stream
await stop_streaming()
```

### Recording Automation
```python
# Start recording
await start_recording()

# Scene management during recording
await switch_scene("Tutorial")
await set_source_visibility("Tutorial", "Overlay", True)

# Pause if needed
await pause_recording()

# Stop and get output path
result = await stop_recording()
print(f"Recording saved to: {result['output_path']}")
```

### Multi-Camera Production
```python
# Set up camera sources
await add_source_to_scene("Multi-Cam", "Camera 1", "dshow_input")
await add_source_to_scene("Multi-Cam", "Camera 2", "dshow_input")

# Add picture-in-picture effect
await add_source_filter("Camera 2", "PIP", "crop_filter", {
    "left": 0.7, "top": 0.7, "right": 1.0, "bottom": 1.0
})

# Switch between cameras
await set_source_visibility("Multi-Cam", "Camera 1", True)
await set_source_visibility("Multi-Cam", "Camera 2", False)
```

### Gaming Stream Automation
```python
# Game capture setup
await add_source_to_scene("Gaming", "Game Capture", "game_capture", {
    "capture_mode": "window",
    "window": "Game Window"
})

# Add overlays
await add_source_to_scene("Gaming", "Chat", "browser_source", {
    "url": "https://twitch.tv/embed/chat",
    "width": 300, "height": 600
})

# Stream management
await start_streaming()
await switch_scene("Gaming")

# Quick scene switches
await switch_scene("BRB")  # Be right back
await switch_scene("Gaming")
```

### Screenshot and Monitoring
```python
# Take program screenshot
screenshot = await take_screenshot()
print(f"Program screenshot: {len(screenshot['image_data'])} bytes")

# Monitor performance
status = await get_obs_status()
print(f"CPU: {status['performance']['cpu_usage']}%")
print(f"FPS: {status['performance']['fps']}")

# Audio monitoring
audio = await list_audio_sources()
for source in audio['audio_sources']:
    if source['muted']:
        print(f"⚠️  {source['source_name']} is muted")
```

---

## 🔧 Troubleshooting

### Connection Issues

#### "Failed to connect to OBS"
**Solutions**:
1. Verify OBS Websocket plugin is installed
2. Check OBS is running
3. Confirm websocket server is enabled in OBS settings
4. Check port 4455 is not blocked by firewall

#### "Authentication failed"
**Solutions**:
1. Verify password in environment variables
2. Check password in OBS websocket settings matches
3. Restart OBS after changing password

### OBS Errors

#### "Scene not found"
**Solutions**:
1. Use `list_scenes()` to verify scene names
2. Check for typos in scene names
3. Ensure scene exists in current collection

#### "Source not found"
**Solutions**:
1. Use `list_scene_sources(scene_name)` to verify source names
2. Check source was added to correct scene
3. Verify source creation succeeded

### Performance Issues

#### High CPU Usage
**Solutions**:
1. Reduce analysis depth in performance-critical operations
2. Use `get_obs_status()` to monitor OBS performance
3. Close unnecessary OBS sources

#### Connection Timeouts
**Solutions**:
1. Check network connectivity
2. Verify OBS is responsive
3. Increase timeout values if needed

### Common Error Messages

#### "Not connected to OBS"
- Call `connect_obs()` first
- Check OBS websocket server is running

#### "Request failed"
- OBS operation failed
- Check OBS logs for details
- Verify operation parameters are valid

#### "Permission denied"
- OBS websocket authentication failed
- Verify password is correct
- Check OBS websocket settings

---

## 🏗️ Architecture

### Components

#### 1. MCP Server (`mcp_server.py`)
- FastMCP 2.13+ implementation
- WebSocket connection management
- Tool registration and routing

#### 2. OBS Connection Manager
- Auto-reconnection with exponential backoff
- Connection state tracking
- Error recovery and retry logic

#### 3. Tool Implementations
- OBS websocket API wrappers
- Parameter validation and error handling
- Response formatting and logging

### Data Flow

```
User Request → MCP Server → OBS Connection Manager → OBS Websocket → OBS Studio
                      ↓
                Response Processing ← Error Handling ← OBS Response
```

### Connection Management

- **Automatic Reconnection**: Handles network interruptions
- **Connection Pooling**: Efficient resource management
- **Health Monitoring**: Continuous connection validation
- **Graceful Degradation**: Fallback behavior when OBS unavailable

### Error Handling

- **Connection Errors**: Auto-retry with backoff
- **OBS Errors**: Translated to user-friendly messages
- **Parameter Validation**: Input validation before OBS calls
- **Logging**: Comprehensive error logging and debugging

---

## 📚 API Reference

### Tool Signatures

All tools return consistent response format:

```python
{
    "success": bool,           # Operation success
    "message": str,           # Human-readable message
    "error": str,             # Error message (if success=False)
    # ... tool-specific data fields
}
```

#### Connection Management
```python
async def connect_obs() -> Dict[str, Any]
async def disconnect_obs() -> Dict[str, Any]
async def get_obs_status() -> Dict[str, Any]
```

#### Scene Management
```python
async def list_scenes() -> Dict[str, Any]
async def switch_scene(scene_name: str) -> Dict[str, Any]
async def create_scene(scene_name: str) -> Dict[str, Any]
async def delete_scene(scene_name: str) -> Dict[str, Any]
```

#### Source Control
```python
async def list_scene_sources(scene_name: str) -> Dict[str, Any]
async def add_source_to_scene(scene_name: str, source_name: str, source_type: str, source_settings: Optional[Dict[str, Any]] = None) -> Dict[str, Any]
async def remove_source_from_scene(scene_name: str, source_name: str) -> Dict[str, Any]
async def set_source_visibility(scene_name: str, source_name: str, visible: bool) -> Dict[str, Any]
```

#### Recording Control
```python
async def start_recording() -> Dict[str, Any]
async def stop_recording() -> Dict[str, Any]
async def pause_recording() -> Dict[str, Any]
```

#### Streaming Control
```python
async def start_streaming() -> Dict[str, Any]
async def stop_streaming() -> Dict[str, Any]
```

#### Audio Control
```python
async def set_audio_volume(source_name: str, volume: float, use_decibel: bool = False) -> Dict[str, Any]
async def toggle_audio_mute(source_name: str) -> Dict[str, Any]
async def list_audio_sources() -> Dict[str, Any]
```

#### Transitions & Effects
```python
async def set_scene_transition(transition_name: str, duration: Optional[int] = None) -> Dict[str, Any]
async def trigger_scene_transition() -> Dict[str, Any]
```

#### Filters & Effects
```python
async def add_source_filter(source_name: str, filter_name: str, filter_type: str, filter_settings: Optional[Dict[str, Any]] = None) -> Dict[str, Any]
async def remove_source_filter(source_name: str, filter_name: str) -> Dict[str, Any]
```

#### System Information
```python
async def get_obs_version() -> Dict[str, Any]
async def list_available_sources() -> Dict[str, Any]
async def take_screenshot(source_name: Optional[str] = None, save_path: Optional[str] = None, width: Optional[int] = None, height: Optional[int] = None) -> Dict[str, Any]
```

---

## 📄 License

Same as games-app project.

---

## 🤝 Contributing

1. Test changes with OBS Studio running
2. Follow existing code patterns
3. Add comprehensive error handling
4. Update documentation for new tools

---

## 📞 Support

For issues:
1. Check OBS websocket connection: `connect_obs()`
2. Verify OBS status: `get_obs_status()`
3. Check OBS websocket plugin is installed and enabled
4. Review OBS Studio logs for additional error details

---

*Transform OBS Studio into an AI-powered production control center.*