# WBridge5 — GUI Element Map

## Discovery Session (2026-06-09)

### Window Info

| Property | Value |
|----------|-------|
| Install path | `C:\Programs\WBridge5\` |
| Window title | `Wbridge5` |
| Deal info window | `Wbridge5     Deal: {number}` |
| Main HWND | 3417818 |
| Child HWND | 22288464 |
| UIA support | **None** — Delphi Win32 app |
| Automation surface | Keyboard shortcuts + coordinate clicks |
| Window size | ~800x600 (reported app resolution) |

### Verified keyboard shortcuts

| Key | Action | Status |
|-----|--------|--------|
| `F5` | New deal | Verified |
| `Alt+F4` | Close | Verified |
| Arrow keys (up/down) | Navigate bidding | Not yet tested |
| `Enter` | Confirm bid | Not yet tested |
| `Ctrl+O` | Open PBN | Not yet tested |
| `F1` | Help | Not yet tested |

### Config file

`Wbridge5.ini` should be in the same directory as `Wbridge5.exe`.
Path: `C:\Programs\WBridge5\Wbridge5.ini`

### Files

| File | Purpose |
|------|---------|
| `Wbridge5.exe` | Main executable |
| `bridgez.exe` | Online tournament client |
| `unins000.exe` | Uninstaller |
| `wbridge5.chm` / `wbridge5_E.chm` | Help files (French / English) |
| `LinToPBN.dll` | LIN to PBN conversion library |
| `afficheur.exe` | Display utility |

### Known unknowns (needs manual testing)

These require someone to explore the GUI interactively:

1. **Card positions** — What are the screen coordinates of the 13 South cards?
2. **Bidding box** — Is it a Win32 combobox, radio buttons, or a custom UI?
3. **Opponent cards** — Can OCR read the card backs / played cards?
4. **Menu structure** — What items are under File, Options, etc.?
5. **PBN import** — Does Ctrl+O open a standard file dialog?
6. **Stable region** — What area of the window changes during play (for wait_stable)?

### How to discover remaining elements

Run these commands manually in a terminal while WBridge5 is focused:

```powershell
# Get window tree with pywinauto-mcp
curl http://localhost:10789/api/v1/tools/list
```

Or capture the window layout manually:
1. Launch WBridge5
2. Open Snipping Tool (Win+Shift+S)
3. Take a region screenshot of the card area
4. Map coordinates: top-left = (x,y), bottom-right = (x+w, y+h)
