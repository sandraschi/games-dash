# Tunnel Email Notifier
# Automatically emails new tunnel URLs to friends and neighbors

param(
    [string]$TunnelUrl,
    [array]$EmailRecipients = @("friend1@example.com", "friend2@example.com"),
    [string]$SenderEmail = "your-email@example.com",
    [string]$SenderName = "Games Server",
    [string]$SmtpServer = "smtp.gmail.com",
    [int]$SmtpPort = 587,
    [string]$SmtpUsername,
    [string]$SmtpPassword
)

# Load saved configuration if it exists
$configFile = Join-Path $PSScriptRoot "tunnel-email-config.json"
if (Test-Path $configFile) {
    $savedConfig = Get-Content $configFile | ConvertFrom-Json
    $EmailRecipients = $savedConfig.EmailRecipients
    $SenderEmail = $savedConfig.SenderEmail
    $SenderName = $savedConfig.SenderName
    $SmtpServer = $savedConfig.SmtpServer
    $SmtpPort = $savedConfig.SmtpPort
    $SmtpUsername = $savedConfig.SmtpUsername
    $SmtpPassword = $savedConfig.SmtpPassword
}

# Track last sent URL
$lastUrlFile = Join-Path $PSScriptRoot "last-tunnel-url.txt"
$lastUrl = if (Test-Path $lastUrlFile) { Get-Content $lastUrlFile -Raw } else { $null }

function Send-TunnelEmail {
    param([string]$Url)

    if (!$SmtpUsername -or !$SmtpPassword) {
        Write-Host "❌ Email not configured - missing SMTP credentials" -ForegroundColor Red
        Write-Host "   Run: .\tunnel-email-notifier.ps1 -Setup" -ForegroundColor Yellow
        return $false
    }

    $subject = "🎮 New Games Server URL Available!"
    $body = @"
Hi Friends!

The games server has restarted and has a new access URL:

🌐 $Url

🎯 Available games:
• Chess (with Stockfish AI)
• Go (with KataGo AI)
• Shogi (with YaneuraOu AI)
• Puzzles and more!

The URL will work until the next server restart.
Have fun playing!

Best,
$SenderName
"@

    try {
        $message = New-Object System.Net.Mail.MailMessage
        $message.From = New-Object System.Net.Mail.MailAddress($SenderEmail, $SenderName)
        $message.Subject = $subject
        $message.Body = $body
        $message.IsBodyHtml = $false

        foreach ($recipient in $EmailRecipients) {
            $message.To.Add($recipient)
        }

        $smtp = New-Object System.Net.Mail.SmtpClient($SmtpServer, $SmtpPort)
        $smtp.EnableSsl = $true
        $smtp.Credentials = New-Object System.Net.NetworkCredential($SmtpUsername, $SmtpPassword)

        $smtp.Send($message)
        Write-Host "✅ Email sent to $($EmailRecipients.Count) recipients" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "❌ Email failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Save-Url {
    param([string]$Url)
    $Url | Out-File -FilePath $lastUrlFile -Encoding UTF8 -NoNewline
}

function Setup-Email {
    Write-Host "📧 TUNNEL EMAIL SETUP" -ForegroundColor Green
    Write-Host "====================" -ForegroundColor Green
    Write-Host ""

    Write-Host "This will configure automatic emails when tunnel URLs change." -ForegroundColor White
    Write-Host ""

    # Get sender email
    $script:SenderEmail = Read-Host "Your email address (sender)"
    $script:SenderName = Read-Host "Your name (for email signature)"

    # Get SMTP settings
    $script:SmtpServer = Read-Host "SMTP server (gmail: smtp.gmail.com, outlook: smtp-mail.outlook.com)"
    if (!$script:SmtpServer) { $script:SmtpServer = "smtp.gmail.com" }

    $script:SmtpPort = Read-Host "SMTP port (587 for most providers)"
    if (!$script:SmtpPort) { $script:SmtpPort = 587 }

    $script:SmtpUsername = Read-Host "SMTP username (usually your email)"

    # Get password securely
    Write-Host "Enter SMTP password (for Gmail: use App Password, not regular password):" -ForegroundColor Yellow
    $securePassword = Read-Host -AsSecureString
    $script:SmtpPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword))

    # Get recipients
    Write-Host ""
    Write-Host "Enter email addresses of friends/neighbors (one per line, blank to finish):" -ForegroundColor Cyan
    $recipients = @()
    do {
        $email = Read-Host "Email address"
        if ($email) { $recipients += $email }
    } while ($email)

    $script:EmailRecipients = $recipients

    # Save configuration
    $config = @{
        EmailRecipients = $EmailRecipients
        SenderEmail = $SenderEmail
        SenderName = $SenderName
        SmtpServer = $SmtpServer
        SmtpPort = $SmtpPort
        SmtpUsername = $SmtpUsername
        SmtpPassword = $SmtpPassword
    }

    $config | ConvertTo-Json | Out-File -FilePath $configFile -Encoding UTF8

    Write-Host ""
    Write-Host "✅ Email configuration saved!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔐 SECURITY NOTE:" -ForegroundColor Yellow
    Write-Host "   Password is stored locally in tunnel-email-config.json" -ForegroundColor White
    Write-Host "   Keep this file secure and don't share it." -ForegroundColor White
    Write-Host ""
    Write-Host "🧪 TEST EMAIL:" -ForegroundColor Cyan
    Write-Host "   Run: .\tunnel-email-notifier.ps1 -Test" -ForegroundColor White
}

function Test-Email {
    Write-Host "🧪 TESTING EMAIL CONFIGURATION" -ForegroundColor Cyan
    Write-Host ""

    $testUrl = "https://test-tunnel.trycloudflare.com"
    $result = Send-TunnelEmail -Url $testUrl

    if ($result) {
        Write-Host ""
        Write-Host "✅ Test email sent successfully!" -ForegroundColor Green
        Write-Host "   Check your inbox and recipients' inboxes." -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "❌ Test email failed. Check configuration." -ForegroundColor Red
    }
}

function Monitor-Tunnel {
    param([string]$Url)

    Write-Host "👀 MONITORING TUNNEL URL CHANGES" -ForegroundColor Cyan
    Write-Host "URL: $Url" -ForegroundColor White
    Write-Host "Recipients: $($EmailRecipients -join ', ')" -ForegroundColor White
    Write-Host ""

    if ($lastUrl -and $lastUrl.Trim() -eq $Url.Trim()) {
        Write-Host "ℹ️  URL unchanged since last check" -ForegroundColor Gray
        return
    }

    Write-Host "🆕 NEW TUNNEL URL DETECTED!" -ForegroundColor Green
    Write-Host "Old: $($lastUrl ? $lastUrl : 'None')" -ForegroundColor Gray
    Write-Host "New: $Url" -ForegroundColor Green
    Write-Host ""

    Write-Host "📧 SENDING EMAIL NOTIFICATION..." -ForegroundColor Yellow
    $emailSent = Send-TunnelEmail -Url $Url

    if ($emailSent) {
        Save-Url -Url $Url
        Write-Host ""
        Write-Host "✅ Notification sent! Friends will get the new URL." -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "❌ Email failed. Will retry next check." -ForegroundColor Red
    }
}

# Main logic
if ($Setup) {
    Setup-Email
} elseif ($Test) {
    Test-Email
} elseif ($TunnelUrl) {
    Monitor-Tunnel -Url $TunnelUrl
} else {
    Write-Host "🎮 Tunnel Email Notifier" -ForegroundColor Green
    Write-Host "=======================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor White
    Write-Host "  .\tunnel-email-notifier.ps1 -Setup          Configure email settings" -ForegroundColor Cyan
    Write-Host "  .\tunnel-email-notifier.ps1 -Test           Send test email" -ForegroundColor Cyan
    Write-Host "  .\tunnel-email-notifier.ps1 -TunnelUrl URL  Check/send notification for URL" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Gray
    Write-Host "  .\tunnel-email-notifier.ps1 -Setup" -ForegroundColor White
    Write-Host "  .\tunnel-email-notifier.ps1 -TunnelUrl 'https://abc123.trycloudflare.com'" -ForegroundColor White
    Write-Host ""
    Write-Host "Configuration file: tunnel-email-config.json" -ForegroundColor Gray
    Write-Host "Last URL file: last-tunnel-url.txt" -ForegroundColor Gray
}