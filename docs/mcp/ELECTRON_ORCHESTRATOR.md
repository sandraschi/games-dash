# ⚛️ The Electron Orchestrator (Games Edition)

This document explains the high-level pattern used to transform the Games Collection from a "script-and-tab" project into a **Premium Desktop Platform**.

---

## 🎨 The "Readme Zoo" Concept
This guide is part of the repository's "Readme Zoo" – specialized documentation for core architectural decisions. 

> [!TIP]
> This pattern is also documented in the global **[mcp-central-docs](file:///d:/Dev/repos/mcp-central-docs/patterns/electron-orchestrator-pattern/ELECTRON_ORCHESTRATOR.md)** for use in other projects like the OCR App.

---

## 🧐 Why Electron?
The Games Collection is not just a bunch of HTML files; it is a complex stack including:
- ♟️ **UCI Engines** (Stockfish)
- ⚪ **GTP Engines** (KataGo)
- ⚔️ **USI Engines** (YaneuraOu)
- 🐍 **Python Bridges**

**Electron** serves as the "Orchestrator" that hides this complexity.

---

## 🚀 How it Works in this Repo

### **1. Unified Startup**
When you run `npm run electron:dev`, the `electron/main.js` script launches **4 distinct background services** instantly. You see one window; the computer starts a server farm.

### **2. Stealth Operations**
All engines are launched with `windowsHide: true`. No blue console windows clutter your taskbar. The only thing in your task manager is the Games App and its sub-processes.

### **3. Graceful Termination**
Manual execution via `START_ALL_SERVERS.ps1` often leaves background processes running if the terminal is closed incorrectly. Electron's `app.on('window-all-closed')` ensures every single engine is killed instantly when you exit.

---

## 🛠️ Usage for Developers
If you are developing a new game that needs a heavy binary (e.g., a neural network for Mahjong), you don't need to write a new shell. Just register your script in `electron/main.js`.

```javascript
// Example: Adding a new engine
spawnPythonServer('backend/new-engine.py', 10004, 'NEW-ENGINE');
```

---

## 🎓 Philosophical Alignment
In our **Materialist/Reductionist** framework, we view the app as a single objective tool. The distinction between "The Python Backend" and "The JS UI" should stay hidden from the user. Electron achieves this functional unity.

---

## 🔗 Related Docs
- **[ELECTRON_PLAN.md](../ELECTRON_PLAN.md)**: The original implementation roadmap.
- **[GAMES_MCP.md](GAMES_MCP.md)**: How AI agents interact with these engines.
