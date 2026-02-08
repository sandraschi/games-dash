# Games App Desktop

Electron wrapper for the Games Collection. Run as native Windows app without Docker.

## Setup (from repo root)

```powershell
cd D:\Dev\repos\games-app
npm install
```

## Run

| Command | Description |
|---------|-------------|
| `npm run start:standalone` | No Python/Docker - arcade games only |
| `npm start` | Auto: use existing :9876 or start standalone |
| `npm start -- --full` | Spawn Python backend (requires Python in PATH) |

## Build EXE

```powershell
npm run package
```

Output: `dist/Games Collection 1.4.0.exe`

## See Also

- [docs/ELECTRON_STANDALONE.md](../docs/ELECTRON_STANDALONE.md) - Full documentation
