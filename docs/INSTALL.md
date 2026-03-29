# 📦 Installation & Setup Guide

Welcome to the Games Collection! This guide will help you get everything running quickly, whether you just want to play or you want to customize your experience.

---

## 🚀 Option 1: One-Click Setup (Recommended for Windows)

The easiest way to get started is using our automated installer. This will set up Docker, configure your firewall, and start all 75+ games.

1.  **Download** the latest release from the [GitHub Releases](https://github.com/sandraschi/games-dash/releases) page.
2.  **Extract** the ZIP file to a folder (e.g., `C:\Games\GamesCollection`).
3.  **Double-click** `Install_Games.bat`.
4.  **Wait** for the process to finish. Your browser will open automatically when ready.

> [!TIP]
> This method handles all background AI engines (Stockfish, YaneuraOu, etc.) automatically.

---

## 🖥️ Option 2: Manual Start (No Docker)

If you have Python already installed and prefer not to use Docker:

1.  **Download** the source code from the [GitHub Releases](https://github.com/sandraschi/games-dash/releases) page.
2.  **Open PowerShell** in the project folder.
3.  **Run**: `.\START_EVERYTHING.ps1`
4.  **Play**: Open `http://localhost:9876` in your browser.

---

## 🐳 Option 3: Docker Deployment (Power Users)

For a clean, isolated installation:

1.  Make sure **Docker Desktop** is running.
2.  Run: `docker-compose up -d`
3.  Access at: `http://localhost:9876`

> [!IMPORTANT]
> To use AI opponents (Chess/Shogi/Go) in Docker mode, you must also start the AI engines on your Windows host using `.\START_ALL_SERVERS.ps1`.

---

## 🌍 Remote Play (iPad/Mobile)

To play games on your iPad or phone across your home network:

1.  Find your PC's IP address (Run `ipconfig` in terminal).
2.  On your iPad, visit: `http://[YOUR-PC-IP]:9876`
3.  For play from anywhere in the world, we recommend using [Tailscale](https://tailscale.com/).

---

## 🛠️ For Developers & Contributors

If you want to modify the code or contribute to the project:

### Prerequisites
- **Python 3.11+**
- **Node.js 18+**
- **Git**

### Setup
```bash
# Clone the repository
git clone https://github.com/sandraschi/games-dash.git
cd games-dash

# Install in editable mode
pip install -e .

# Run tests
npm test
```

See [DEVELOPMENT.md](DEVELOPMENT.md) for more details on the architecture and contribution workflow.

---

## 🔍 Troubleshooting

- **AI doesn't move**: Ensure `START_ALL_SERVERS.ps1` is running.
- **Can't connect**: Check your Windows Firewall settings.
- **Port Busy**: Kill any processes using port 9876 or 9543.

For more help, visit our [GitHub Issues](https://github.com/sandraschi/games-dash/issues).
