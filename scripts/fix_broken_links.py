#!/usr/bin/env python3
"""
Fix Broken Links in Games App HTML Files
Systematically corrects broken links identified by the link checker
**Timestamp**: 2025-01-22
"""

import os
import json
import re
import sys
from pathlib import Path

class LinkFixer:
    def __init__(self, root_dir, report_file="link_check_report.json"):
        self.root_dir = Path(root_dir)
        self.report_file = self.root_dir / report_file
        self.fixes_applied = 0
        self.load_report()

    def load_report(self):
        """Load the link check report"""
        if not self.report_file.exists():
            print(f"Report file {self.report_file} not found. Run link_checker.py first.")
            return

        with open(self.report_file, 'r', encoding='utf-8') as f:
            self.report = json.load(f)

    def get_relative_path_to_dashboard(self, html_file):
        """Get the correct relative path to dashboard.html from a game file"""
        file_path = Path(html_file)
        games_dir = self.root_dir / "games"

        # Calculate relative path from file to games/shared/dashboard.html
        rel_path = os.path.relpath(games_dir / "shared" / "dashboard.html", file_path.parent)
        return rel_path

    def get_relative_path_to_multiplayer_simple(self, html_file):
        """Get the correct relative path to multiplayer-simple.js from a game file"""
        file_path = Path(html_file)
        games_dir = self.root_dir / "games"

        # Calculate relative path from file to games/multiplayer/multiplayer-simple.js
        rel_path = os.path.relpath(games_dir / "multiplayer" / "multiplayer-simple.js", file_path.parent)
        return rel_path

    def fix_back_to_games_links(self):
        """Fix 'Back to Games' links that point to '/' """
        print("Fixing 'Back to Games' links...")

        for link in self.report.get("broken_links", []):
            if link["link"] == "/" and "Back to Games" in link["text"]:
                html_file = self.root_dir / link["file"]

                if html_file.exists():
                    # Read the file
                    with open(html_file, 'r', encoding='utf-8') as f:
                        content = f.read()

                    # Find and replace the link
                    old_pattern = r'<a href="/" class="back-button">← Back to Games</a>'
                    new_href = self.get_relative_path_to_dashboard(html_file)
                    new_link = f'<a href="{new_href}" class="back-button">← Back to Games</a>'

                    if old_pattern in content:
                        content = content.replace(old_pattern, new_link)
                        with open(html_file, 'w', encoding='utf-8') as f:
                            f.write(content)
                        print(f"  Fixed: {link['file']} -> {new_href}")
                        self.fixes_applied += 1

    def fix_missing_multiplayer_scripts(self):
        """Fix references to multiplayer-simple.js"""
        print("Fixing multiplayer script references...")

        for script in self.report.get("missing_scripts", []):
            if script["link"] == "multiplayer-simple.js":
                html_file = self.root_dir / script["file"]

                if html_file.exists():
                    with open(html_file, 'r', encoding='utf-8') as f:
                        content = f.read()

                    # Find and replace the script reference
                    old_pattern = r'<script src="multiplayer-simple\.js"></script>'
                    new_src = self.get_relative_path_to_multiplayer_simple(html_file)
                    new_script = f'<script src="{new_src}"></script>'

                    if 'multiplayer-simple.js' in content:
                        content = content.replace('multiplayer-simple.js', new_src)
                        with open(html_file, 'w', encoding='utf-8') as f:
                            f.write(content)
                        print(f"  Fixed: {script['file']} -> {new_src}")
                        self.fixes_applied += 1

    def fix_chess_timer_integration(self):
        """Fix references to chess-timer-integration.js"""
        print("Fixing chess timer integration references...")

        for script in self.report.get("missing_scripts", []):
            if script["link"] == "/games/chess-timer-integration.js":
                html_file = self.root_dir / script["file"]

                if html_file.exists():
                    with open(html_file, 'r', encoding='utf-8') as f:
                        content = f.read()

                    # Replace with the correct chess-timer.js path
                    old_pattern = r'<script src="/games/chess-timer-integration\.js"></script>'
                    new_script = '<script src="/js/chess-timer.js"></script>'

                    if old_pattern in content:
                        content = content.replace(old_pattern, new_script)
                        with open(html_file, 'w', encoding='utf-8') as f:
                            f.write(content)
                        print(f"  Fixed: {script['file']} -> /js/chess-timer.js")
                        self.fixes_applied += 1

    def fix_remaining_broken_links(self):
        """Fix remaining broken links from the updated report"""
        print("Fixing remaining broken links...")

        # Load the latest report
        if not self.report_file.exists():
            return

        with open(self.report_file, 'r', encoding='utf-8') as f:
            current_report = json.load(f)

        for link in current_report.get("broken_links", []):
            html_file = self.root_dir / link["file"]
            if not html_file.exists():
                continue

            with open(html_file, 'r', encoding='utf-8') as f:
                content = f.read()

            # Skip if already fixed
            if link["link"] == "/" and "Back to Games" in link["text"]:
                continue

            # Fix various types of broken links
            modified = False

            # Fix root-relative links to education pages
            if link["link"].endswith("-education.html") and not link["link"].startswith("/"):
                # These should be in the educational directory
                if "card-games" in str(html_file):
                    new_link = f"../educational/{link['link']}"
                elif "strategy-games" in str(html_file):
                    new_link = f"../educational/{link['link']}"
                else:
                    continue

                old_href = f'href="{link["link"]}"'
                new_href = f'href="{new_link}"'
                if old_href in content:
                    content = content.replace(old_href, new_href)
                    modified = True
                    print(f"  Fixed: {link['file']} -> {link['link']} to {new_link}")

            # Fix links from educational pages back to main games
            elif link["link"].endswith(".html") and not link["link"].startswith("/") and not link["link"].startswith("."):
                if "educational" in str(html_file):
                    # Links from educational pages to main games
                    if link["link"] in ["dominoes.html", "gem-cascade.html", "hnefatafl.html"]:
                        if "board-games" in link["link"].replace(".html", ""):
                            new_link = f"../board-games/{link['link']}"
                        elif "arcade-games" in link["link"].replace(".html", ""):
                            new_link = f"../arcade-games/{link['link']}"
                        else:
                            new_link = f"../board-games/{link['link']}"  # fallback

                        old_href = f'href="{link["link"]}"'
                        new_href = f'href="{new_link}"'
                        if old_href in content:
                            content = content.replace(old_href, new_href)
                            modified = True
                            print(f"  Fixed: {link['file']} -> {link['link']} to {new_link}")

            # Fix remaining root links that should be back to games
            elif link["link"] == "/":
                new_href = self.get_relative_path_to_dashboard(html_file)
                old_link = '<a href="/" class="back-button">'
                new_link = f'<a href="{new_href}" class="back-button">'
                if old_link in content:
                    content = content.replace(old_link, new_link)
                    modified = True
                    print(f"  Fixed: {link['file']} -> / to {new_href}")

            # Fix dashboard.html references
            elif link["link"] == "dashboard.html":
                new_href = self.get_relative_path_to_dashboard(html_file)
                old_href = 'href="dashboard.html"'
                new_href_attr = f'href="{new_href}"'
                if old_href in content:
                    content = content.replace(old_href, new_href_attr)
                    modified = True
                    print(f"  Fixed: {link['file']} -> dashboard.html to {new_href}")

            if modified:
                with open(html_file, 'w', encoding='utf-8') as f:
                    f.write(content)
                self.fixes_applied += 1

    def fix_remaining_scripts(self):
        """Fix remaining missing scripts"""
        print("Fixing remaining missing scripts...")

        # Load the latest report
        if not self.report_file.exists():
            return

        with open(self.report_file, 'r', encoding='utf-8') as f:
            current_report = json.load(f)

        for script in current_report.get("missing_scripts", []):
            html_file = self.root_dir / script["file"]
            if not html_file.exists():
                continue

            with open(html_file, 'r', encoding='utf-8') as f:
                content = f.read()

            # Fix chess timer integration
            if script["link"] == "/games/chess-timer-integration.js":
                new_src = "/js/chess-timer.js"
                old_script = '<script src="/games/chess-timer-integration.js"></script>'
                new_script = f'<script src="{new_src}"></script>'
                if old_script in content:
                    content = content.replace(old_script, new_script)
                    with open(html_file, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"  Fixed: {script['file']} -> {script['link']} to {new_src}")
                    self.fixes_applied += 1

            # Fix other script references
            elif script["link"] in ["shogi-education.js", "word_database.js"]:
                # These might not exist, skip for now
                continue

            # Fix api-config.js references
            elif script["link"] == "../js/api-config.js":
                new_src = "/js/api-config.js"
                if f'src="{script["link"]}"' in content:
                    content = content.replace(f'src="{script["link"]}"', f'src="{new_src}"')
                    with open(html_file, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"  Fixed: {script['file']} -> {script['link']} to {new_src}")
                    self.fixes_applied += 1

    def fix_game_specific_links(self):
        """Fix other game-specific broken links"""
        print("Fixing game-specific links...")

        # Fix chess 3d and education links
        chess_fixes = [
            ("/games/chess-3d.html", "../board-games/chess-3d.html"),
            ("/games/chess-education.html", "../board-games/chess-education.html")
        ]

        for html_file in (self.root_dir / "games").rglob("*.html"):
            if html_file.name in ["chess.html"]:
                with open(html_file, 'r', encoding='utf-8') as f:
                    content = f.read()

                modified = False
                for old_link, new_link in chess_fixes:
                    if old_link in content:
                        content = content.replace(old_link, new_link)
                        modified = True
                        print(f"  Fixed: {html_file.name} -> {old_link} to {new_link}")

                if modified:
                    with open(html_file, 'w', encoding='utf-8') as f:
                        f.write(content)
                    self.fixes_applied += 1

    def run_all_fixes(self):
        """Run all link fixing operations"""
        print("Starting systematic link fixes...")
        print(f"Working directory: {self.root_dir}")

        self.fix_back_to_games_links()
        self.fix_missing_multiplayer_scripts()
        self.fix_chess_timer_integration()
        self.fix_game_specific_links()

        # Fix remaining issues from updated report
        self.fix_remaining_broken_links()
        self.fix_remaining_scripts()

        print(f"\nCompleted! Applied {self.fixes_applied} fixes.")

    def verify_fixes(self):
        """Run link checker again to verify fixes"""
        print("\nVerifying fixes...")
        import subprocess
        import sys

        try:
            result = subprocess.run([
                sys.executable, "scripts/link_checker.py", str(self.root_dir)
            ], cwd=self.root_dir, capture_output=True, text=True)

            if result.returncode == 0:
                print("Verification complete. Check the updated report.")
            else:
                print("Verification failed:")
                print(result.stderr)
        except Exception as e:
            print(f"Could not run verification: {e}")

def main():
    if len(sys.argv) < 2:
        print("Usage: python fix_broken_links.py <games_app_root_directory>")
        sys.exit(1)

    root_dir = sys.argv[1]

    if not Path(root_dir).exists():
        print(f"Directory {root_dir} does not exist")
        sys.exit(1)

    fixer = LinkFixer(root_dir)
    fixer.run_all_fixes()
    fixer.verify_fixes()

if __name__ == "__main__":
    main()