# Puzzle Reference Specs (Die Presse / puzzlephil)

**Source**: Reverse-engineered from Die Presse Rätsel, puzzlephil, Wikipedia, Flow Free.  
**Timestamp**: 2025-02-08

---

## Wortklauberei (Word Trails)

### canonical rules (Die Presse)

| Rule | Spec |
|------|------|
| **Grid** | 6x6 letters |
| **Theme** | Daily topic (e.g. animals, garden, music) |
| **Words** | 6 themed words, one per row in canonical snake layout |
| **Letter adjacency** | 8 directions: orthogonal + diagonal |
| **Direction change** | Words may change direction mid-path (snake, zigzag) |
| **Self-crossing** | A single word MAY cross itself (e.g. loop) |
| **Word overlap** | Words MUST NOT overlap – paths cannot cross each other |
| **Letter usage** | Every cell used exactly once across all words |
| **Input** | Click/drag to trace path; submit when path forms a valid word |

### canonical layout (Die Presse)

- Row 0: L→R, Row 1: R→L, Row 2: L→R, Row 3: R→L, Row 4: L→R, Row 5: R→L (snake fill)
- One word per row; letters placed along the snake path
- Filler letters in theme-appropriate positions

### solving tips (from Die Presse)

- Scan for noticeable word fragments
- Target rare letters (Q, X, Y, C, V, J) – fewer valid words
- Corners have only 3 neighbors – fewer combinations
- German: Q almost always followed by U
- Vowels: almost every German word has at least one vowel

### validation checklist (games app)

- [ ] Path uses only adjacent cells (8-direction)
- [ ] Path does not overlap another word’s path
- [ ] Path spells a word from the target list
- [ ] Submit clears the path and marks word as found
- [ ] Completion: all 6 words found, all 36 cells used

---

## Arukone (Number Link)

### canonical rules (Wikipedia, Nikoli, Flow Free)

| Rule | Spec |
|------|------|
| **Grid** | N×N (e.g. 6×6, 8×8, 10×10) |
| **Endpoints** | Numbered pairs (1–1, 2–2, …); half the cells are endpoints |
| **Paths** | One continuous line per pair |
| **Movement** | Orthogonal only (no diagonals) |
| **Crossing** | Paths cannot cross |
| **Overlap** | No cell may have more than one path segment |
| **Coverage** | All cells must be filled (numbers or path segments) |
| **Numbers** | Only at path endpoints, never in the middle |
| **U-turns** | Some variants forbid 2×2 blocks (no trivial U-turns) |

### Die Presse variant

- “Simple but tricky”
- Goal: finish in under 60 seconds
- Logic + spatial reasoning

### input mechanics (reference implementations)

- **Click-drag**: Click number, drag to matching number
- **Tap-tap**: Tap start, tap end – path auto-drawn if unique
- **Segment draw**: Draw segment by segment, orthogonal only
- **Right-click**: Erase segment or path

### validation checklist (games app)

- [ ] Each number pair connected by single continuous path
- [ ] Paths orthogonal only
- [ ] No path crossings
- [ ] Every cell either endpoint or path segment
- [ ] Solver produces valid solution for generated puzzles

---

## puzzlephil content model

- **Delivery**: PDF (print), HTML5 applets (web)
- **Integration**: Code snippet; content from puzzlephil server or self-hosted
- **Quality**: Difficulty-tested, themed, daily refresh
- **Customization**: Colors, fonts, spacing per publication

---

## Flow Free (Arukone-like app reference)

- Grid of colored dots; connect matching colors
- Orthogonal paths only
- All cells filled
- Popular mobile implementation; good UX reference

---

## Implementation gaps (games app vs spec)

### Word Trails

| Gap | Description |
|-----|-------------|
| Self-crossing | Spec allows word to cross itself; app may reject valid paths |
| Path validation | Verify overlap detection uses shared cells, not segment crossing |
| Submit flow | Ensure submit works on valid path; no double-count |
| Theme/word list | Must match 6 words, 36 letters, one snake path |

### Arukone

| Gap | Description |
|-----|-------------|
| Puzzle generation | Must produce puzzles with unique solution |
| Path storage | `paths` Map structure – verify value type (array vs Set) |
| Solver | ArukoneSolver backtracking – check connectivity and coverage |
| Mouse handling | Path extension only to adjacent orthogonal cells |
