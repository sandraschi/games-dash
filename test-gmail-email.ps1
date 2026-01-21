# Test Gmail Email Configuration
# Simple script to test tunnel email notifications

Write-Host "? TESTING GMAIL EMAIL CONFIGURATION" -ForegroundColor Yellow
Write-Host ("=" * 40) -ForegroundColor Yellow
Write-Host ""

# Load configuration
$configPath = Join-Path $PSScriptRoot "tunnel-email-config.json"
if (!(Test-Path $configPath)) {
    Write-Host "? ERROR: Configuration file not found: $configPath" -ForegroundColor Red
    Write-Host "? Run setup-gmail-email.ps1 first" -ForegroundColor Yellow
    exit 1
}

$config = Get-Content $configPath | ConvertFrom-Json

Write-Host "? Configuration loaded:" -ForegroundColor Green
Write-Host "  From: $($config.SenderEmail)" -ForegroundColor Cyan
Write-Host "  To: $($config.EmailRecipients -join ', ')" -ForegroundColor Cyan
Write-Host "  SMTP: $($config.SmtpServer):$($config.SmtpPort)" -ForegroundColor Cyan
Write-Host ""

Write-Host "? Sending test email..." -ForegroundColor Yellow

try {
    # Create SMTP client
    $smtp = New-Object Net.Mail.SmtpClient($config.SmtpServer, $config.SmtpPort)
    $smtp.EnableSsl = $true
    $smtp.Timeout = 30000  # 30 seconds

    # Set credentials
    $smtp.Credentials = New-Object System.Net.NetworkCredential($config.SmtpUsername, $config.SmtpPassword)

    # Create mail message
    $mail = New-Object Net.Mail.MailMessage
    $mail.From = "$($config.SenderName) <$($config.SenderEmail)>"
    $mail.Subject = "[TEST] Games Server Tunnel Notification System"
    $mail.Body = @"
Hello Sandra!

This is a test of the automatic tunnel notification system.

? Test completed at: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

If you receive this email, the Gmail SMTP configuration is working correctly!

Your Osaka friend will automatically receive notifications when the Cloudflare tunnel URL changes after server restarts.

🎮 Available Games:
• Chess (with Stockfish AI - beatable!)
• Go, Shogi, Gomoku
• Japanese learning content
• Puzzle games, card games, arcade games

Happy gaming!
Games App Server
"@

    # Add recipients
    foreach ($recipient in $config.EmailRecipients) {
        $mail.To.Add($recipient)
    }

    # Send the email
    $smtp.Send($mail)
    $mail.Dispose()

    Write-Host "" -ForegroundColor Green
    Write-Host "? SUCCESS: Test email sent!" -ForegroundColor Green
    Write-Host "? Check your Gmail inbox (and spam folder)" -ForegroundColor Green
    Write-Host "? Your Osaka friend will get automatic notifications!" -ForegroundColor Green

} catch {
    Write-Host "" -ForegroundColor Red
    Write-Host "? FAILED: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "" -ForegroundColor Yellow
    Write-Host "? TROUBLESHOOTING:" -ForegroundColor Yellow
    Write-Host "1. Check your Gmail App Password is correct" -ForegroundColor White
    Write-Host "2. Verify 2FA is enabled on your Gmail account" -ForegroundColor White
    Write-Host "3. Make sure 'Less secure app access' is OFF (use App Password instead)" -ForegroundColor White
    Write-Host "4. Check Gmail security settings: https://myaccount.google.com/security" -ForegroundColor White
    Write-Host "5. Try generating a new App Password" -ForegroundColor White
    Write-Host "" -ForegroundColor Cyan
    Write-Host "? Alternative: Enable 'Less secure app access' temporarily:" -ForegroundColor Cyan
    Write-Host "  https://myaccount.google.com/lesssecureapps" -ForegroundColor White
}