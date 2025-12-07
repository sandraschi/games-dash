# Crossword Test Fixtures

This directory contains test crossword puzzles in JSON format for the crossword game.

## Files

- **test-easy-5x5.json** - Simple 5x5 puzzle for beginners
- **test-medium-7x7.json** - Medium difficulty 7x7 puzzle
- **test-hard-10x10.json** - Hard 10x10 puzzle with technical terms
- **test-classic-15x15.json** - Classic 15x15 puzzle format
- **test-theme-movies.json** - Themed puzzle about movies

## Format

All puzzles use the following JSON structure:

```json
{
  "title": "Puzzle Name",
  "name": "Puzzle Name",
  "difficulty": "easy|medium|hard",
  "size": 15,
  "grid": [
    ["C", "A", "T", "#", "#"],
    ...
  ],
  "across": {
    "1": {
      "clue": "Clue text",
      "answer": "ANSWER",
      "row": 0,
      "col": 0
    }
  },
  "down": {
    "1": {
      "clue": "Clue text",
      "answer": "ANSWER",
      "row": 0,
      "col": 0
    }
  }
}
```

## Grid Format

- Letters: `"A"` through `"Z"`
- Black squares: `"#"`
- Empty squares: `null` or `""` (will be filled by user)

## Usage

1. Open the crossword game
2. Click "Upload File" button
3. Select one of these JSON files
4. The puzzle will be imported and ready to solve!

## Creating New Puzzles

To create a new test puzzle:

1. Copy an existing file as a template
2. Modify the grid, clues, and answers
3. Ensure all answers match the grid letters
4. Number clues starting from top-left, going across then down
5. Save as a new JSON file

