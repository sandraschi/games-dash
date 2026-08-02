# Gmail Email Setup for Tunnel Notifications
# Configures automatic email notifications for Cloudflare tunnel URL changes

param(
    [string]$SenderName = "",
    [string]$Password = "",
    [string]$Recipients = "",
    [switch]$Test
)

$configPath = Join-Path $PSScriptRoot "tunnel-email-config.json"

if ($Test) {
    Write-Host "? TESTING GMAIL EMAIL CONFIGURATION" -ForegroundColor Yellow
    Write-Host ("=" * 40) -ForegroundColor Yellow

    if (!(Test-Path $configPath)) {
        Write-Host "? No email configuration found. Run setup first." -ForegroundColor Red
        exit 1
    }

    $config = Get-Content $configPath | ConvertFrom-Json

    Write-Host "? Testing email to: $($config.EmailRecipients -join ', ')" -ForegroundColor Cyan
    Write-Host "? From: $($config.SenderEmail)" -ForegroundColor Cyan

    # Test email content
    $subject = "[TEST] AI Games Collection Tunnel Notification System"
    $body = @"
Hello Sandra!

This is a test of the automatic tunnel notification system.

? Test completed at: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

If you receive this email, the system is working correctly!

Regards,
AI Games Collection Server
"@

    try {
        $smtp = New-Object Net.Mail.SmtpClient($config.SmtpServer, $config.SmtpPort)
        $smtp.EnableSsl = $true
        $smtp.Credentials = New-Object System.Net.NetworkCredential($config.SmtpUsername, $config.SmtpPassword)

        $mail = New-Object Net.Mail.MailMessage
        $mail.From = "$($config.SenderName) <$($config.SenderEmail)>"
        $mail.Subject = $subject
        $mail.Body = $body
        $mail.IsBodyHtml = $false

        foreach ($recipient in $config.EmailRecipients) {
            $mail.To.Add($recipient)
        }

        $smtp.Send($mail)
        $mail.Dispose()

        Write-Host "? Test email sent successfully!" -ForegroundColor Green
        Write-Host "? Check your Gmail inbox (and spam folder)." -ForegroundColor Green

    } catch {
        Write-Host "? Test email failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "" -ForegroundColor Red
        Write-Host "? TROUBLESHOOTING:" -ForegroundColor Yellow
        Write-Host "1. Check your Gmail App Password" -ForegroundColor White
        Write-Host "2. Verify SMTP settings: smtp.gmail.com:587" -ForegroundColor White
        Write-Host "3. Check spam folder" -ForegroundColor White
        Write-Host "4. Enable 'Less secure app access' or use App Password" -ForegroundColor White
    }

    exit 0
}

# Interactive setup
Write-Host "? GMAIL EMAIL SETUP FOR TUNNEL NOTIFICATIONS" -ForegroundColor Yellow
Write-Host ("=" * 50) -ForegroundColor Yellow
Write-Host "" -ForegroundColor White
Write-Host "This will configure automatic emails when tunnel URLs change." -ForegroundColor White
Write-Host "Using Gmail SMTP settings (more reliable than Hotmail)." -ForegroundColor White
Write-Host "" -ForegroundColor White

# Get sender email
$senderEmail = ""
while (!$senderEmail) {
    if ($SenderName) {
        $senderEmail = Read-Host "Gmail address (e.g., sandra@gmail.com)"
    } else {
        $senderEmail = Read-Host "Your Gmail address"
    }
    if (!$senderEmail -or !$senderEmail.Contains("@gmail.com")) {
        Write-Host "? Please enter a valid Gmail address" -ForegroundColor Red
        $senderEmail = ""
    }
}

# Get sender name
if (!$SenderName) {
    $SenderName = Read-Host "Your name (for email signature)"
}

# Get app password
if (!$Password) {
    Write-Host "" -ForegroundColor Yellow
    Write-Host "? GMAIL APP PASSWORD SETUP:" -ForegroundColor Yellow
    Write-Host "1. Go to: https://myaccount.google.com/security" -ForegroundColor White
    Write-Host "2. Enable 2-Step Verification if not already enabled" -ForegroundColor White
    Write-Host "3. Go to: https://myaccount.google.com/apppasswords" -ForegroundColor White
    Write-Host "4. Select 'Mail' and 'Other (custom name)'" -ForegroundColor White
    Write-Host "5. Enter 'Games Server' as the name" -ForegroundColor White
    Write-Host "6. Copy the 16-character password" -ForegroundColor White
    Write-Host "" -ForegroundColor White
    $Password = Read-Host "Enter your Gmail App Password (16 characters)"
}

# Get recipients
if (!$Recipients) {
    $recipientsInput = Read-Host "Recipient email addresses (comma-separated)"
    $recipientsList = $recipientsInput -split "," | ForEach-Object { $_.Trim() }
} else {
    $recipientsList = $Recipients -split "," | ForEach-Object { $_.Trim() }
}

# Validate recipients
$validRecipients = @()
foreach ($recipient in $recipientsList) {
    if ($recipient -match "^[^@]+@[^@]+\.[^@]+$") {
        $validRecipients += $recipient
    } else {
        Write-Host "? Skipping invalid email: $recipient" -ForegroundColor Yellow
    }
}

if ($validRecipients.Count -eq 0) {
    Write-Host "? No valid recipients specified" -ForegroundColor Red
    exit 1
}

# Create configuration
$config = @{
    SenderEmail = $senderEmail
    SenderName = $SenderName
    SmtpServer = "smtp.gmail.com"
    SmtpPort = 587
    SmtpUsername = $senderEmail
    SmtpPassword = $Password
    EmailRecipients = $validRecipients
}

# Save configuration
$config | ConvertTo-Json | Set-Content $configPath -Encoding UTF8

Write-Host "" -ForegroundColor Green
Write-Host "? Gmail email configuration saved!" -ForegroundColor Green
Write-Host "" -ForegroundColor Yellow
Write-Host "? SECURITY NOTE:" -ForegroundColor Yellow
Write-Host "   App Password is stored locally in tunnel-email-config.json" -ForegroundColor White
Write-Host "   Keep this file secure and don't share it." -ForegroundColor White
Write-Host "" -ForegroundColor Cyan
Write-Host "? TEST EMAIL:" -ForegroundColor Cyan
Write-Host "   Run: .\setup-gmail-email.ps1 -Test" -ForegroundColor White
Write-Host "" -ForegroundColor Green
Write-Host "? SETUP COMPLETE!" -ForegroundColor Green
Write-Host "   Your Osaka friend will get automatic notifications!" -ForegroundColor Green