# OpenClaw Hyper-V Container Installation Guide

## Overview

This guide provides step-by-step instructions for installing OpenClaw (open-source AI assistant) in a Hyper-V container with enhanced security hardening.

## Prerequisites

- **Hyper-V enabled** on Windows host
- **Docker Desktop** with WSL2 backend
- **Node.js 22.12.0+** (LTS with security patches)
- **足够的磁盘空间** for images and logs

## Step 1: Create Hyper-V Virtual Machine

```powershell
# Create a new Ubuntu VM for container isolation
New-VM -Name "OpenClaw-Container" -MemoryStartupBytes 4GB -BootDevice VHD -Path "C:\Hyper-V\OpenClaw" -NewVHDPath "C:\Hyper-V\OpenClaw\OpenClaw.vhdx" -NewVHDSizeBytes 40GB -SwitchName "Default Switch"

# Configure VM settings
Set-VMProcessor -VMName "OpenClaw-Container" -Count 2
Set-VMNetworkAdapter -VMName "OpenClaw-Container" -StaticMacAddress "00:15:5D:00:00:01"
```

## Step 2: Install Docker in the VM

```bash
# Inside the Ubuntu VM
sudo apt update && sudo apt upgrade -y
sudo apt install -y ca-certificates curl gnupg lsb-release
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update && sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo usermod -aG docker $USER
```

## Step 3: Install OpenClaw with Docker

```bash
# Clone OpenClaw repository
git clone https://github.com/openclaw/openclaw.git
cd openclaw

# Run the secure Docker setup
./docker-setup.sh

# Or manual secure installation:
docker build -t openclaw:local -f Dockerfile .
docker compose run --rm openclaw-cli onboard
docker compose up -d openclaw-gateway
```

## Step 4: Security Hardening Configuration

Create a secure configuration (`docker-compose.override.yml`):

```yaml
version: '3.8'
services:
  openclaw-gateway:
    build:
      context: .
      dockerfile: Dockerfile
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    cap_add:
      - CHOWN
      - SETGID
      - SETUID
    read_only: true
    tmpfs:
      - /tmp:noexec,nosuid,size=100m
    environment:
      - NODE_ENV=production
    networks:
      - openclaw-net
    ports:
      - "127.0.0.1:18789:18789"  # Bind to localhost only
    volumes:
      - openclaw-data:/app/data:rw
      - type: bind
        source: ./config
        target: /app/config
        read_only: true

networks:
  openclaw-net:
    driver: bridge
    internal: true  # Isolate from external network

volumes:
  openclaw-data:
    driver: local
```

## Step 5: Secure Gateway Configuration

Create `config/gateway.json`:

```json
{
  "gateway": {
    "mode": "local",
    "bind": "loopback",
    "port": 18789,
    "auth": {
      "mode": "token",
      "token": "your-long-random-token-here"
    }
  },
  "channels": {
    "whatsapp": {
      "dmPolicy": "pairing",
      "groups": {
        "*": {
          "requireMention": true
        }
      }
    }
  }
}
```

## Step 6: Network Security

```powershell
# On Windows host, configure firewall rules
New-NetFirewallRule -DisplayName "OpenClaw Container Inbound" -Direction Inbound -LocalPort 18789 -Protocol TCP -Action Allow -RemoteAddress 127.0.0.1
New-NetFirewallRule -DisplayName "OpenClaw Container Outbound" -Direction Outbound -LocalPort Any -Protocol Any -Action Block -RemoteAddress Any
```

## Step 7: Start and Verify

```bash
# Start the secure container
docker compose -f docker-compose.yml -f docker-compose.override.yml up -d

# Verify security
docker compose run --rm openclaw-cli dashboard --no-open
docker compose run --rm openclaw-cli devices list
```

## Security Benefits

1. **Isolation**: Hyper-V provides hardware-level isolation
2. **Container Security**: Read-only filesystem, dropped capabilities
3. **Network Isolation**: Internal bridge network, localhost-only binding
4. **Token Authentication**: Secure gateway access control
5. **Minimal Privileges**: Non-root user, reduced capabilities

## Access

- **Control UI**: `http://127.0.0.1:18789/`
- **Token**: Generated during setup, stored in `.env`
- **Logs**: `docker compose logs -f openclaw-gateway`

## Troubleshooting

### Common Issues

1. **Docker permission denied**: Ensure user is in docker group
2. **Port conflicts**: Check if port 18789 is already in use
3. **Hyper-V networking**: Verify Default Switch is working
4. **Memory issues**: Increase VM memory if needed

### Security Verification

```bash
# Check container security settings
docker inspect openclaw-gateway | grep -A 10 "SecurityOpt"

# Verify network isolation
docker network ls | grep openclaw
docker network inspect openclaw_openclaw-net
```

## References

- [OpenClaw Official Documentation](https://docs.openclaw.ai/)
- [OpenClaw Security Guide](https://docs.openclaw.ai/gateway/security)
- [Docker Security Best Practices](https://docs.docker.com/engine/security/)
