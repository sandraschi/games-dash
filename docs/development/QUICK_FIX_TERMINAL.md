# Quick Fix: Cursor Terminal Not Working

## The Problem
- Commands run but show no output
- Start-Process doesn't open windows
- Docker builds show nothing
- **This is a known Cursor IDE bug (December 2025)**

## The Fix (2 minutes)

### Step 1: Enable Legacy Terminal Tool
1. Press `Ctrl+Shift+J` (or `Ctrl+,` for Settings)
2. Search for: **"Legacy Terminal Tool"**
3. Or navigate: **Agents > Inline Editing & Terminal**
4. ✅ **Check the box**: "Legacy Terminal Tool"
5. Press `Ctrl+Shift+P`
6. Type: **"Terminal: Kill All Terminals"**
7. **Restart Cursor IDE completely** (close and reopen)

### Step 2: Test It Works
Run this in a new terminal:
```powershell
Write-Host "Test output"; Get-Date; python --version
```

You should see:
- "Test output"
- Current date
- Python version

If you see output → **FIXED!** ✅

## Alternative Fix (if above doesn't work)

1. **Close Cursor completely**
2. Delete: `C:\Users\YourUsername\AppData\Roaming\Cursor\workspaceStorage`
3. **Restart Cursor**

⚠️ This resets workspace settings.

## After Fix: Start Your Servers

Now you can run:
```powershell
cd d:\Dev\repos\games-app
.\START_ALL_SERVERS.ps1
```

Or use the batch file:
```cmd
cd d:\Dev\repos\games-app
START_ALL_SERVERS.cmd
```

---

**Why this happens**: Cursor's new terminal integration in Agent Mode has a bug that doesn't capture stdout/stderr. The Legacy Terminal Tool uses the old (working) terminal system.

**Status**: Known bug, being worked on by Cursor team.
