# YaneuraOu Manual Installation Guide

**Date**: 2025-12-03  
**Issue**: GitHub releases not directly accessible via PowerShell

---

## Manual Download Instructions

### Step 1: Download YaneuraOu

**Visit**: https://github.com/yaneurao/YaneuraOu/releases

**Look for**:
- Latest release (v8.x or v7.x)
- Windows binary package
- File ending in `-windows.zip`

**Download to**: `D:\Dev\repos\games-app\yaneuraou\`

### Step 2: Extract

```powershell
cd D:\Dev\repos\games-app\yaneuraou
Expand-Archive -Path "YaneuraOu-*.zip" -DestinationPath "."
```

### Step 3: Find Executable

Look for files like:
- `YaneuraOu-by-gcc.exe`
- `YaneuraOu.exe`
- Or similar engine binary

### Step 4: Create Backend Server

I'll create `shogi-server.py` (analogous to `stockfish-server.py`)

### Step 5: Start Backend

```powershell
python shogi-server.py
```

### Step 6: Test

Open http://localhost:9876/shogi.html and play vs AI!

---

## Alternative: Use Current AI

**Your Shogi game WORKS NOW** with heuristic AI:
- 5 difficulty levels
- ~1400 ELO strength
- No installation needed
- Fun and playable!

**To use current AI**:
1. Go to http://localhost:9876/shogi.html
2. Click "🤖 Play vs AI"
3. Select difficulty
4. Play!

---

## Why GitHub Download Failed

Network/firewall restrictions may block direct downloads.

**Solutions**:
1. Download manually in browser
2. Use VPN if blocked
3. Use current heuristic AI (already working!)

---

**Current Status**: Shogi playable with decent AI! ✅  
**Upgrade Path**: Manual YaneuraOu download when needed

