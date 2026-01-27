# ⚛️ Electron Standalone App: Tentative Plan

This document outlines the strategy for packaging the Games Collection as a standalone Windows application using Electron.

---

## 🧐 Feasibility Analysis: Is it a good idea?

### **Pros:**
- ✅ **Premium Feel**: Provides a dedicated desktop icon and window, moving away from "just a browser tab."
- ✅ **Native Integration**: Better control over window sizing, system tray, and notifications.
- ✅ **Self-Contained Logic**: Potential to bundle the AI engine management directly into the app lifecycle.
- ✅ **Offline Trust**: Users feel more "offline-first" when using a dedicated `.exe`.

### **Cons:**
- ❌ **Binary Size**: Bundling Chromium (Electron) + Python + 3 high-end AI binaries (Stockfish/KataGo/YaneuraOu) would result in a massive installation package (1GB+).
- ❌ **Maintenance**: Adds another platform to test and update alongside the Web and Mobile versions.
- ❌ **Redundancy**: The current PWA implementation already offers 90% of the benefits with 0% of the overhead.

---

## 🛠️ Implementation Strategy: The "Dual-Nature" Challenge

The biggest challenge is managing the **AI Backends**. We have two options:

### **Option A: The Hybrid Bundle (Easier)**
The Electron app simply acts as a refined browser shell for the local web server. It still requires `START_ALL_SERVERS.ps1` to be run separately.
- **Complexity**: Low.
- **User Experience**: Still requires a terminal window.

### **Option B: The Integrated Orchestrator (Premium)**
The Electron **Main Process** (Node.js) takes over the responsibility of spawning and monitoring the Stockfish, KataGo, and YaneuraOu processes.
- **Complexity**: Medium.
- **User Experience**: One click to rule them all. No Python terminal visible.

---

## 📅 Tentative Roadmap

### **Phase 1: Shell Implementation**
- Initialize `npm init` and `npm install electron`.
- Create `main.js`: Setup window with 1200x900 default, native menu bar removal, and "Vienna-style" custom icon.
- Configure `package.json` with scripts for `start` and `package`.

### **Phase 2: Engine Orchestration (Node.js Bridge)**
- Implement `child_process` logic in `main.js` to start the AI engines on app launch.
- Map the internal ports so the game UI can talk to the engines without needing the Python middle-layer (rewriting the backend logic in Node/C++).
- Implement a "System Tray" indicator showing engine health (Green/Yellow/Red).

### **Phase 3: Packaging & Distribution**
- Use **Electron Forge** or **Electron Builder**.
- Create a Windows Installer (`.msi` or `.exe`).
- Optimize the build by excluding non-essential game source files (only bundling the production `dist`).

---

## 🏗️ Monorepo Scaffolding Strategy

To keep the Electron app in the same repository, we will use an **Integrated Sub-Package** approach.

### **1. Directory Structure**
```
games-app/
├── electron/           # Electron main process logic
│   ├── main.js         # Window & Engine management
│   ├── preload.js      # Secure IPC bridge
│   ├── assets/         # App icons (Vienna styles)
│   └── package.json    # Electron-specific dependencies
├── games/              # Shared game source (symlinked or referenced)
├── backend/            # Python AI engines (spawned by Electron)
└── package.json        # Root package: scripts for the whole repo
```

### **2. Root Script Management**
The root `package.json` will act as the orchestrator:
```json
{
  "scripts": {
    "electron:dev": "cd electron && npm start",
    "electron:build": "cd electron && npm run build",
    "dev:all": "concurrently \"npm run server:python\" \"npm run electron:dev\""
  }
}
```

### **3. Engine Lifecycle Management**
Instead of having the user run PowerShell scripts, Electron's `main.js` will use Node's `child_process.spawn`:
- **Step 1**: On app launch, spawn `web-server.py` and AI bridges.
- **Step 2**: Monitor their PIDs.
- **Step 3**: On app close, perform a graceful `SIGTERM` of all background processes.

---

## 🎓 Verdict
**Is it worth it?**
If you want a **"Product"** feeling where someone can install a single file and have everything work without seeing a command prompt, it is a high-value move. However, if the goal is purely functional, the existing PWA and Docker setups are technically superior and lighter.
