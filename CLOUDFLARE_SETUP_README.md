# Cloudflare Tunnel Setup - Free Permanent URL

## 🎯 Goal
Create a **permanent, free URL** for your games (instead of temporary trycloudflare.com URLs)

## 📋 Requirements
- Cloudflare account (free) - [sign up here](https://cloudflare.com)
- `cloudflared.exe` installed
- Games server running on port 9876

## 🚀 Quick Setup (3 steps)

### Step 1: Run Setup Script
```powershell
# This creates your tunnel and free subdomain
.\setup-cloudflare-tunnel.ps1
```

### Step 2: Login to Cloudflare
- Browser opens automatically
- Sign in with: `sandraschipal@hotmail.com`
- **⚠️ Complete CAPTCHA**: Cloudflare may ask "Are you human?" - check the box
- Complete the authentication process

### Step 3: Create Free Subdomain
- Script asks for your Cloudflare account name
- Usually your email username (e.g., "sandraschipal")
- Creates: `games-tunnel.sandraschipal.cloudflare.com`

## 🎉 Result
- **Permanent URL**: `https://games-tunnel.[your-account].cloudflare.com`
- **Never expires** (unlike trycloudflare.com)
- **Free forever** (Cloudflare Zero Trust)
- **Reliable** (better uptime than temp tunnels)

## 🔧 Manual Alternative
If script has issues:

1. `cloudflared tunnel login`
2. `cloudflared tunnel create games-tunnel`
3. Go to Cloudflare Dashboard → Zero Trust → Tunnels
4. Add public hostname: `games-tunnel.your-account.cloudflare.com`
5. `cloudflared tunnel run games-tunnel --url http://localhost:9876`

## 💡 Pro Tips
- Keep the tunnel running for 24/7 access
- Add to Windows startup for auto-start
- Share the permanent URL with friends
- No monthly costs or expiration

## 🆘 Troubleshooting
- **Login issues**: Clear browser cache, try incognito
- **CAPTCHA problems**: Make sure to check "I'm not a robot" box
- **Login timeout**: Takes longer with CAPTCHA - be patient
- **Subdomain fails**: Check account name, try variations
- **Tunnel won't start**: Make sure port 9876 is accessible

## 🔒 Security Notes
- **Credentials**: Only enter in official Cloudflare login page
- **CAPTCHA**: Required for security - part of Cloudflare's protection
- **Browser**: Use your main browser for login to avoid issues

**Your permanent gaming URL awaits!** 🎮✨