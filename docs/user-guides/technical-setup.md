# 🔧 Technical Setup Guide

For users who want more control over their installation or need to troubleshoot issues. This guide covers manual setup options and advanced configuration.

## 🎯 Installation Options

### Option 1: One-Click Installer (Recommended)
**For everyone who just wants it to work:**

1. Download the latest release from GitHub
2. Double-click `Install_Games.bat`
3. Wait for automatic setup to complete
4. Open `http://localhost:9876` in your browser

**What it does automatically:**
- Installs Docker Desktop
- Configures Windows firewall
- Sets up all AI engines
- Creates crash-resistant services
- Provides remote access URLs

### Option 2: Manual Windows Setup
**For users who want control:**

1. **Install Python 3.8+**
   ```powershell
   # Download from python.org or use Microsoft Store
   python --version  # Should show 3.8 or higher
   ```

2. **Install Node.js 18+**
   ```powershell
   # Download from nodejs.org
   node --version   # Should show 18 or higher
   npm --version    # Should show 8 or higher
   ```

3. **Start the services:**
   ```powershell
   # Option A: Start everything
   .\START_EVERYTHING.ps1

   # Option B: Start components separately
   .\START_ALL_SERVERS.ps1    # AI engines (Windows only)
   # Then run: python -m http.server 9876
   ```

### Option 3: Docker Setup
**For containerized deployment:**

1. **Install Docker Desktop**
   - Download from docker.com
   - Enable WSL 2 if prompted
   - Restart your computer

2. **Run with Docker:**
   ```powershell
   # Start AI engines on Windows first
   .\START_ALL_SERVERS.ps1

   # Then run web server in Docker
   docker compose up -d
   ```

## 🌍 Remote Access Setup

### For iPad and Mobile Gaming

#### Method 1: Same WiFi Network
1. Find your computer's IP address:
   ```powershell
   ipconfig | findstr "IPv4"
   # Look for: IPv4 Address. . . . . . . . . : 192.168.1.100
   ```

2. Allow firewall access:
   ```powershell
   New-NetFirewallRule -DisplayName "Games Remote Access" -Direction Inbound -Protocol TCP -LocalPort 9876,9543-9545,9877 -Action Allow
   ```

3. Access from iPad: `http://YOUR-IP-ADDRESS:9876`

#### Method 2: Worldwide Access (Tailscale VPN)
1. **Install Tailscale** on both your computer and iPad:
   - Download from tailscale.com
   - Create account and sign in

2. Join the same network on both devices

3. Access using Tailscale IP: `http://YOUR-TAILSCALE-IP:9876`

### Remote AI Setup
**Important**: AI engines must run on Windows, but you can access them remotely.

1. **Run the automated setup:**
   ```powershell
   .\setup_remote_ai_access.ps1
   ```

2. **Manual setup if needed:**
   - Ensure AI servers are running on ports 9543-9545
   - Configure nginx proxy in Docker container
   - Test connectivity at `/connectivity-test.html`

## 🔍 Troubleshooting

### Games Won't Load

**Check if servers are running:**
```powershell
# Check if Python servers are running
Get-Process python

# Check Docker containers
docker ps

# Test specific endpoints
curl http://localhost:9876
curl http://localhost:9543/chess
```

**Common fixes:**
- Restart all services: `.\START_EVERYTHING.ps1`
- Check firewall: Disable temporarily for testing
- Try different browser or incognito mode

### AI Opponents Not Working

**For local play:**
- Ensure Stockfish/YaneuraOu/KataGo are in the correct folders
- Check that AI servers are running on correct ports
- Look for error messages in server console windows

**For remote play:**
- Run connectivity test: Visit `connectivity-test.html`
- Check nginx proxy configuration
- Verify firewall allows AI ports (9543-9545)

### Slow Performance

**Optimization tips:**
- Close other programs using CPU/memory
- Use a modern browser (Chrome, Firefox, Edge)
- For mobile: Ensure good WiFi connection
- Check system resources: Task Manager → Performance

### Port Conflicts

**If ports are already in use:**
```powershell
# Find what's using a port
netstat -ano | findstr :9876

# Kill process by PID
taskkill /PID <PID> /F
```

**Change default ports:**
- Edit server configuration files
- Update docker-compose.yml
- Modify firewall rules accordingly

## ⚙️ Advanced Configuration

### Custom Server Configuration

**Environment variables:**
```bash
# Create server-config.env
CHESS_ENGINE_PATH=./stockfish/stockfish.exe
SHOGI_ENGINE_PATH=./yaneuraou/YaneuraOu.exe
GO_ENGINE_PATH=./katago/katago.exe
WEB_PORT=9876
AI_PORTS=9543,9544,9545
```

### Performance Tuning

**For high-traffic setups:**
- Increase Docker memory limits
- Configure server thread pools
- Set up load balancing
- Monitor system resources

### Backup and Restore

**Backup your setup:**
```powershell
# Backup game data
xcopy data backup\data\ /E /I /H /Y

# Backup configurations
copy *.env backup\
copy docker-compose.yml backup\
```

## 🔒 Security Considerations

### Local Network Play
- Games run on local network only
- No internet exposure by default
- Safe for home/family use

### Internet Play (Firebase)
- Uses Firebase authentication
- Secure WebSocket connections
- User data privacy compliant

### Remote Access Security
- Use strong passwords for Tailscale
- Keep systems updated
- Monitor access logs
- Consider VPN segmentation

## 📊 Monitoring and Logs

### Server Logs
- Python servers: Check console windows
- Docker logs: `docker logs <container-name>`
- Browser console: F12 → Console tab

### Performance Monitoring
- Browser dev tools: Network tab
- Task Manager: Resource usage
- Server status page: `/server-status.html`

### Connectivity Testing
- Built-in test page: `/connectivity-test.html`
- Manual testing: `curl` commands
- Browser network inspection

## 🚀 Scaling Up

### For Schools/Classrooms
- Run on teacher computer
- Students access via local network
- No internet required for local play

### For Organizations
- Deploy on dedicated server
- Use Docker for consistency
- Configure load balancing
- Set up centralized logging

### For Development Teams
- Use Git for version control
- Set up CI/CD pipelines
- Configure automated testing
- Enable remote debugging

## 📞 Getting Help

### Quick Diagnosis
1. Run connectivity test: `/connectivity-test.html`
2. Check server status: `/server-status.html`
3. Review browser console for errors
4. Test individual AI engines directly

### Support Resources
- **GitHub Issues**: Report bugs with detailed information
- **Documentation**: Check deployment guides for your setup
- **Community**: Share solutions and get help from other users

### Professional Support
For organizations needing enterprise support:
- Custom deployment configurations
- Performance optimization
- Security hardening
- Training and documentation