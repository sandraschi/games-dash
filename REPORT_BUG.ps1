# Bug Report Helper Script
# Generates bug report with system info

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Red
Write-Host "  CURSOR IDE TERMINAL BUG REPORT GENERATOR" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Red
Write-Host ""

$report = @"
## Terminal Completely Non-Functional - Critical Bug

**Severity**: P0 - Critical (Product Breaking)

**Description**:
Terminal commands in Agent Mode report success (exit code 0) but nothing actually executes. No stdout/stderr output, no processes start, commands appear to run but produce no results.

**Impact**:
- Cannot run any terminal commands
- Cannot build projects
- Cannot start servers
- Cannot use Docker
- Cannot execute scripts
- **Cursor IDE is unusable for terminal-based development**

**Steps to Reproduce**:
1. Open Cursor IDE
2. Use Agent Mode or integrated terminal
3. Run command: `python --version`
4. Command reports success (exit code 0)
5. **No output appears**
6. Process doesn't actually execute

**Expected Behavior**:
Commands should execute and display output.

**Actual Behavior**:
Commands report success but nothing happens. No output, no execution.

**Workaround**:
Enable Legacy Terminal Tool (Settings → Agents → Legacy Terminal Tool)
OR use external terminals (bypasses Cursor completely)

**System Information**:
- OS: $($PSVersionTable.OS)
- PowerShell: $($PSVersionTable.PSVersion)
- Cursor Version: [CHECK: Help → About]
- Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

**Additional Notes**:
This bug makes Cursor IDE completely unusable for any development work requiring terminal commands. This is a critical issue that needs immediate attention.

**Related Issues**:
- GitHub #3138: Commands loading indefinitely
- GitHub #3416: Agent Mode terminal commands failing
- Forum: Multiple reports in December 2025

**Report At**:
- GitHub: https://github.com/cursor/cursor/issues/new
- Forum: https://forum.cursor.com/
"@

Write-Host "Bug Report Generated:" -ForegroundColor Green
Write-Host ""
Write-Host $report
Write-Host ""

# Save to file
$reportFile = "CURSOR_BUG_REPORT_$(Get-Date -Format 'yyyyMMdd_HHmmss').md"
$report | Out-File -FilePath $reportFile -Encoding UTF8

Write-Host "Report saved to: $reportFile" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Copy the report above" -ForegroundColor White
Write-Host "2. Go to: https://github.com/cursor/cursor/issues/new" -ForegroundColor White
Write-Host "3. Paste and submit" -ForegroundColor White
Write-Host "4. Also post on forum: https://forum.cursor.com/" -ForegroundColor White
Write-Host ""
