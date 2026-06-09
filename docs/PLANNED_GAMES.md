# Planned Games & Improvements

Ideas for growing the collection — not commitments, just a curated list of
what would add the most value for the least effort.

---

## Category: Party / Casual (new)

Zero learning curve, pass-the-laptop or phone play. No AI needed — the fun
is in the interaction.

| Game | Type | Why |
|------|------|-----|
| **Codenames** | Word/team | 2+ teams, one clue-giver per round. Perfect party game. |
| **Skribbl.io clone** | Drawing | One draws, others guess. Canvas + socket.io, ~200 lines. |
| **BombParty** | Word | Type words containing a given syllable before timer runs out. |
| **Geoguessr-style** | Location | Show a street view frame, guess where in the world. |
| **Typing race** | Speed | Quick-fire typing contests, 30s rounds. |
| **Duck Game** | Reaction | 2-4 players, same keyboard, press the right key fastest. |

## Category: Unusual Games (lean into the niche)

This repo already has Hanafuda, Schnapsen, Tarock, Hnefatafl, Senet —
lean into the "where else would I find this" angle.

| Game | Why |
|------|-----|
| **Riichi Mahjong** | Full yaku scoring, Japanese rules. Complements the existing Mahjong Solitaire and Japanese learning theme. Abalone is excellent reference for tile rendering. |
| **Chushogi** | 36×36 board, 78 pieces per side. Extremely rare on the web. |
| **Durak** | Russia's most popular card game. Simple rules, AI is straightforward. |
| **Cribbage** | Classic 2-player, pegging board, perfect for the card section. |
| **Mancala variants** | You have one — add Oware, Bao, Kalah for a mini-collection. |
| **Shogi variants** | Mini-shogi (5×5), Chu-shogi (12×12) — leverage existing YaneuraOu engine. |

## Category: Fix WIP Games

The following are listed as "Under Construction" and need finishing:

| Game | Issue |
|------|-------|
| Monopoly | Bank/revenue logic incomplete |
| Catan | Settlement building, robber mechanics |
| Risk | Territory conquest, dice combat |
| Carcassonne | Tile placement, scoring |
| Ticket to Ride | Route building, destination tickets |
| Clue | Deduction logic, weapon/room/suspect tracking |
| Microsoft Jigsaw | Needs rebuild from scratch |
| Mahjong Solitaire | Needs rebuild from scratch |
| 3D Jigsaw Puzzle | Needs rebuild from scratch |

## Category: Architecture / QoL

| Idea | Impact |
|------|--------|
| **Mobile-friendly layout** | Many games work on iPad already, but the dashboard grid is desktop-only. Responsive CSS would unlock tablet play. |
| **Gamepad support** | You have `js/gamepad-utils.js` — wire it into arcade games (Pac-Man, Frogger, etc.) |
| **One-click AI engine install** | `.\start.ps1` already launches engines. A `winget`-style install for Stockfish/KataGo/YaneuraOu would help. |
| **Sound toggle persist** | Game sound state resets on page reload — localStorage would fix. |
| **Search across games** | The dashboard has a search box but it's client-side only — a `/api/games/search` endpoint could index by tag/category. |
| **Play history** | Track which games you've played recently, show them at the top. |

## Category: Current Strengths (don't break these)

- Real AI engines (Stockfish 16, KataGo, YaneuraOu) — JS engine-free
- Rare games (Hanafuda, Schnapsen, Tarock, Hnefatafl, Senet, Ur)
- Japanese learning suite is genuinely useful
- 3D Chess and TDC (Tri-Dimensional Chess) are visually impressive
- Works fully offline once started
- PWA support for mobile/"add to home screen"
