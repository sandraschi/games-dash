@echo off
echo Testing Gmail email configuration...
echo.

powershell -ExecutionPolicy Bypass -Command "& { ^
    $config = Get-Content 'tunnel-email-config.json' | ConvertFrom-Json; ^
    Write-Host 'Configuration loaded:' -ForegroundColor Green; ^
    Write-Host 'From: ' $config.SenderEmail -ForegroundColor Cyan; ^
    Write-Host 'To: ' ($config.EmailRecipients -join ', ') -ForegroundColor Cyan; ^
    Write-Host 'SMTP: ' $config.SmtpServer ':' $config.SmtpPort -ForegroundColor Cyan; ^
    Write-Host ''; ^
    Write-Host 'Sending test email...' -ForegroundColor Yellow; ^
    try { ^
        $smtp = New-Object Net.Mail.SmtpClient($config.SmtpServer, $config.SmtpPort); ^
        $smtp.EnableSsl = $true; ^
        $smtp.Credentials = New-Object System.Net.NetworkCredential($config.SmtpUsername, $config.SmtpPassword); ^
        $mail = New-Object Net.Mail.MailMessage; ^
        $mail.From = $config.SenderEmail; ^
        $mail.To.Add($config.EmailRecipients[0]); ^
        $mail.Subject = '[TEST] Games Server Email Test'; ^
        $mail.Body = 'Hello! This is a test of the automatic tunnel notification system. If you receive this, the email setup is working!'; ^
        $smtp.Send($mail); ^
        $mail.Dispose(); ^
        Write-Host 'SUCCESS: Test email sent!' -ForegroundColor Green; ^
    } catch { ^
        Write-Host 'FAILED: ' $_.Exception.Message -ForegroundColor Red; ^
    } ^
}"

pause