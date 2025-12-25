# PowerShell Profile Fix for Cursor Terminal

## The Problem

**Legacy Terminal Tool description says:**
> "use legacy on systems with unsupported shell configurations"

**This is a strong hint** that your PowerShell profile (with Windsurf workarounds) is breaking Cursor's new terminal integration!

## Why This Happens

Your profile likely:
1. **Intercepts commands** - Modifies how commands are executed
2. **Handles && syntax** - Converts Linux `&&` to PowerShell syntax
3. **Changes stdout/stderr** - Redirects output in ways Cursor can't capture
4. **Modifies command execution** - Wraps commands in functions/aliases

**Cursor's new terminal integration** expects:
- Direct command execution
- Standard stdout/stderr streams
- No command interception
- Clean PowerShell environment

**Your Windsurf workaround** does the opposite - it intercepts and modifies commands, which breaks Cursor's terminal.

## The Solution

Make the profile **Cursor-aware** - skip all workarounds when Cursor is detected.

### How to Fix

Run this script:
```powershell
.\MAKE_PROFILE_CURSOR_SAFE.ps1
```

This will:
1. ✅ Backup your current profile
2. ✅ Add Cursor detection at the top
3. ✅ Skip all workarounds when `CURSOR_AGENT=1` is set
4. ✅ Preserve Windsurf workarounds (still work for Windsurf)
5. ✅ Add parent process detection (backup check)

### What the Fix Does

```powershell
# At the top of your profile:
if ($env:CURSOR_AGENT -eq "1") {
    # Cursor detected - skip ALL workarounds
    return
}

# Windsurf workarounds below (only active when NOT in Cursor)
# ... your original code ...
```

**Result:**
- ✅ **Cursor**: Profile exits immediately → Clean PowerShell → Terminal works
- ✅ **Windsurf**: Workarounds active → Fixes && syntax → Still works
- ✅ **Other terminals**: Workarounds active → Safe default

## Testing

After applying the fix:

1. **Close Cursor completely**
2. **Open new PowerShell window** (reloads profile)
3. **Restart Cursor**
4. **Test terminal**:
   ```powershell
   Write-Host "Test"; Get-Date; python --version
   ```

**If you see output** → ✅ Fixed! Profile was the problem.

**If still no output** → It's the Cursor bug, not your profile. Use:
- Legacy Terminal Tool (bypasses profile)
- External terminals
- Batch files

## Why Legacy Terminal Tool Works

Legacy Terminal Tool uses the **old terminal system** that:
- Doesn't rely on clean stdout/stderr capture
- Handles command interception better
- Works with modified profiles

**New terminal system** (broken by your profile):
- Requires clean command execution
- Needs direct stdout/stderr access
- Breaks when commands are intercepted

## Alternative: Temporary Disable

If you want to test without modifying the profile:

1. **Rename profile temporarily**:
   ```powershell
   Rename-Item $PROFILE "$PROFILE.disabled"
   ```
2. **Restart Cursor**
3. **Test terminal**
4. **If it works** → Profile was the problem
5. **Rename back**:
   ```powershell
   Rename-Item "$PROFILE.disabled" $PROFILE
   ```

## Summary

**Root cause**: Windsurf workaround profile intercepts commands → Breaks Cursor's terminal

**Solution**: Make profile Cursor-aware → Skip workarounds in Cursor → Terminal works

**Test**: Run `MAKE_PROFILE_CURSOR_SAFE.ps1` and restart Cursor

---

**The Legacy Terminal Tool hint was the key clue!** It's telling you that unsupported shell configurations (like your profile) break the new terminal, so use legacy mode instead.
