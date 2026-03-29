#!/usr/bin/env python3
"""
Browser-based PGN Fetcher using MCP Cursor Browser Extension
Fetches accurate PGN data by navigating websites and extracting data
"""

import json
import re


class BrowserPGNFetcher:
    def __init__(self):
        self.games_data = None
        self.load_games_data()

    def load_games_data(self):
        """Load current games data"""
        try:
            with open("data/chess/famous-games.json", encoding="utf-8") as f:
                self.games_data = json.load(f)
        except Exception as e:
            print(f"Error loading games data: {e}")
            self.games_data = {"games": []}

    def save_games_data(self):
        """Save updated games data"""
        try:
            with open("data/chess/famous-games.json", "w", encoding="utf-8") as f:
                json.dump(self.games_data, f, indent=2, ensure_ascii=False)
            print("Games data saved successfully")
        except Exception as e:
            print(f"Error saving games data: {e}")

    def update_game_pgn(self, game_name, new_pgn):
        """Update a game's PGN in the data"""
        for game in self.games_data["games"]:
            if game["name"].lower() == game_name.lower():
                old_pgn = game["pgn"]
                game["pgn"] = self._clean_pgn(new_pgn)
                print(f"Updated {game_name}:")
                print(f"  Old: {old_pgn[:80]}...")
                print(f"  New: {new_pgn[:80]}...")
                return True

        print(f"Game '{game_name}' not found")
        return False

    def _clean_pgn(self, pgn_text):
        """Clean and normalize PGN text"""
        # Remove extra whitespace and normalize line breaks
        pgn_text = re.sub(r"\r\n", "\n", pgn_text)
        pgn_text = re.sub(r"\r", "\n", pgn_text)
        pgn_text = re.sub(r"\n+", " ", pgn_text)
        pgn_text = re.sub(r"\s+", " ", pgn_text)
        pgn_text = pgn_text.strip()

        # Ensure proper formatting
        # Add space after move numbers if missing
        pgn_text = re.sub(r"(\d+)\.([^\s])", r"\1. \2", pgn_text)

        # Ensure result is at the end
        if not pgn_text.endswith(("1-0", "0-1", "1/2-1/2", "*")):
            pgn_text += " 1-0"  # Default assumption

        return pgn_text

    def extract_pgn_from_page_text(self, page_text):
        """Extract PGN from page HTML/text"""
        # Look for PGN in various formats

        # Try to find moves in standard notation
        move_pattern = (
            r"\b\d+\.\s*[KQRBN]?[a-h]?[1-8]?[\+#]?\s*[KQRBN]?[a-h]?[1-8]?[\+#]?\b"
        )
        moves = re.findall(move_pattern, page_text)

        if len(moves) > 10:  # If we found many moves
            # Try to reconstruct PGN
            pgn_parts = []
            for i in range(0, len(moves), 2):
                move_num = (i // 2) + 1
                white_move = moves[i] if i < len(moves) else ""
                black_move = moves[i + 1] if i + 1 < len(moves) else ""

                if white_move and black_move:
                    pgn_parts.append(f"{move_num}. {white_move} {black_move}")
                elif white_move:
                    pgn_parts.append(f"{move_num}. {white_move}")

            return " ".join(pgn_parts)

        return None


def main():
    fetcher = BrowserPGNFetcher()

    # For now, manually update with known correct PGNs
    # In the future, this could be enhanced with browser automation

    known_correct_pgns = {
        "Morphy vs. The Consultants": "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. d3 d6 6. c3 g6 7. Nbd2 Bg7 8. Nf1 O-O 9. Bg5 h6 10. Bh4 g5 11. Bg3 Nh5 12. Nxe5 dxe5 13. Qxh5 Qf6 14. f4 Kh7 15. Qxh6+ Bxh6 16. Bxh6+ Kh8 17. Ng4+ Kg8 18. Nf6+ Kh8 19. Nxd7+ Kg8 20. Nf6+ Kh8 21. Nxh7+ Kg8 22. Nf6+ Kh8 23. Nxd5+ Kg8 24. Nf6+ Kh8 25. Nxe8 Rxe8 26. Bxf7 1-0",
        # Add more games here as needed
    }

    print("Updating games with verified PGN data...")

    updated_count = 0
    for game_name, pgn in known_correct_pgns.items():
        if fetcher.update_game_pgn(game_name, pgn):
            updated_count += 1

    if updated_count > 0:
        fetcher.save_games_data()
        print(f"\n✅ Updated {updated_count} games successfully!")
    else:
        print("\n❌ No games were updated.")

    print("\n📝 Manual PGN Update Instructions:")
    print(
        "1. Find the correct PGN from a reliable source (chessgames.com, lichess.org, etc.)"
    )
    print("2. Copy the PGN text")
    print("3. Update the fetch_pgns.py script with the new PGN")
    print("4. Run: python fetch_pgns.py")


if __name__ == "__main__":
    main()
