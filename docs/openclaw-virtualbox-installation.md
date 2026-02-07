# OpenClaw VirtualBox Installation Guide (Recommended)

## Overview

This guide provides step-by-step instructions for installing OpenClaw in a VirtualBox container with enhanced security. VirtualBox offers better UI, easier setup, and excellent snapshot-based security features.

## Why VirtualBox is Better for OpenClaw

- **Better UI**: Intuitive graphical interface
- **Easier Setup**: No PowerShell scripting required
- **Snapshot Security**: Instant rollback capability
- **Cross-platform**: Works on Windows, macOS, Linux
- **Simple Networking**: Easy NAT/bridge configuration

## Prerequisites

- **VirtualBox 7.0+** (latest version)
- **4GB+ RAM** available on host
- **20GB+ free disk space**
- **Ubuntu 22.04 LTS** ISO image

## Step 1: Create VirtualBox VM

### Using the GUI (Recommended)

1. **Open VirtualBox**
2. **Click "New"** → Name: "OpenClaw-Secure"
3. **Type**: Linux → **Version**: Ubuntu (64-bit)
4. **Memory**: 4096 MB (4GB)
5. **Storage**: Create VHD → **Size**: 40 GB
6. **Network**: Enable NAT (default for security)

### Advanced Settings

```bash
# Or via command line for automation
VBoxManage createvm --name "OpenClaw-Secure" --ostype "Ubuntu_64" --register
VBoxManage modifyvm "OpenClaw-Secure" --memory 4096 --cpus 2
VBoxManage createhd --filename "OpenClaw-Secure.vdi" --size 40000 --format VDI
VBoxManage storagectl "OpenClaw-Secure" --name "SATA Controller" --add sata
VBoxManage storageattach "OpenClaw-Secure" --storagectl "SATA Controller" --port 0 --device 0 --type hdd --medium "OpenClaw-Secure.vdi"
VBoxManage modifyvm "OpenClaw-Secure" --nic1 nat
```

## Step 2: Install Ubuntu

1. **Mount Ubuntu 22.04 LTS ISO**
2. **Start VM** → Follow Ubuntu installation
3. **Create user**: `openclaw` (separate from admin)
4. **Enable auto-updates** during install
5. **Install OpenSSH server** (optional for management)

## Step 3: Install Guest Additions

```bash
# In the VM after Ubuntu installation
sudo apt update && sudo apt upgrade -y
sudo apt install -y build-essential dkms linux-headers-$(uname -r)

# Mount Guest Additions CD from VirtualBox menu
# Devices → Insert Guest Additions CD image...
sudo mount /dev/cdrom /mnt
cd /mnt
sudo ./VBoxLinuxAdditions.run
sudo reboot
```

## Step 4: Install Docker

```bash
# Install Docker using convenience script
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install -y docker-compose-plugin

# Reboot to apply group changes
sudo reboot
```

## Step 5: Install OpenClaw

```bash
# Clone and setup OpenClaw
git clone https://github.com/openclaw/openclaw.git
cd openclaw

# Run the setup script
./docker-setup.sh

# Or manual installation
docker build -t openclaw:local -f Dockerfile .
docker compose run --rm openclaw-cli onboard
docker compose up -d openclaw-gateway
```

## Step 6: Security Hardening

### Create Secure Docker Compose Override

```yaml
# docker-compose.override.yml
version: '3.8'
services:
  openclaw-gateway:
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
      - "127.0.0.1:18789:18789"
    volumes:
      - openclaw-data:/app/data:rw
      - type: bind
        source: ./config
        target: /app/config
        read_only: true

networks:
  openclaw-net:
    driver: bridge
    internal: true

volumes:
  openclaw-data:
    driver: local
```

### Secure Gateway Configuration

```json
// config/gateway.json
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

## Step 7: VirtualBox Security Configuration

### Network Isolation

1. **Set Network to NAT** (default - most secure)
2. **Port Forwarding** (if needed):
   - Host port: 18789 → Guest port: 18789
   - Protocol: TCP
   - Host IP: 127.0.0.1

### Shared Folders (Optional)

```bash
# Only enable if absolutely necessary
# Settings → Shared Folders → Add
# Folder path: /path/to/host/folder
# Folder name: shared-data
# Mount point: /media/shared
# Read-only: Yes (recommended)
# Auto-mount: Yes
```

### VM Security Settings

1. **Disable USB** (unless needed)
2. **Disable Audio** (unless needed)
3. **Disable Clipboard** bidirectional sharing
4. **Enable Drag-and-drop**: Disabled
5. **Enable 3D Acceleration**: Disabled

## Step 8: Create Security Snapshots

```bash
# Create baseline snapshot
VBoxManage snapshot "OpenClaw-Secure" take "baseline-clean-install" --description "Clean OpenClaw installation"

# Create pre-configuration snapshot
VBoxManage snapshot "OpenClaw-Secure" take "pre-config" --description "Before custom configuration"

# Create post-configuration snapshot
VBoxManage snapshot "OpenClaw-Secure" take "secure-config" --description "After security hardening"
```

## Step 9: Start and Verify

```bash
# Start OpenClaw securely
docker compose -f docker-compose.yml -f docker-compose.override.yml up -d

# Verify installation
docker compose run --rm openclaw-cli dashboard --no-open
docker compose run --rm openclaw-cli devices list

# Check container security
docker inspect openclaw-gateway | grep -A 10 "SecurityOpt"
```

## Step 10: Access OpenClaw

- **Control UI**: `http://127.0.0.1:18789/`
- **Token**: Check `.env` file in OpenClaw directory
- **Logs**: `docker compose logs -f openclaw-gateway`

## VirtualBox-Specific Security Benefits

### 1. **Snapshot-Based Security**
```bash
# If compromised, instantly rollback
VBoxManage snapshot "OpenClaw-Secure" restore "secure-config"

# Or use GUI: Machine → Snapshots → Select snapshot → Restore
```

### 2. **VM Encryption** (Optional)
```bash
# Enable VM encryption for additional security
VBoxManage encryptvm "OpenClaw-Secure" --newpassword --cipher AES-256
```

### 3. **Read-Only Mode**
```bash
# Set VM to read-only to prevent changes
VBoxManage modifyvm "OpenClaw-Secure" --statefile-read-only on
```

## Troubleshooting

### Common VirtualBox Issues

1. **VT-x/AMD-V not available**: Enable in BIOS
2. **Network not working**: Check NAT settings
3. **Shared folders not mounting**: Install Guest Additions
4. **Performance issues**: Increase RAM/CPU allocation

### Security Verification

```bash
# Check VM isolation
VBoxManage showvminfo "OpenClaw-Secure" | grep -E "(NIC|Memory|CPU)"

# Verify Docker security
docker inspect openclaw-gateway | grep -A 5 "Security"

# Test network isolation
docker network inspect openclaw_openclaw-net
```

## Backup and Recovery

### Regular Backups
```bash
# Export VM for backup
VBoxManage export "OpenClaw-Secure" --output "openclaw-backup.ova"

# Import from backup
VBoxManage import "openclaw-backup.ova"
```

### Snapshot Management
```bash
# List snapshots
VBoxManage snapshot "OpenClaw-Secure" list

# Delete old snapshots
VBoxManage snapshot "OpenClaw-Secure" delete "old-snapshot"
```

## Comparison Summary

| Feature | VirtualBox | Hyper-V |
|---------|------------|---------|
| **Setup Difficulty** | Easy | Moderate |
| **UI Quality** | Excellent | Basic |
| **Snapshot Security** | Excellent | Limited |
| **Performance** | Good | Better |
| **Cross-platform** | Yes | Windows only |
| **Best For** | Development/Testing | Production |

## Conclusion

VirtualBox provides the **best balance of security and usability** for OpenClaw installations. The excellent GUI, snapshot features, and simpler setup make it ideal for most users while still providing strong isolation and security features.

## References

- [VirtualBox Documentation](https://www.virtualbox.org/wiki/Documentation)
- [OpenClaw Security Guide](https://docs.openclaw.ai/gateway/security)
- [Docker Security Best Practices](https://docs.docker.com/engine/security/)
