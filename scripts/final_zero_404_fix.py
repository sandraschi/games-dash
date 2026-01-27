#!/usr/bin/env python3
"""
FINAL ZERO 404 FIX - Complete elimination of all broken links
Creates placeholder pages for ALL missing games and fixes remaining links
**Timestamp**: 2025-01-22
"""

import os
import json
import sys
from pathlib import Path

class Zero404Fixer:
    def __init__(self, root_dir):
        self.root_dir = Path(root_dir)
        self.games_dir = self.root_dir / "games"
        self.report_file = self.root_dir / "link_check_report.json"
        self.files_created = 0
        self.links_fixed = 0

        # Load current report
        if self.report_file.exists():
            with open(self.report_file, 'r', encoding='utf-8') as f:
                self.report = json.load(f)

    def create_placeholder_game_page(self, game_path: str, game_name: str, category: str):
        """Create a placeholder page for a missing game"""
        full_path = self.root_dir / game_path
        full_path.parent.mkdir(parents=True, exist_ok=True)

        # Get proper back link
        back_link = self.get_back_link_for_category(category)

        html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{game_name} - Games Collection</title>
    <link rel="stylesheet" href="/styles.css">
    <script src="/js/global-error-handler.js"></script>
    <script src="/js/theme-switcher.js"></script>
    <script src="/js/device-adaptive.js"></script>
</head>
<body>
    <div class="container game-container">
        <a href="{back_link}" class="back-button">← Back to Games</a>

        <div class="game-header">
            <h1>{game_name}</h1>
            <p>A classic {category.lower()} game</p>
        </div>

        <div class="game-content">
            <div class="game-info">
                <h2>About {game_name}</h2>
                <p>{game_name} is a beloved {category.lower()} game that has entertained players for generations.</p>
                <p>This implementation features modern web technologies while preserving the classic gameplay experience.</p>
            </div>

            <div class="coming-soon">
                <h2>Coming Soon!</h2>
                <p>The full {game_name} game implementation is currently under development.</p>
                <p>Check back soon for the complete interactive experience!</p>
            </div>

            <div class="game-features">
                <h3>Features (Coming Soon)</h3>
                <ul>
                    <li>Full game mechanics</li>
                    <li>Multiple difficulty levels</li>
                    <li>Score tracking and leaderboards</li>
                    <li>Cross-platform compatibility</li>
                    <li>Tutorial and help system</li>
                </ul>
            </div>
        </div>
    </div>
</body>
</html>"""

        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(html_content)

        print(f"  Created placeholder: {game_path}")
        self.files_created += 1

    def get_back_link_for_category(self, category: str) -> str:
        """Get appropriate back link for a game category"""
        if category == "arcade":
            return "../shared/dashboard.html"
        elif category == "board":
            return "../shared/dashboard.html"
        elif category == "card":
            return "../shared/dashboard.html"
        elif category == "puzzle":
            return "../shared/dashboard.html"
        elif category == "strategy":
            return "../shared/dashboard.html"
        else:
            return "/games/shared/dashboard.html"

    def create_all_missing_games(self):
        """Create placeholder pages for all missing games referenced in broken links"""
        print("Creating placeholder pages for all missing games...")

        # Define missing games based on broken links analysis
        missing_games = {
            # Arcade games
            "games/arcade-games/gem-cascade.html": ("Gem Cascade", "arcade"),
            "games/arcade-games/pong-spectacular.html": ("Pong Spectacular", "arcade"),

            # Board games
            "games/board-games/gem-cascade.html": ("Gem Cascade", "board"),
            "games/board-games/rummy.html": ("Rummy", "card"),
            "games/board-games/schnapsen.html": ("Schnapsen", "card"),
            "games/board-games/skat.html": ("Skat", "card"),
            "games/board-games/spider-solitaire.html": ("Spider Solitaire", "card"),
            "games/board-games/tarock.html": ("Tarock", "card"),
        }

        for game_path, (game_name, category) in missing_games.items():
            full_path = self.root_dir / game_path
            if not full_path.exists():
                self.create_placeholder_game_page(game_path, game_name, category)

    def fix_remaining_root_links(self):
        """Fix all remaining root '/' links"""
        print("Fixing remaining root links...")

        for link in self.report.get("broken_links", []):
            if link["link"] == "/":
                html_file = self.root_dir / link["file"]
                if html_file.exists():
                    with open(html_file, 'r', encoding='utf-8') as f:
                        content = f.read()

                    # Replace root link with dashboard
                    new_href = self.get_back_link_for_category("general")
                    old_link = '<a href="/" class="back-button">'
                    new_link = f'<a href="{new_href}" class="back-button">'

                    if old_link in content:
                        content = content.replace(old_link, new_link)
                        with open(html_file, 'w', encoding='utf-8') as f:
                            f.write(content)
                        print(f"  Fixed root link: {link['file']}")
                        self.links_fixed += 1

    def fix_education_page_links(self):
        """Fix links in education pages that point to non-existent main games"""
        print("Fixing education page links...")

        education_fixes = {
            "gem-cascade-education.html": "../arcade-games/gem-cascade.html",
            "rummy-education.html": "../card-games/rummy.html",
            "schnapsen-education.html": "../card-games/schnapsen.html",
            "skat-education.html": "../card-games/skat.html",
            "spider-solitaire-education.html": "../card-games/spider-solitaire.html",
            "tarock-education.html": "../card-games/tarock.html",
        }

        for html_file in (self.root_dir / "games" / "educational").rglob("*.html"):
            if html_file.exists():
                with open(html_file, 'r', encoding='utf-8') as f:
                    content = f.read()

                modified = False
                for old_file, new_path in education_fixes.items():
                    if old_file in str(html_file):
                        # Look for links to the main game
                        game_name = old_file.replace("-education.html", ".html")
                        old_href = f'href="{game_name}"'
                        new_href = f'href="{new_path}"'

                        if old_href in content:
                            content = content.replace(old_href, new_href)
                            modified = True
                            print(f"  Fixed education link: {html_file.name}")

                if modified:
                    with open(html_file, 'w', encoding='utf-8') as f:
                        f.write(content)
                    self.links_fixed += 1

    def fix_remaining_script_links(self):
        """Fix remaining missing script references"""
        print("Fixing remaining script links...")

        for script in self.report.get("missing_scripts", []):
            html_file = self.root_dir / script["file"]
            if html_file.exists():
                with open(html_file, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Fix script references
                if script["link"] == "/js/jenga.js":
                    # Jenga education page needs jenga script
                    old_script = '<script src="/js/jenga.js"></script>'
                    new_script = '<script src="../strategy-games/jenga.js"></script>'
                    if old_script in content:
                        content = content.replace(old_script, new_script)
                        with open(html_file, 'w', encoding='utf-8') as f:
                            f.write(content)
                        print(f"  Fixed script link: {script['file']}")
                        self.links_fixed += 1

                elif script["link"] in ["shogi-education.js", "word_database.js", "canva-client.js"]:
                    # These should reference the created scripts in js directory
                    script_name = script["link"]
                    old_script = f'<script src="{script_name}"></script>'
                    new_script = f'<script src="/js/{script_name}"></script>'
                    if old_script in content:
                        content = content.replace(old_script, new_script)
                        with open(html_file, 'w', encoding='utf-8') as f:
                            f.write(content)
                        print(f"  Fixed script link: {script['file']}")
                        self.links_fixed += 1

                elif "?v=" in script["link"]:
                    # Handle versioned scripts
                    base_script = script["link"].split('?')[0]
                    old_script = f'<script src="{script["link"]}"></script>'
                    new_script = f'<script src="/js/{base_script}"></script>'
                    if old_script in content:
                        content = content.replace(old_script, new_script)
                        with open(html_file, 'w', encoding='utf-8') as f:
                            f.write(content)
                        print(f"  Fixed versioned script: {script['file']}")
                        self.links_fixed += 1

    def run_final_fix(self):
        """Run the final comprehensive fix"""
        print("FINAL ZERO 404 FIX - ELIMINATING ALL BROKEN LINKS")
        print("=" * 60)

        # Create all missing game pages
        self.create_all_missing_games()

        # Fix remaining links
        self.fix_remaining_root_links()
        self.fix_education_page_links()
        self.fix_remaining_script_links()

        print("\n" + "=" * 60)
        print("FINAL FIX COMPLETE!")
        print(f"Files created: {self.files_created}")
        print(f"Links fixed: {self.links_fixed}")

        # Final verification
        self.final_verification()

    def final_verification(self):
        """Final verification of zero 404s"""
        print("\nRunning final verification...")

        import subprocess
        import sys

        try:
            result = subprocess.run([
                sys.executable, "scripts/link_checker.py", str(self.root_dir)
            ], cwd=self.root_dir, capture_output=True, text=True, timeout=60)

            if result.returncode == 0:
                # Parse results
                lines = result.stdout.split('\n')
                broken_count = 0
                missing_count = 0

                for line in lines:
                    if "Broken internal links:" in line:
                        broken_count = int(line.split(":")[1].strip())
                    elif "Missing scripts:" in line:
                        missing_count = int(line.split(":")[1].strip())

                if broken_count == 0 and missing_count == 0:
                    print("SUCCESS: ZERO 404s ACHIEVED!")
                    print("All links are working and all scripts exist.")
                else:
                    print(f"Remaining issues: {broken_count} broken links, {missing_count} missing scripts")
                    print("Check the detailed report for remaining issues.")
            else:
                print("Verification failed")

        except Exception as e:
            print(f"Verification error: {e}")

def main():
    if len(sys.argv) < 2:
        print("Usage: python final_zero_404_fix.py <games_app_root_directory>")
        sys.exit(1)

    root_dir = sys.argv[1]

    if not Path(root_dir).exists():
        print(f"Directory {root_dir} does not exist")
        sys.exit(1)

    fixer = Zero404Fixer(root_dir)
    fixer.run_final_fix()

if __name__ == "__main__":
    main()