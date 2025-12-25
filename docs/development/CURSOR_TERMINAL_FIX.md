# Cursor IDE Terminal Bug - Fix Guide

**Issue Date**: December 2025  
**Status**: Known bug affecting Agent Mode terminals

## Problem

Cursor IDE terminals in Agent Mode are broken:
- ✅ Commands execute (exit code 0)
- ❌ No stdout/stderr output visible
- ❌ No process output captured
- ❌ Start-Process with separate windows doesn't work
- ❌ Docker builds show no output

This is a **known bug** reported by multiple users in December 2025.

## Root Cause

The terminal integration in Agent Mode fails to capture stdout/stderr properly. Commands run but output is not displayed or captured.

## Fix #1: Enable Legacy Terminal Tool (RECOMMENDED)

1. Open Cursor Settings: `Ctrl+Shift+J` (or `Ctrl+,`)
2. Navigate to: **Agents > Inline Editing & Terminal**
3. Enable: **"Legacy Terminal Tool"**
4. Press `Ctrl+Shift+P` and select: **"Terminal: Kill All Terminals"**
5. **Restart Cursor IDE completely**

This has fixed the issue for many users.

## Fix #2: Delete Workspace Storage

1. **Close Cursor IDE completely**
2. Navigate to: `C:\Users\YourUsername\AppData\Roaming\Cursor`
3. Delete the `workspaceStorage` folder
4. Restart Cursor IDE

⚠️ **Warning**: This will reset workspace-specific settings.

## Fix #3: Check Shell Configuration

If you have custom PowerShell profiles or themes (Powerlevel9k/10k), they may interfere:

1. Check: `$PROFILE` in PowerShell
2. Temporarily rename: `Microsoft.PowerShell_profile.ps1`
3. Restart Cursor and test

## Fix #4: Update Cursor

Ensure you're on the latest version:
- Check for updates: `Help > Check for Updates`
- Or download from: https://cursor.sh/

## Workaround: Use External Terminal

Until the bug is fixed, you can:

1. **Run scripts manually** in external PowerShell/CMD windows
2. Use the batch file: `START_ALL_SERVERS.cmd`
3. Or use the background jobs script: `START_ALL_SERVERS_BACKGROUND.ps1`

## References

- [GitHub Issue #3416](https://github.com/cursor/cursor/issues/3416) - Agent terminal hanging
- [Forum: Agent Terminal Not Working](https://forum.cursor.com/t/agent-terminal-not-working/145338)
- [Forum: Terminal Output Not Showing](https://forum.cursor.com/t/solved-terminal-output-not-showing-in-agent-mode-delete-workspacestorage-folder-v2-1-39-windows-11/144751)
- [Forum: Shell Tool Returns pid: -1](https://forum.cursor.com/t/shell-tool-returns-pid-1-with-no-stdout-stderr-output-on-windows/145390)

## Testing After Fix

Run this command to verify terminal output works:

```powershell
Write-Host "Test output"; Get-Date; python --version
```

You should see:
- "Test output"
- Current date/time
- Python version

If you see output, the fix worked! 🎉

---

**Last Updated**: 2025-12-02
