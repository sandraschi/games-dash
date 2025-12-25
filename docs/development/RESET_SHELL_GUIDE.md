# Reset Shell Configuration to Defaults

**Issue**: Shell configuration workarounds from summer 2025 may be interfering with current Cursor terminal.

## Quick Check

Run this to see what's configured:
```powershell
.\CHECK_SHELL_CONFIG.ps1
```

This will show:
- PowerShell profile contents
- CURSOR_AGENT workarounds
- Custom terminal settings
- Environment variables

## Common Workarounds from Summer 2025

Users often added these to PowerShell profiles to fix previous Cursor bugs:

### 1. CURSOR_AGENT Check
```powershell
# This might be in your profile:
if ($env:CURSOR_AGENT -eq "1") {
    function Prompt {
        "PS> "
    }
    # Skip other configs
    return
}
```

**Problem**: This may now interfere with current Cursor terminal behavior.

### 2. Minimal Prompt Override
```powershell
# Simplified prompt for Cursor
if ($env:CURSOR_AGENT) {
    function Prompt { "PS> " }
}
```

### 3. Shell Args Override
Custom terminal shell arguments that may no longer work.

## Reset Options

### Option 1: Check First (Recommended)
```powershell
.\CHECK_SHELL_CONFIG.ps1
```

Review what's found, then decide if reset is needed.

### Option 2: Reset Everything
```powershell
.\RESET_SHELL_CONFIG.ps1
```

This will:
- ✅ Backup your current profile
- ✅ Show you what's in it
- ✅ Ask before deleting
- ✅ Check environment variables
- ✅ Check Cursor settings
- ✅ Optionally delete workspaceStorage

### Option 3: Manual Reset

#### Reset PowerShell Profile
1. Find your profile:
   ```powershell
   $PROFILE
   ```
2. Backup it:
   ```powershell
   Copy-Item $PROFILE "$PROFILE.backup-$(Get-Date -Format 'yyyyMMdd')"
   ```
3. Delete it:
   ```powershell
   Remove-Item $PROFILE
   ```
4. Restart PowerShell

#### Reset Cursor Settings
1. Close Cursor
2. Delete: `%APPDATA%\Cursor\User\workspaceStorage`
3. Open Cursor Settings (`Ctrl+Shift+J`)
4. Search for "terminal"
5. Reset any custom terminal settings to defaults

#### Reset Environment Variables
```powershell
# Check for Cursor vars
[Environment]::GetEnvironmentVariable("CURSOR_AGENT", "User")
[Environment]::GetEnvironmentVariable("CURSOR_TERMINAL", "User")

# Remove if found
[Environment]::SetEnvironmentVariable("CURSOR_AGENT", $null, "User")
[Environment]::SetEnvironmentVariable("CURSOR_TERMINAL", $null, "User")
```

## After Reset

1. **Close Cursor completely**
2. **Open new PowerShell window** (to reload profile)
3. **Restart Cursor**
4. **Test terminal**:
   ```powershell
   Write-Host "Test"; Get-Date; python --version
   ```

If you see output → Terminal works!  
If still nothing → It's the Cursor bug, not your config.

## If Reset Doesn't Help

If resetting doesn't fix the terminal:
- ✅ It's the Cursor bug (not your config)
- ✅ Use external terminals (PowerShell, CMD)
- ✅ Use batch files (bypass Cursor)
- ✅ Enable Legacy Terminal Tool in Cursor settings

## Why This Matters

**Summer 2025 workarounds** were added to fix:
- Terminal hangs
- Command execution issues
- Prompt problems

**Current issue** (December 2025):
- Commands report success but don't execute
- No output captured
- Different bug, different cause

**Old workarounds may now interfere** with Cursor's attempts to fix the new bug.

---

**Bottom line**: Check your config first. If you have CURSOR_AGENT workarounds, try removing them. If that doesn't help, it's the Cursor bug and you need to use workarounds until they fix it.
