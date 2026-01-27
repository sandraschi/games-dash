# 🎮 Games App Desktop (ALPHA)

**Status**: 🧪 ALPHA - Experimental Standalone Windows Release

This is the Electron-based desktop shell for the Games Collection. It is designed to provide a premium, dedicated window experience while managing the complex lifecycle of the AI game engines.

---

## 🚀 Alpha Features
- ✅ **Dedicated Window**: No more browser tab clutter.
- ✅ **Vienna-Style Branding**: Custom background colors and integrated title.
- ✅ **Clean Exit**: Automatically kills background AI processes when the app is closed.
- 🧪 **Dev Mode**: Built-in developer tools for UI debugging.

---

## 🛠️ Development Setup

### 1. Install Dependencies
```bash
cd electron
npm install
```

### 2. Launch (Local Server Required)
Ensure your Python game server is running on `localhost:9876`, then run:
```bash
npm start
```

### 3. Build Installer
```bash
npm run package
```

---

## ⚠️ Known Limitations (Alpha)
- **Engine Auto-Spawn**: Currently in development. AI servers must be started manually via `START_ALL_SERVERS.ps1`.
- **Packaging**: Binary size optimization is currently not implemented (~150MB+ base).
- **Icons**: Placeholder icons used until custom Vienna assets are generated.

---

## 🙏 Credits
Built with **FlowEngineering** by **sandraschi**.
"Ready before breakfast." ☕
