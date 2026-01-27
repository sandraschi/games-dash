# 🐳 Infrastructure & Deployment Guide

This document covers advanced deployment methods, remote access, and server management.

---

## 🐳 Docker Deployment

For a clean, isolated installation:

1. Make sure **Docker Desktop** is running.
2. Run: `docker-compose up -d`
3. Access at: `http://localhost:9876`

**How it works**:
- The **web server** runs inside a Linux container for stability and isolation.
- The **AI engines** (.exe files) must run natively on your Windows host.
- Use `.\START_ALL_SERVERS.ps1` to start the AI backends on Windows.

---

## 🌍 Remote Access & AI Connectivity

### Access from Anywhere
- **Local Network**: `http://YOUR-PC-IP:9876`
- **Tailscale VPN**: `http://YOUR-TAILSCALE-IP:9876` (works from anywhere)

### Optimized for iPad
The AI now works perfectly on iPad thanks to an intelligent proxy system:
- **Web server** in Docker handles the interface.
- **Nginx proxy** routes AI requests from your iPad to the correct Windows host ports.
- **Automatic Tailscale detection** for roaming connections.

---

## 🌐 Free Remote Tunnels (Cloudflare)

If you don't want to use a VPN, you can use our automated Cloudflare tunnel setup:

1. **Setup**: `.\setup-free-tunnel.ps1 -Setup`
2. **Start**: `.\setup-free-tunnel.ps1 -Start`
3. **Notify**: `.\tunnel-email-notifier.ps1` (Automatically emails friends when the URL changes).

### Why Cloudflare?
- **100% Free**: No domain or credit card needed.
- **Secure**: End-to-end encryption.
- **Firewall Friendly**: Works even without port forwarding.

---

## ⚙️ Windows Service Integration (Recommended)

For a professional "always on" setup:

1. Run `.\setup-games-service.bat` as Administrator.
2. The service will manage the Web Server, Sound Service, Multiplayer Server, and all AI engines.

**Benefits**:
- ✅ **Automatic startup** on Windows boot.
- ✅ **Crash recovery** - restarts failed servers instantly.
- ✅ **Centralized logging** in `service.log`.
