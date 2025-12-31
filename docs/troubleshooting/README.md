# 🔧 Troubleshooting Guide

**Having issues?** This comprehensive guide covers the most common problems and their solutions. Start with the [Quick Diagnosis](#-quick-diagnosis) section for fast problem identification.

## 🚀 Quick Diagnosis

### Step 1: Run the Built-in Tests
1. Open `http://localhost:9876/connectivity-test.html`
2. Click "Test All AI Servers"
3. Check results:
   - ✅ **All green?** Games should work perfectly
   - ❌ **Any red?** See specific server fixes below

### Step 2: Check Basic Connectivity
1. Open `http://localhost:9876` in your browser
2. Try a simple game (Tic-Tac-Toe, Snake)
3. If basic games work → Problem is likely AI-related
4. If no games work → Problem is likely server/network related

### Step 3: Use the Issue Checklist
Answer these questions to identify your issue:
- **Did you run the installer?** `Install_Games.bat`
- **Are you on Windows?** (AI engines require Windows)
- **Is your firewall blocking connections?**
- **Are you trying to access from another device?** (IP address issues)
- **Did you restart after installation?**

## 🛠️ Common Issues & Solutions

### "Games Won't Load" / "Page Not Found"

#### Symptoms
- Browser shows "This site can't be reached"
- Blank page or connection refused
- `http://localhost:9876` doesn't work

#### Solutions
1. **Check if servers are running:**
   ```powershell
   # Look for Python processes
   Get-Process python

   # Should see multiple python.exe processes
   ```

2. **Restart the web server:**
   ```powershell
   # Kill existing servers
   taskkill /f /im python.exe

   # Start fresh
   .\START_EVERYTHING.ps1
   ```

3. **Check port conflicts:**
   ```powershell
   # See what's using port 9876
   netstat -ano | findstr :9876

   # Kill conflicting process (be careful!)
   taskkill /pid <PID> /f
   ```

4. **Try alternative access:**
   - `http://127.0.0.1:9876`
   - `http://localhost:8000` (if using different port)

### "AI Opponents Don't Work"

#### Symptoms
- Games load but AI doesn't respond
- "AI Thinking..." message never completes
- Human vs human works, but vs computer doesn't

#### Solutions
1. **Check AI server status:**
   - Visit `connectivity-test.html`
   - Look for Stockfish/Shogi/Go server status

2. **Restart AI servers:**
   ```powershell
   # Stop all servers
   taskkill /f /im python.exe

   # Start only AI servers
   .\START_ALL_SERVERS.ps1

   # Wait 30 seconds, then test
   ```

3. **Check AI engine files:**
   ```powershell
   # Verify AI engines exist
   dir stockfish\stockfish.exe
   dir yaneuraou\YaneuraOu.exe
   dir katago\katago.exe
   ```

4. **Test individual AI servers:**
   ```powershell
   # Test Stockfish directly
   curl http://localhost:9543/chess

   # Test Go server
   curl http://localhost:9545/go
   ```

### "Cannot Access from iPad/Phone"

#### Symptoms
- Works on computer but not on mobile
- "Connection refused" on mobile devices
- Mobile browser shows error

#### Solutions
1. **Find your computer's IP address:**
   ```powershell
   ipconfig | findstr "IPv4"
   # Look for: 192.168.x.x or 10.0.x.x
   ```

2. **Allow firewall access:**
   ```powershell
   # Run as Administrator
   New-NetFirewallRule -DisplayName "Games Remote Access" -Direction Inbound -Protocol TCP -LocalPort 9876,9543-9545,9877 -Action Allow
   ```

3. **Test from mobile:**
   - Use the IP from step 1: `http://192.168.1.100:9876`
   - Try from mobile browser (Safari/Chrome)

4. **Check WiFi network:**
   - Computer and mobile must be on same WiFi
   - Some corporate/school WiFi block gaming ports
   - Try personal hotspot if school WiFi doesn't work

### "Games Are Slow/Choppy"

#### Symptoms
- Games lag or freeze
- AI moves take very long
- Browser becomes unresponsive

#### Solutions
1. **Close background programs:**
   - Check Task Manager for high CPU/memory usage
   - Close unnecessary applications

2. **Use a better browser:**
   - Chrome or Firefox work best
   - Clear browser cache
   - Try incognito/private mode

3. **Check system resources:**
   ```powershell
   # Check CPU and memory usage
   # Games need ~2GB RAM free
   # AI analysis needs CPU cores available
   ```

4. **Lower AI difficulty:**
   - Use faster time controls
   - Reduce AI thinking depth
   - Try simpler games first

### "Installer Fails"

#### Symptoms
- `Install_Games.bat` shows errors
- Docker installation fails
- Permission denied messages

#### Solutions
1. **Run as Administrator:**
   - Right-click `Install_Games.bat`
   - Select "Run as administrator"

2. **Check Windows version:**
   - Requires Windows 10/11
   - Windows Home/Pro/Enterprise all work

3. **Manual Docker installation:**
   ```powershell
   # Download Docker Desktop manually
   # https://www.docker.com/products/docker-desktop
   # Install and restart computer
   ```

4. **Clean installation:**
   ```powershell
   # Remove old installations
   # Delete games-app folder
   # Fresh download and install
   ```

### "Multiplayer Doesn't Work"

#### Symptoms
- Cannot find other players
- Connection fails in multiplayer games
- "No players found" messages

#### Solutions
1. **Check multiplayer server:**
   ```powershell
   # Test WebSocket server
   curl http://localhost:9877/health
   ```

2. **Restart multiplayer server:**
   ```powershell
   taskkill /f /im python.exe
   .\START_ALL_SERVERS.ps1
   ```

3. **Check browser console:**
   - F12 → Console tab
   - Look for WebSocket connection errors

4. **Firewall settings:**
   - Ensure port 9877 is open
   - Try disabling firewall temporarily

### "Cannot Access from Another Computer"

#### Symptoms
- Works on host computer
- Doesn't work from other computers on network
- "Connection timed out"

#### Solutions
1. **Advanced firewall configuration:**
   ```powershell
   # Allow access from network
   New-NetFirewallRule -DisplayName "Games Network Access" -Direction Inbound -Protocol TCP -LocalPort 9876,9543-9545,9877 -Action Allow -RemoteAddress LocalSubnet
   ```

2. **Find correct IP address:**
   ```powershell
   ipconfig
   # Use the IPv4 address, not 127.0.0.1
   ```

3. **Check network configuration:**
   - Both computers on same subnet
   - No VPN interfering
   - Antivirus not blocking

4. **Test connectivity:**
   ```powershell
   # From another computer
   ping YOUR_COMPUTER_IP
   # Should get replies
   ```

## 🔍 Advanced Diagnostics

### Server Health Checks

#### Check All Services
```powershell
# Test all endpoints
curl http://localhost:9876          # Web server
curl http://localhost:9543/chess    # Chess AI
curl http://localhost:9544/shogi    # Shogi AI
curl http://localhost:9545/go       # Go AI
curl http://localhost:9877/health   # Multiplayer
```

#### System Resource Check
```powershell
# Check available resources
systeminfo | findstr "Memory"
wmic cpu get loadpercentage

# Check disk space
dir C:\
```

### Log Analysis

#### Python Server Logs
- Check console windows for error messages
- Look for "Traceback" or "Error" messages
- Note any missing dependencies

#### Browser Console Logs
- F12 → Console tab
- Look for JavaScript errors
- Check network tab for failed requests

### Network Diagnostics

#### Test Local Connectivity
```powershell
# Test all local ports
foreach ($port in 9876,9543,9544,9545,9877) {
    $tcp = New-Object System.Net.Sockets.TcpClient
    try {
        $tcp.Connect("127.0.0.1", $port)
        Write-Host "Port $port: OPEN"
    } catch {
        Write-Host "Port $port: CLOSED"
    }
    $tcp.Close()
}
```

#### Test Remote Connectivity
```powershell
# From another device on network
telnet YOUR_COMPUTER_IP 9876
# Should connect (type Ctrl+] then quit to exit)
```

## 🛠️ Advanced Fixes

### Complete Reset
When nothing else works:

1. **Stop all processes:**
   ```powershell
   taskkill /f /im python.exe
   taskkill /f /im docker.exe
   ```

2. **Clean up:**
   ```powershell
   # Remove Docker containers
   docker rm -f $(docker ps -aq)

   # Clear any stuck ports
   netstat -ano | findstr :9876
   ```

3. **Fresh start:**
   ```powershell
   .\START_EVERYTHING.ps1
   ```

### Environment Variables
For custom configurations:

```powershell
# Set environment variables
$env:CHESS_ENGINE_PATH = "C:\path\to\stockfish.exe"
$env:WEB_PORT = "9876"
$env:AI_PORTS = "9543,9544,9545"

# Start with custom config
python stockfish-server.py
```

### Manual Service Start
For debugging individual components:

```powershell
# Start web server only
python -m http.server 9876

# Start AI servers individually
start python stockfish-server.py
start python shogi-server.py
start python go-server.py
start python multiplayer-server.py
```

## 🌍 Remote Access Issues

### Tailscale VPN Problems
- Ensure both devices are on same tailnet
- Check Tailscale IP address
- Verify firewall allows Tailscale traffic

### Corporate Network Issues
- Some corporate firewalls block game ports
- Try different ports in configuration
- Use HTTPS if available

### Mobile-Specific Issues
- iOS Safari may block some features
- Try Chrome on mobile
- Check for iOS version compatibility

## 📞 Getting Expert Help

### Before Asking for Help
1. **Run the connectivity test:** `/connectivity-test.html`
2. **Check the troubleshooting checklist above**
3. **Note your exact error messages**
4. **Include your system information:**
   - Windows version
   - Browser and version
   - Whether you're accessing locally or remotely

### Where to Get Help
- **GitHub Issues:** [Report bugs](https://github.com/your-org/games-app/issues)
- **GitHub Discussions:** [Ask questions](https://github.com/your-org/games-app/discussions)
- **Documentation:** Check deployment guides for your setup
- **Community:** Join gaming education communities

### Information to Provide
When asking for help, include:
- **Error messages** (exact text)
- **Steps to reproduce** the problem
- **Your setup** (local/remote, OS, browser)
- **Connectivity test results**
- **What you've tried** already

---

**Most issues can be resolved with the steps above!** Start with the quick diagnosis, then work through the relevant section. If you're still stuck, the community is here to help.