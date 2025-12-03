# 🌐 Web Server Setup Guide

**Problem**: Opening HTML files directly (`file://`) blocks JSON loading due to browser CORS security.

**Solution**: Run a local web server!

---

## Quick Start (Recommended)

### Option 1: Python (Easiest)
```powershell
cd D:\Dev\repos\games-app
python -m http.server 9876
```

Then open: **http://localhost:9876**

### Option 2: PowerShell Script
```powershell
cd D:\Dev\repos\games-app
.\start-server.ps1
```

### Option 3: Node.js
```powershell
cd D:\Dev\repos\games-app
npx http-server -p 9876
```

---

## Step-by-Step Instructions

### Using Python (Most Common)

1. **Check if Python installed**:
   ```powershell
   python --version
   ```

2. **If not installed**, install Python:
   ```powershell
   winget install Python.Python.3.12
   ```

3. **Start server**:
   ```powershell
   cd D:\Dev\repos\games-app
   python -m http.server 9876
   ```

4. **Open browser**: http://localhost:9876

5. **Stop server**: Press `Ctrl+C`

---

## Alternative Methods

### VS Code Live Server Extension

1. Install "Live Server" extension in VS Code
2. Right-click `index.html`
3. Select "Open with Live Server"
4. Automatic browser refresh on file changes!

### Browser Extension

**Web Server for Chrome**:
1. Install from Chrome Web Store
2. Choose `D:\Dev\repos\games-app` folder
3. Click "Start" button
4. Opens at `http://127.0.0.1:8887`

---

## Troubleshooting

### Port Already in Use
```powershell
# Use different port (avoid ports <9000 or ending in 00)
python -m http.server 9123
```

Then open: http://localhost:9123

### "Python not recognized"
- Restart PowerShell after installing Python
- Or use full path: `C:\Python312\python.exe -m http.server 9876`

### Firewall Warning
- Click "Allow access" when Windows Firewall prompts
- Only allows localhost connections (safe)

---

## Why This Is Needed

**Browser Security (CORS)**:
- `file://` protocol blocks cross-origin requests
- JSON files count as "different origin"
- Local web server (`http://`) allows loading

**What Gets Fixed**:
- ✅ Famous games load
- ✅ Encyclopedia articles load
- ✅ Lessons load
- ✅ All JSON data accessible

---

## Quick Reference

| Method | Command | Port | Auto-Open |
|--------|---------|------|-----------|
| Python | `python -m http.server 9876` | 9876 | No |
| Node.js | `npx http-server -p 9876 -o` | 9876 | Yes |
| VS Code | Right-click → Live Server | 5500 | Yes |
| Script | `.\start-server.ps1` | 9876 | Yes |

---

## After Server Running

1. **Navigate to**: http://localhost:9876
2. **Click**: `index.html` (or go to http://localhost:9876/index.html)
3. **All games work**: Including chess education!
4. **Chess → Learn Chess**: Famous games, encyclopedia, lessons all load!

---

**Server is running when you see**:
```
Serving HTTP on :: port 9876 (http://[::]:9876/) ...
```

**Keep PowerShell window open** while using the app!

---

## Recommended Setup

**Best for development**:
1. Install VS Code Live Server extension
2. Always use that for testing
3. Automatic refresh on changes
4. No manual server management

**Best for quick use**:
1. Run `.\start-server.ps1`
2. Opens browser automatically
3. Press Ctrl+C when done

---

**Created by**: Sandra Schipal  
**Date**: 2025-12-03  
**Location**: Vienna, Austria

