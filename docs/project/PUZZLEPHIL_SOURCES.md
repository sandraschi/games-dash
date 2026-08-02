# Puzzle Sources: puzzlephil and Die Presse

**Timestamp**: 2025-02-08

## Summary

Commercial puzzle supplier [puzzlephil.com](https://puzzlephil.com/en/) provides logic puzzles to newspapers worldwide. Major Austrian newspaper [Die Presse](https://www.diepresse.com/raetsel) uses their puzzles in their digital Rätsel section.

## puzzlephil.com

- **Role**: Commercial supplier of logic puzzles for print and online media
- **Offer**: PDFs for print, full-page layouts, custom HTML5 applets
- **Delivery**: Single PDFs, layouts, or web applets via code snippet
- **Content**: Sudoku, crossword, and innovative new puzzle types
- **Play Online**: [gridgames.app](https://gridgames.app)
- **Customers**: Heute (Austria), Puzzler Media (UK), Die Presse (Austria)

## Die Presse Rätsel

- **Base URL**: https://www.diepresse.com/raetsel
- **Puzzle types**:
  - **Quadrupel**: 4x4 letter grid, place letters to form words
  - **Wortklauberei** (Word Trails): Word search with twist – draw non-crossing paths
  - **Sudoku**: Daily, 3 difficulty levels
  - **Arukone**: Number-link puzzle, connect pairs in under 60 seconds

## Direct Links to AI Games Collection Alignments

| puzzlephil/Die Presse | AI Games Collection Implementation |
|----------------------|--------------------------|
| [Wortklauberei](https://www.diepresse.com/raetsel/wortklauberei) | `games/puzzle-games/word-trails.html` |
| [Arukone](https://www.diepresse.com/raetsel/arukone) | `games/puzzle-games/arukone.html` |
| Sudoku | `games/puzzle-games/sudoku.html` |
| Crossword | `games/puzzle-games/crossword.html` |

## Implementation Notes

- **Word Trails**: Find themed words by drawing non-crossing paths through a 6x6 letter grid. All letters used exactly once.
- **Arukone**: Connect number pairs with orthogonal paths. No crossings, fill entire grid.
- Both ai games collection variants include: difficulty levels, auto-solve, validation, undo.

## Potential Integration

- **puzzlephil** offers HTML5 applets and dynamic loading from their server
- **gridgames.app** may host playable versions
- AI Games Collection uses hand-crafted puzzles (word-trails) and procedural generation (arukone)
- Could explore: daily puzzle sync, format compatibility, or licensing for curated content

## Reference Specs

See [PUZZLE_REFERENCE_SPECS.md](PUZZLE_REFERENCE_SPECS.md) for reverse-engineered canonical rules, validation checklists, and implementation gap analysis from Die Presse / puzzlephil / Wikipedia.

## Crossword Provenance (Verified 2026-07-06)

Crossword word database (`js/word_database.js`) is hand-authored (animals, countries, science terms, etc.) — no scraping from commercial sources. Puzzle fixtures (`data/crossword/`) are custom JSON test data. Safe for public release.
