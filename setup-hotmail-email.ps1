# Simple Hotmail Email Setup for Tunnel Notifications

param(
    [switch]$Test,
    [string]$SenderName,
    [string]$Password,
    [string[]]$Recipients
)

$configFile = Join-Path $PSScriptRoot "tunnel-email-config.json"

if ($Test) {
    # Test existing configuration
    if (!(Test-Path $configFile)) {
        Write-Host "❌ No email configuration found. Run setup first." -ForegroundColor Red
        exit 1
    }

    Write-Host "🧪 TESTING HOTMAIL EMAIL CONFIGURATION" -ForegroundColor Green
    Write-Host "=====================================" -ForegroundColor Green
    Write-Host ""

    $config = Get-Content $configFile | ConvertFrom-Json

    Write-Host "📧 Testing email to: $($config.EmailRecipients -join ', ')" -ForegroundColor Cyan
    Write-Host "📤 From: $($config.SenderEmail)" -ForegroundColor Cyan
    Write-Host ""

    $testUrl = "https://test-tunnel.trycloudflare.com"

    try {
        $message = New-Object System.Net.Mail.MailMessage
        $message.From = New-Object System.Net.Mail.MailAddress($config.SenderEmail, $config.SenderName)
        $message.Subject = "🎮 Test: Games Server Email System"
        $message.Body = @"
Hi Friends!

This is a test of the games server email notification system.

Test URL: $testUrl

If you receive this email, the notification system is working correctly!

Best,
$($config.SenderName)
"@
        $message.IsBodyHtml = $false

        foreach ($recipient in $config.EmailRecipients) {
            $message.To.Add($recipient)
        }

        $smtp = New-Object System.Net.Mail.SmtpClient($config.SmtpServer, $config.SmtpPort)
        $smtp.EnableSsl = $true
        $smtp.Credentials = New-Object System.Net.NetworkCredential($config.SmtpUsername, $config.SmtpPassword)

        $smtp.Send($message)
        Write-Host "✅ Test email sent successfully!" -ForegroundColor Green
        Write-Host "   Check your inbox and recipients' inboxes." -ForegroundColor White

    } catch {
        Write-Host "❌ Test email failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        Write-Host "🔧 TROUBLESHOOTING:" -ForegroundColor Yellow
        Write-Host "1. Check your Hotmail password (use app password if 2FA enabled)" -ForegroundColor White
        Write-Host "2. Verify SMTP settings: smtp-mail.outlook.com:587" -ForegroundColor White
        Write-Host "3. Check spam folder" -ForegroundColor White
    }

} else {
    # Setup email configuration
    Write-Host "📧 HOTMAIL EMAIL SETUP FOR TUNNEL NOTIFICATIONS" -ForegroundColor Green
    Write-Host "===============================================" -ForegroundColor Green
    Write-Host ""

    Write-Host "This will configure automatic emails when tunnel URLs change." -ForegroundColor White
    Write-Host "Using Hotmail/Outlook settings (pre-configured)." -ForegroundColor Cyan
    Write-Host ""

    # Pre-fill Hotmail settings
    $script:SenderEmail = "sandraschipal@hotmail.com"
    $script:SmtpServer = "smtp-mail.outlook.com"
    $script:SmtpPort = 587

    # Get sender name
    if ($SenderName) {
        $script:SenderName = $SenderName
    } else {
        $script:SenderName = Read-Host 'Your name (for email signature)'
    }

    Write-Host "📧 Email: $script:SenderEmail" -ForegroundColor Cyan
    Write-Host "👤 Name: $script:SenderName" -ForegroundColor Cyan
    Write-Host "🌐 SMTP: $script:SmtpServer`:$script:SmtpPort" -ForegroundColor Cyan
    Write-Host ""

    # Get password
    if ($Password) {
        $script:SmtpPassword = $Password
    } else {
        Write-Host "🔑 Enter your Hotmail password:" -ForegroundColor Yellow
        Write-Host "   (If you have 2FA enabled, use an 'App Password' instead)" -ForegroundColor Gray
        Write-Host "   Create app password: https://account.microsoft.com/security/app-passwords" -ForegroundColor Gray
        Write-Host ""
        $securePassword = Read-Host -AsSecureString
        $script:SmtpPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword))
    }

    # Get recipients
    if ($Recipients -and $Recipients.Count -gt 0) {
        $script:EmailRecipients = $Recipients
    } else {
        Write-Host ""
        Write-Host "👥 Enter email addresses of friends/neighbors:" -ForegroundColor Cyan
        Write-Host "   (one per line, press Enter on blank line to finish)" -ForegroundColor Gray
        Write-Host ""
        $recipients = @()
        do {
            $email = Read-Host "Email address"
            if ($email) { $recipients += $email }
        } while ($email)
        $script:EmailRecipients = $recipients
    }

    # Save configuration
    $config = @{
        EmailRecipients = $EmailRecipients
        SenderEmail = $SenderEmail
        SenderName = $SenderName
        SmtpServer = $SmtpServer
        SmtpPort = $SmtpPort
        SmtpUsername = $SenderEmail  # For Hotmail, username is email
        SmtpPassword = $SmtpPassword
    }

    $config | ConvertTo-Json | Out-File -FilePath $configFile -Encoding UTF8

    Write-Host ""
    Write-Host "✅ Hotmail email configuration saved!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔐 SECURITY NOTE:" -ForegroundColor Yellow
    Write-Host "   Password is stored locally in tunnel-email-config.json" -ForegroundColor White
    Write-Host "   Keep this file secure and don't share it." -ForegroundColor White
    Write-Host ""
    Write-Host "🧪 TEST EMAIL:" -ForegroundColor Cyan
    Write-Host "   Run: .\setup-hotmail-email.ps1 -Test" -ForegroundColor White
    Write-Host ""
    Write-Host "🚀 SETUP COMPLETE!" -ForegroundColor Green
    Write-Host "   Your Osaka friend will get automatic notifications!" -ForegroundColor Cyan
}