# Bridge AI — Research

## WBridge5

**Author:** Yves Costel (France)  
**Version:** 5.12 (last updated 2014-02-04)  
**Price:** Free (gratuit) — no license required  
**Download:** `Wbridge5_setup.exe` (1.3 MB)  
**OS:** Windows 2000/XP/Vista/7/8 (Wine possible for Linux)  
**World Champion:** 2005, 2007, 2008, 2016

### Capabilities

| Feature | Support |
|---------|---------|
| PBN import/export | Yes |
| Deal generator | Yes (configurable specs) |
| Custom deals | Yes (PBN file load) |
| Double-dummy analysis | Yes (Bo Haglund DLL) |
| Keyboard navigation | Yes (since v4.5) |
| Bidding systems | WBridge5 default, SEF (French), SAYC (American Standard) |
| Hand evaluation | Kaplan-Rubens |
| Duplicate mode | Yes |
| Offline play | Yes — primary mode, no internet needed |
| CLI / headless | No |
| API | No |

### GUI Profile

- Standard Win32 desktop app
- 800x600 resolution
- Menu bar, toolbar, card table area, bidding box
- Config file: `Wbridge5.ini` in same directory as exe
- Single-click for all commands

### Automation Feasibility

With pywinauto-mcp:
- Window discovery: `find` or `list` via window title "WBridge5"
- Re-deal: keystroke `F5` via `automation_keyboard`
- Card play: `click` on card coordinates (map card positions from window snapshot)
- Bidding: keyboard arrows + enter, or click on bid buttons
- PBN import: menu navigation or ctrl+O, file dialog via `automation_dialog`
- State reading: OCR via `automation_visual(extract_text)` on bidding display + card areas

### Limitations

- No Linux native version (Wine may work)
- No CLI or API — GUI-only
- Last updated 2014 — no modern OS guarantees
- 800x600 fixed resolution — small by modern standards

### Alternative Programs Considered

| Program | Verdict |
|---------|---------|
| **Jack** | Commercial, expensive, no automation surface |
| **Bridge Baron** | Commercial, Windows only |
| **GIB** | Out of print |
| **Q-Plus Bridge** | Discontinued |
| **dds (Bo Haglund)** | Double-dummy solver only, no bidding/play |
| **BNB (Ben's Bridge)** | FOSS but weak play |
