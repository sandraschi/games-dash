# 🎮 Games Collection - Simple One-Click Installer

## What This Does

**Double-click `Install_Games.bat`** and you're done!

This installer automatically sets up your complete games collection with:

### 🤖 **69 Games** including:
- Chess, Shogi, Go with world-class AI
- Classic arcade games (Pac-Man, Tetris, etc.)
- Card games, board games, puzzles
- Japanese learning games
- Windows Classic games

### ⚙️ **What Gets Installed:**
- **Docker Desktop** (container platform)
- **Firewall rules** (for network access)
- **All game services** (web server, AI engines, multiplayer)
- **Crash protection** (services auto-restart)

### 🌐 **Access Options:**
- **Local PC:** `http://localhost:9876`
- **WiFi Network:** `http://YOUR-PC-IP:9876`
- **Internet:** `http://TAILSCALE-IP:9876` (if Tailscale installed)

## Requirements

- ✅ Windows 10 or 11
- ✅ Internet connection
- ✅ Administrator privileges (requested automatically)
- ✅ 5-10 GB free disk space
- ✅ 4GB RAM minimum

## How to Use

1. **Download** the games collection
2. **Double-click** `Install_Games.bat`
3. **Wait** 5-10 minutes (first time only)
4. **Play!** Browser opens automatically

## Troubleshooting

### Installation Fails
- Make sure you're running as administrator
- Check internet connection
- Restart and try again

### Games Don't Load
- Wait a few minutes for services to start
- Check Docker Desktop is running
- Run: `docker compose logs` to see errors

### Can't Access from Other Devices
- Check firewall: Windows Defender → Firewall → Allow app
- Verify IP address: `ipconfig | findstr IPv4`
- Try different device/browser

## Advanced Options

### Tailscale for Internet Access
Install Tailscale first, then run the installer with:
```powershell
.\Install_Games.bat
```

### Custom Port
Edit `IDIOT_PROOF_INSTALLER.ps1` and change `$CustomPort`

### Manual Installation
See `REMOTE_DEPLOYMENT_GUIDE.md` for step-by-step setup

## Uninstall

```powershell
# Stop services
docker compose down

# Remove containers and images
docker compose down --volumes --remove-orphans
docker system prune -a -f
```

## Support

- **Logs:** `docker compose logs -f`
- **Status:** `docker compose ps`
- **Restart:** `docker compose restart`

---

**🎯 Seriously, just double-click and play!**
