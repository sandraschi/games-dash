#!/usr/bin/env python3
"""
Systematic Link Checker for Games App
Checks all HTML files in the games directory for broken links and missing resources
**Timestamp**: 2025-01-22
"""

import os
import re
import json
from pathlib import Path
from urllib.parse import urlparse, urljoin
from bs4 import BeautifulSoup
import requests
import sys

class LinkChecker:
    def __init__(self, root_dir):
        self.root_dir = Path(root_dir)
        self.games_dir = self.root_dir / "games"
        self.results = {
            "broken_links": [],
            "missing_scripts": [],
            "missing_stylesheets": [],
            "missing_images": [],
            "external_links": [],
            "summary": {}
        }

    def is_file_path(self, url):
        """Check if URL is a file path (not external)"""
        parsed = urlparse(url)
        return not parsed.scheme or parsed.scheme in ['file', '']

    def resolve_path(self, base_file, link_url):
        """Resolve relative path from base file"""
        if link_url == '/':
            # Root URL - handled by web server, not a file path
            return None
        elif link_url.startswith('/'):
            # Root-relative path
            return self.root_dir / link_url.lstrip('/')
        else:
            # Relative to current file
            return Path(base_file).parent / link_url

    def check_file_exists(self, file_path):
        """Check if file exists"""
        if file_path is None:
            # Root URL - assume valid (handled by web server)
            return True
        return file_path.exists() and file_path.is_file()

    def parse_html_file(self, html_file):
        """Parse HTML file and extract all links"""
        try:
            with open(html_file, 'r', encoding='utf-8') as f:
                content = f.read()

            soup = BeautifulSoup(content, 'html.parser')
            base_file = Path(html_file)

            # Check script tags
            for script in soup.find_all('script', src=True):
                src = script['src']
                if self.is_file_path(src):
                    resolved_path = self.resolve_path(base_file, src)
                    if not self.check_file_exists(resolved_path):
                        self.results["missing_scripts"].append({
                            "file": str(html_file.relative_to(self.root_dir)),
                            "link": src,
                            "resolved_path": str(resolved_path.relative_to(self.root_dir)) if resolved_path.exists() else str(resolved_path),
                            "line": content[:content.find(src)].count('\n') + 1
                        })

            # Check link tags (stylesheets)
            for link in soup.find_all('link', href=True):
                href = link['href']
                if self.is_file_path(href) and link.get('rel') == ['stylesheet']:
                    resolved_path = self.resolve_path(base_file, href)
                    if not self.check_file_exists(resolved_path):
                        self.results["missing_stylesheets"].append({
                            "file": str(html_file.relative_to(self.root_dir)),
                            "link": href,
                            "resolved_path": str(resolved_path.relative_to(self.root_dir)) if resolved_path.exists() else str(resolved_path),
                            "line": content[:content.find(href)].count('\n') + 1
                        })

            # Check anchor tags and other links
            for a in soup.find_all('a', href=True):
                href = a['href']
                if href.startswith('#'):
                    continue  # Skip anchor links

                if self.is_file_path(href):
                    resolved_path = self.resolve_path(base_file, href)
                    if not self.check_file_exists(resolved_path):
                        self.results["broken_links"].append({
                            "file": str(html_file.relative_to(self.root_dir)),
                            "link": href,
                            "resolved_path": str(resolved_path.relative_to(self.root_dir)) if resolved_path.exists() else str(resolved_path),
                            "text": a.get_text().strip()[:50],
                            "line": content[:content.find(href)].count('\n') + 1
                        })
                else:
                    # External link - could check if accessible
                    self.results["external_links"].append({
                        "file": str(html_file.relative_to(self.root_dir)),
                        "link": href,
                        "text": a.get_text().strip()[:50]
                    })

            # Check img tags
            for img in soup.find_all('img', src=True):
                src = img['src']
                if self.is_file_path(src):
                    resolved_path = self.resolve_path(base_file, src)
                    if not self.check_file_exists(resolved_path):
                        self.results["missing_images"].append({
                            "file": str(html_file.relative_to(self.root_dir)),
                            "link": src,
                            "resolved_path": str(resolved_path.relative_to(self.root_dir)) if resolved_path.exists() else str(resolved_path),
                            "alt": img.get('alt', ''),
                            "line": content[:content.find(src)].count('\n') + 1
                        })

        except Exception as e:
            print(f"Error parsing {html_file}: {e}")

    def scan_games_directory(self):
        """Scan all HTML files in games directory"""
        html_files = list(self.games_dir.rglob("*.html"))
        print(f"Found {len(html_files)} HTML files to check...")

        for html_file in html_files:
            self.parse_html_file(html_file)

    def generate_report(self):
        """Generate summary report"""
        self.results["summary"] = {
            "total_html_files": len(list(self.games_dir.rglob("*.html"))),
            "broken_links_count": len(self.results["broken_links"]),
            "missing_scripts_count": len(self.results["missing_scripts"]),
            "missing_stylesheets_count": len(self.results["missing_stylesheets"]),
            "missing_images_count": len(self.results["missing_images"]),
            "external_links_count": len(self.results["external_links"])
        }

    def save_report(self, output_file="link_check_report.json"):
        """Save results to JSON file"""
        output_path = self.root_dir / output_file
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(self.results, f, indent=2, ensure_ascii=False)
        print(f"Report saved to: {output_path}")

    def print_summary(self):
        """Print summary to console"""
        summary = self.results["summary"]
        print("\n" + "="*60)
        print("LINK CHECKER SUMMARY")
        print("="*60)
        print(f"Total HTML files scanned: {summary['total_html_files']}")
        print(f"Broken internal links: {summary['broken_links_count']}")
        print(f"Missing scripts: {summary['missing_scripts_count']}")
        print(f"Missing stylesheets: {summary['missing_stylesheets_count']}")
        print(f"Missing images: {summary['missing_images_count']}")
        print(f"External links found: {summary['external_links_count']}")

        if summary['broken_links_count'] > 0:
            print(f"\nBROKEN LINKS ({summary['broken_links_count']}):")
            for link in self.results["broken_links"][:10]:  # Show first 10
                print(f"  {link['file']} -> {link['link']} (line {link['line']})")

        if summary['missing_scripts_count'] > 0:
            print(f"\nMISSING SCRIPTS ({summary['missing_scripts_count']}):")
            for script in self.results["missing_scripts"][:5]:
                print(f"  {script['file']} -> {script['link']}")

        if summary['missing_stylesheets_count'] > 0:
            print(f"\nMISSING STYLESHEETS ({summary['missing_stylesheets_count']}):")
            for css in self.results["missing_stylesheets"][:5]:
                print(f"  {css['file']} -> {css['link']}")

def main():
    if len(sys.argv) < 2:
        print("Usage: python link_checker.py <games_app_root_directory>")
        sys.exit(1)

    root_dir = sys.argv[1]

    if not Path(root_dir).exists():
        print(f"Directory {root_dir} does not exist")
        sys.exit(1)

    checker = LinkChecker(root_dir)
    print(f"Starting link check in: {root_dir}")
    checker.scan_games_directory()
    checker.generate_report()
    checker.print_summary()
    checker.save_report()

if __name__ == "__main__":
    main()