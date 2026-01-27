#!/usr/bin/env python3
"""
Final Cleanup - Fix Last Remaining Issues
**Timestamp**: 2025-01-22
"""

import os
import json
from pathlib import Path

class FinalCleanup:
    def __init__(self, root_dir):
        self.root_dir = Path(root_dir)
        self.games_dir = self.root_dir / "games"

    def fix_remaining_links(self):
        """Fix the last remaining broken links"""
        print("Fixing remaining broken links...")

        # Fix kanji table internal link
        self.fix_kanji_table_link()

        # Fix crossword index link
        self.fix_crossword_index_link()

        # Fix minesweeper education link
        self.fix_minesweeper_education_link()

        # Fix wordsearch education link
        self.fix_wordsearch_education_link()

        # Fix shared file root links
        self.fix_shared_root_links()

        # Fix shared file internal links
        self.fix_shared_internal_links()

    def fix_kanji_table_link(self):
        """Fix kanji table internal link"""
        file_path = "games/japan/kanji-table.html"
        full_path = self.root_dir / file_path

        if full_path.exists():
            with open(full_path, 'r', encoding='utf-8') as f:
                content = f.read()

            # Fix the kanji-3d-visualizer link - this file doesn't exist, so remove or comment it
            content = content.replace(
                'kanji-3d-visualizer.html',
                '#kanji-3d-visualizer.html'
            )

            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(content)

            print(f"  Fixed kanji table internal link in {file_path}")

    def fix_crossword_index_link(self):
        """Fix crossword index link"""
        file_path = "games/puzzle-games/crossword.html"
        full_path = self.root_dir / file_path

        if full_path.exists():
            with open(full_path, 'r', encoding='utf-8') as f:
                content = f.read()

            # Fix index link to point to dashboard
            content = content.replace(
                '../index.html',
                '../shared/dashboard.html'
            )

            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(content)

            print(f"  Fixed crossword index link in {file_path}")

    def fix_minesweeper_education_link(self):
        """Fix minesweeper education link"""
        file_path = "games/puzzle-games/minesweeper.html"
        full_path = self.root_dir / file_path

        if full_path.exists():
            with open(full_path, 'r', encoding='utf-8') as f:
                content = f.read()

            # Fix education link
            content = content.replace(
                'minesweeper-education.html',
                '../educational/minesweeper-education.html'
            )

            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(content)

            print(f"  Fixed minesweeper education link in {file_path}")

    def fix_wordsearch_education_link(self):
        """Fix wordsearch education link"""
        file_path = "games/puzzle-games/wordsearch.html"
        full_path = self.root_dir / file_path

        if full_path.exists():
            with open(full_path, 'r', encoding='utf-8') as f:
                content = f.read()

            # Fix education link
            content = content.replace(
                'wordsearch-education.html',
                '../educational/wordsearch-education.html'
            )

            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(content)

            print(f"  Fixed wordsearch education link in {file_path}")

    def fix_shared_root_links(self):
        """Fix root links in shared files"""
        shared_files = [
            "games/shared/canva-demo.html",
            "games/shared/debug.html",
            "games/shared/help.html"
        ]

        for file_path in shared_files:
            full_path = self.root_dir / file_path
            if full_path.exists():
                with open(full_path, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Replace root links
                content = content.replace('href="/', 'href="dashboard.html')

                with open(full_path, 'w', encoding='utf-8') as f:
                    f.write(content)

                print(f"  Fixed root link in {file_path}")

    def fix_shared_internal_links(self):
        """Fix internal links in shared files"""
        # Fix dictionary links
        dict_path = "games/shared/dictionary.html"
        full_path = self.root_dir / dict_path

        if full_path.exists():
            with open(full_path, 'r', encoding='utf-8') as f:
                content = f.read()

            # Fix kanji table link
            content = content.replace(
                'kanji-table.html',
                '../japan/kanji-table.html'
            )

            # Fix vocabulary link
            content = content.replace(
                'vocabulary.html',
                '../educational/vocabulary.html'
            )

            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(content)

            print(f"  Fixed dictionary links in {dict_path}")

        # Fix debug chess link
        debug_path = "games/shared/debug.html"
        full_path = self.root_dir / debug_path

        if full_path.exists():
            with open(full_path, 'r', encoding='utf-8') as f:
                content = f.read()

            # Fix chess link
            content = content.replace(
                'chess.html',
                '../board-games/chess.html'
            )

            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(content)

            print(f"  Fixed debug chess link in {debug_path}")

    def create_missing_kanji_script(self):
        """Create the missing kanji-table.js script"""
        print("Creating missing kanji-table.js script...")

        content = '''/**
 * Kanji Table Management Script
 * Handles kanji learning and table interactions
 * **Timestamp**: 2025-01-22
 */

class KanjiTableManager {
    constructor() {
        this.currentGrade = 1;
        this.kanjiData = {};
        this.filteredKanji = [];
        this.currentPage = 0;
        this.itemsPerPage = 50;
        this.searchTerm = '';
        this.gradeFilter = 'all';
        this.jlptFilter = 'all';

        this.init();
    }

    init() {
        console.log('[KANJI TABLE] Initializing kanji table manager');
        this.loadKanjiData();
        this.setupEventListeners();
        this.renderKanjiTable();
    }

    loadKanjiData() {
        // Load kanji data from embedded data or API
        // For now, create sample data
        this.kanjiData = {
            grade1: [
                { character: '一', reading: 'いち', meaning: 'one', jlpt: 'N5' },
                { character: '二', reading: 'に', meaning: 'two', jlpt: 'N5' },
                { character: '三', reading: 'さん', meaning: 'three', jlpt: 'N5' },
                { character: '四', reading: 'よん', meaning: 'four', jlpt: 'N5' },
                { character: '五', reading: 'ご', meaning: 'five', jlpt: 'N5' },
                { character: '六', reading: 'ろく', meaning: 'six', jlpt: 'N5' },
                { character: '七', reading: 'なな', meaning: 'seven', jlpt: 'N5' },
                { character: '八', reading: 'はち', meaning: 'eight', jlpt: 'N5' },
                { character: '九', reading: 'きゅう', meaning: 'nine', jlpt: 'N5' },
                { character: '十', reading: 'じゅう', meaning: 'ten', jlpt: 'N5' }
            ],
            grade2: [
                { character: '日', reading: 'ひ', meaning: 'sun, day', jlpt: 'N5' },
                { character: '月', reading: 'つき', meaning: 'moon, month', jlpt: 'N5' },
                { character: '火', reading: 'ひ', meaning: 'fire', jlpt: 'N5' },
                { character: '水', reading: 'みず', meaning: 'water', jlpt: 'N5' },
                { character: '木', reading: 'き', meaning: 'tree, wood', jlpt: 'N5' },
                { character: '金', reading: 'きん', meaning: 'gold, money', jlpt: 'N5' },
                { character: '土', reading: 'つち', meaning: 'soil, earth', jlpt: 'N5' }
            ]
        };

        this.updateFilteredKanji();
    }

    setupEventListeners() {
        // Grade filter
        const gradeSelect = document.getElementById('grade-filter');
        if (gradeSelect) {
            gradeSelect.addEventListener('change', (e) => {
                this.gradeFilter = e.target.value;
                this.updateFilteredKanji();
                this.renderKanjiTable();
            });
        }

        // JLPT filter
        const jlptSelect = document.getElementById('jlpt-filter');
        if (jlptSelect) {
            jlptSelect.addEventListener('change', (e) => {
                this.jlptFilter = e.target.value;
                this.updateFilteredKanji();
                this.renderKanjiTable();
            });
        }

        // Search
        const searchInput = document.getElementById('kanji-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value.toLowerCase();
                this.updateFilteredKanji();
                this.renderKanjiTable();
            });
        }

        // Pagination
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('page-btn')) {
                const page = parseInt(e.target.dataset.page);
                if (!isNaN(page)) {
                    this.currentPage = page;
                    this.renderKanjiTable();
                }
            }
        });
    }

    updateFilteredKanji() {
        let allKanji = [];

        // Collect all kanji from all grades
        for (const grade in this.kanjiData) {
            allKanji = allKanji.concat(this.kanjiData[grade].map(k => ({ ...k, grade: grade.replace('grade', '') })));
        }

        // Apply filters
        this.filteredKanji = allKanji.filter(kanji => {
            // Grade filter
            if (this.gradeFilter !== 'all' && kanji.grade !== this.gradeFilter) {
                return false;
            }

            // JLPT filter
            if (this.jlptFilter !== 'all' && kanji.jlpt !== this.jlptFilter) {
                return false;
            }

            // Search filter
            if (this.searchTerm) {
                const searchLower = this.searchTerm.toLowerCase();
                return kanji.character.includes(searchLower) ||
                       kanji.reading.includes(searchLower) ||
                       kanji.meaning.toLowerCase().includes(searchLower);
            }

            return true;
        });
    }

    renderKanjiTable() {
        const container = document.getElementById('kanji-table-container');
        if (!container) return;

        const startIndex = this.currentPage * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageKanji = this.filteredKanji.slice(startIndex, endIndex);

        let html = `
            <div class="kanji-table-header">
                <div class="results-info">
                    Showing ${startIndex + 1}-${Math.min(endIndex, this.filteredKanji.length)} of ${this.filteredKanji.length} kanji
                </div>
                ${this.renderPagination()}
            </div>

            <div class="kanji-grid">
        `;

        pageKanji.forEach(kanji => {
            html += `
                <div class="kanji-card" data-character="${kanji.character}">
                    <div class="kanji-character">${kanji.character}</div>
                    <div class="kanji-details">
                        <div class="kanji-reading">${kanji.reading}</div>
                        <div class="kanji-meaning">${kanji.meaning}</div>
                        <div class="kanji-meta">
                            <span class="kanji-grade">Grade ${kanji.grade}</span>
                            <span class="kanji-jlpt">${kanji.jlpt}</span>
                        </div>
                    </div>
                </div>
            `;
        });

        html += `
            </div>
            ${this.renderPagination()}
        `;

        container.innerHTML = html;

        // Add click handlers for kanji cards
        document.querySelectorAll('.kanji-card').forEach(card => {
            card.addEventListener('click', () => this.showKanjiDetails(card.dataset.character));
        });
    }

    renderPagination() {
        const totalPages = Math.ceil(this.filteredKanji.length / this.itemsPerPage);
        if (totalPages <= 1) return '';

        let html = '<div class="pagination">';

        // Previous button
        if (this.currentPage > 0) {
            html += `<button class="page-btn" data-page="${this.currentPage - 1}">« Previous</button>`;
        }

        // Page numbers
        const startPage = Math.max(0, this.currentPage - 2);
        const endPage = Math.min(totalPages - 1, this.currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            const activeClass = i === this.currentPage ? ' active' : '';
            html += `<button class="page-btn${activeClass}" data-page="${i}">${i + 1}</button>`;
        }

        // Next button
        if (this.currentPage < totalPages - 1) {
            html += `<button class="page-btn" data-page="${this.currentPage + 1}">Next »</button>`;
        }

        html += '</div>';
        return html;
    }

    showKanjiDetails(character) {
        const kanji = this.filteredKanji.find(k => k.character === character);
        if (!kanji) return;

        const modal = document.createElement('div');
        modal.className = 'kanji-modal';
        modal.innerHTML = `
            <div class="kanji-modal-content">
                <div class="kanji-modal-header">
                    <h2>${kanji.character}</h2>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="kanji-modal-body">
                    <div class="kanji-large">${kanji.character}</div>
                    <div class="kanji-info">
                        <div class="info-row">
                            <strong>Reading:</strong> ${kanji.reading}
                        </div>
                        <div class="info-row">
                            <strong>Meaning:</strong> ${kanji.meaning}
                        </div>
                        <div class="info-row">
                            <strong>Grade:</strong> ${kanji.grade}
                        </div>
                        <div class="info-row">
                            <strong>JLPT:</strong> ${kanji.jlpt}
                        </div>
                    </div>
                    <div class="kanji-actions">
                        <button class="action-btn" onclick="window.kanjiTableManager.practiceKanji('${kanji.character}')">
                            Practice Writing
                        </button>
                        <button class="action-btn" onclick="window.kanjiTableManager.addToStudy('${kanji.character}')">
                            Add to Study List
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal handlers
        modal.querySelector('.close-btn').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    practiceKanji(character) {
        // Open practice interface
        console.log(`[KANJI TABLE] Starting practice for ${character}`);
        // This would open a writing practice interface
    }

    addToStudy(character) {
        // Add to study list
        const studyList = JSON.parse(localStorage.getItem('kanjiStudyList') || '[]');
        if (!studyList.includes(character)) {
            studyList.push(character);
            localStorage.setItem('kanjiStudyList', JSON.stringify(studyList));
            console.log(`[KANJI TABLE] Added ${character} to study list`);
        }
    }

    getStudyList() {
        return JSON.parse(localStorage.getItem('kanjiStudyList') || '[]');
    }

    clearStudyList() {
        localStorage.removeItem('kanjiStudyList');
        console.log('[KANJI TABLE] Study list cleared');
    }
}

// CSS for kanji table
const kanjiTableStyles = document.createElement('style');
kanjiTableStyles.textContent = `
    .kanji-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 15px;
        margin: 20px 0;
    }

    .kanji-card {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        padding: 15px;
        cursor: pointer;
        transition: all 0.3s ease;
        border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .kanji-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        background: rgba(255, 255, 255, 0.15);
    }

    .kanji-character {
        font-size: 3em;
        text-align: center;
        margin-bottom: 10px;
        color: gold;
    }

    .kanji-details {
        text-align: center;
    }

    .kanji-reading {
        font-size: 1.1em;
        color: #FFD700;
        margin-bottom: 5px;
    }

    .kanji-meaning {
        font-size: 0.9em;
        color: rgba(255, 255, 255, 0.8);
        margin-bottom: 10px;
    }

    .kanji-meta {
        display: flex;
        justify-content: space-between;
        font-size: 0.8em;
        color: rgba(255, 255, 255, 0.6);
    }

    .pagination {
        display: flex;
        justify-content: center;
        gap: 5px;
        margin: 20px 0;
        flex-wrap: wrap;
    }

    .page-btn {
        padding: 8px 12px;
        background: rgba(255, 255, 255, 0.2);
        border: none;
        border-radius: 5px;
        cursor: pointer;
        color: white;
    }

    .page-btn:hover, .page-btn.active {
        background: rgba(255, 215, 0, 0.8);
        color: black;
    }

    .kanji-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .kanji-modal-content {
        background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
        border-radius: 15px;
        padding: 30px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
    }

    .kanji-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }

    .kanji-modal-header h2 {
        color: gold;
        margin: 0;
    }

    .close-btn {
        background: none;
        border: none;
        color: white;
        font-size: 2em;
        cursor: pointer;
        padding: 0;
    }

    .kanji-large {
        font-size: 6em;
        text-align: center;
        color: gold;
        margin: 20px 0;
    }

    .kanji-info {
        margin: 20px 0;
    }

    .info-row {
        margin-bottom: 10px;
        padding: 8px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 5px;
    }

    .kanji-actions {
        display: flex;
        gap: 10px;
        justify-content: center;
        margin-top: 20px;
    }

    .action-btn {
        padding: 10px 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: bold;
    }

    .action-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    }

    .results-info {
        text-align: center;
        color: rgba(255, 255, 255, 0.8);
        margin-bottom: 10px;
    }
`;
document.head.appendChild(kanjiTableStyles);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.kanjiTableManager = new KanjiTableManager();
    });
} else {
    window.kanjiTableManager = new KanjiTableManager();
}
'''
        self.create_file("js/kanji-table.js", content)

    def create_file(self, file_path, content):
        """Create a file with the given content"""
        full_path = self.root_dir / file_path
        full_path.parent.mkdir(parents=True, exist_ok=True)

        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(content)

        print(f"  Created file: {file_path}")

    def run(self):
        """Run the final cleanup"""
        print("FINAL CLEANUP - Achieving ZERO 404s")
        print("=" * 50)

        self.fix_remaining_links()
        self.create_missing_kanji_script()

        print("\nFinal verification...")
        # Run link checker to verify
        import subprocess
        import sys

        try:
            result = subprocess.run([
                sys.executable, "scripts/link_checker.py", str(self.root_dir)
            ], cwd=self.root_dir, capture_output=True, text=True, timeout=60)

            if result.returncode == 0:
                lines = result.stdout.split('\n')
                broken_count = 0
                missing_count = 0

                for line in lines:
                    if "Broken internal links:" in line:
                        broken_count = int(line.split(":")[1].strip())
                    elif "Missing scripts:" in line:
                        missing_count = int(line.split(":")[1].strip())

                print("\nRESULTS:")
                print(f"Broken links: {broken_count}")
                print(f"Missing scripts: {missing_count}")

                if broken_count == 0 and missing_count == 0:
                    print("SUCCESS: ZERO 404s ACHIEVED!")
                    print("All links are working and all scripts exist.")
                else:
                    print(f"Remaining issues: {broken_count} broken links, {missing_count} missing scripts")
            else:
                print("Verification failed")

        except Exception as e:
            print(f"Verification error: {e}")

def main():
    root_dir = "."
    cleanup = FinalCleanup(root_dir)
    cleanup.run()

if __name__ == "__main__":
    main()