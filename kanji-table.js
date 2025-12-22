// Kanji Table - Complete Kanji Reference Database
// Advanced filtering, sorting, search, and grid functionality

let kanjiTable;
let allKanjiData = [];
let filteredData = [];
let currentViewMode = 'table';
let currentGridPage = 1;
const gridItemsPerPage = 24;
let studyMode = false;
let currentWriter = null;

// Favorites system
const API_BASE_URL = 'http://localhost:5003/api';
let favorites = new Set();
function loadFavorites() {
    const saved = localStorage.getItem('kanji-favorites');
    if (saved) {
        try {
            favorites = new Set(JSON.parse(saved));
        } catch (e) {
            console.error('Failed to load favorites:', e);
            favorites = new Set();
        }
    }
}

function saveFavorites() {
    localStorage.setItem('kanji-favorites', JSON.stringify([...favorites]));
}

function toggleFavorite(kanji, event) {
    if (event) event.stopPropagation();

    if (favorites.has(kanji)) {
        favorites.delete(kanji);
    } else {
        favorites.add(kanji);
    }
    saveFavorites();

    // Update UI
    updateGridDisplay();
    if (kanjiTable) {
        // Redraw table to update star icons
        kanjiTable.rows().invalidate().draw(false);
    }

    // Update modal if open
    const modalKanjiElement = document.getElementById('modalKanji');
    if (modalKanjiElement && modalKanjiElement.innerText === kanji) {
        updateModalFavoriteIcon(kanji);
    }
}

function isFavorite(kanji) {
    return favorites.has(kanji);
}

function updateModalFavoriteIcon(kanji) {
    const icon = document.getElementById('modalFavoriteIcon');
    if (icon) {
        if (isFavorite(kanji)) {
            icon.className = 'fa-solid fa-star';
            icon.style.color = '#FFD700';
        } else {
            icon.className = 'fa-regular fa-star';
            icon.style.color = 'inherit';
        }
    }
}

function toggleFavoriteFromModal() {
    const kanji = document.getElementById('modalKanji').innerText;
    toggleFavorite(kanji);
}

// Initialize the kanji table
async function initializeKanjiTable() {
    showLoading(true);

    try {
        // Load kanji data from API
        await loadKanjiData();

        // Initialize DataTables
        initializeDataTable();

        // Setup filters
        setupFilters();

        // Update stats
        updateStats();

        // Initialize grid view
        initializeGridView();

    } catch (error) {
        console.error('Failed to initialize kanji table:', error);
        showError('Failed to load kanji database. Please try again later.');
    } finally {
        showLoading(false);
    }
}

// Set view mode (table or grid)
function setViewMode(mode) {
    currentViewMode = mode;

    // Update button states
    document.querySelectorAll('.view-toggle-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[onclick="setViewMode('${mode}')"]`).classList.add('active');

    // Show/hide containers
    document.getElementById('tableView').classList.toggle('active', mode === 'table');
    document.getElementById('gridView').classList.toggle('active', mode === 'grid');

    // Update display when switching to grid
    if (mode === 'grid') {
        updateGridDisplay();
    }
}

// Initialize grid view
function initializeGridView() {
    updateGridDisplay();
}

// Update grid display
function updateGridDisplay() {
    const gridContainer = document.getElementById('kanjiGrid');
    const startIndex = (currentGridPage - 1) * gridItemsPerPage;
    const endIndex = startIndex + gridItemsPerPage;
    const pageData = filteredData.slice(startIndex, endIndex);

    gridContainer.innerHTML = '';

    pageData.forEach(kanji => {
        const gridItem = createGridItem(kanji);
        gridContainer.appendChild(gridItem);
    });

    updateGridPagination();
}

// Create grid item element
function createGridItem(kanji) {
    const item = document.createElement('div');
    item.className = 'kanji-grid-item';

    // JLPT badge class
    const jlptClass = kanji.jlpt ? `jlpt-${kanji.jlpt}` : '';
    const starIcon = isFavorite(kanji.kanji) ? 'fa-solid' : 'fa-regular';

    // Meanings (shortened)
    const meanings = Array.isArray(kanji.meanings) ? kanji.meanings.slice(0, 2).join(', ') : kanji.meanings;

    item.innerHTML = `
        <i class="${starIcon} fa-star favorite-star grid-favorite-star" onclick="toggleFavorite('${kanji.kanji}', event)"></i>
        <div class="grid-kanji-char" onclick="showKanjiDetail('${kanji.kanji}')">${kanji.kanji}</div>
        <div class="grid-kanji-info">Grade ${kanji.grade || 'N/A'} • ${kanji.strokes || 'N/A'} strokes</div>
        <div class="grid-kanji-meanings" title="${meanings}">${(studyMode && !isFavorite(row?.kanji || kanji.kanji)) ? '???' : meanings}</div>
        ${kanji.jlpt ? `<span class="jlpt-badge grid-jlpt-badge ${jlptClass}">${kanji.jlpt}</span>` : ''}
    `;

    return item;
}

// Update grid pagination
function updateGridPagination() {
    const totalPages = Math.ceil(filteredData.length / gridItemsPerPage);
    const prevBtn = document.getElementById('gridPrevBtn');
    const nextBtn = document.getElementById('gridNextBtn');
    const pageInfo = document.getElementById('gridPageInfo');

    prevBtn.disabled = currentGridPage <= 1;
    nextBtn.disabled = currentGridPage >= totalPages;

    pageInfo.textContent = `Page ${currentGridPage} of ${totalPages}`;
}

// Change grid page
function changeGridPage(delta) {
    const totalPages = Math.ceil(filteredData.length / gridItemsPerPage);
    const newPage = currentGridPage + delta;

    if (newPage >= 1 && newPage <= totalPages) {
        currentGridPage = newPage;
        updateGridDisplay();
    }
}

// Load kanji data from API
async function loadKanjiData() {
    try {
        const response = await fetch(`${API_BASE_URL}/kanji/all`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.success) {
            allKanjiData = data.kanji;
            filteredData = [...allKanjiData];
            console.log(`Loaded ${allKanjiData.length} kanji from database`);
        } else {
            throw new Error(data.error || 'Failed to load kanji data');
        }
    } catch (error) {
        console.error('API call failed, using fallback data:', error);
        // Use fallback data if API fails
        allKanjiData = getFallbackKanjiData();
        filteredData = [...allKanjiData];
    }
}

// Fallback kanji data for demo purposes
function getFallbackKanjiData() {
    return [
        {
            kanji: '日',
            onyomi: ['ニチ', 'ジツ'],
            kunyomi: ['ひ', '-び', '-か'],
            meanings: ['day', 'sun', 'Japan', 'counter for days'],
            jlpt: 'N5',
            grade: '1',
            strokes: 4,
            categories: ['time', 'nature'],
            frequency: 1,
            radical: '日'
        },
        {
            kanji: '一',
            onyomi: ['イチ'],
            kunyomi: ['ひと-', 'ひと.つ'],
            meanings: ['one', 'single', 'first'],
            jlpt: 'N5',
            grade: '1',
            strokes: 1,
            categories: ['number'],
            frequency: 2,
            radical: '一'
        },
        {
            kanji: '人',
            onyomi: ['ジン', 'ニン'],
            kunyomi: ['ひと', '-り', '-と'],
            meanings: ['person', 'human', 'people'],
            jlpt: 'N5',
            grade: '1',
            strokes: 2,
            categories: ['body'],
            frequency: 3,
            radical: '人'
        },
        {
            kanji: '大',
            onyomi: ['ダイ', 'タイ'],
            kunyomi: ['おお-', 'おお.きい', '-おお.いに'],
            meanings: ['large', 'big', 'great', 'major'],
            jlpt: 'N5',
            grade: '1',
            strokes: 3,
            categories: ['abstract'],
            frequency: 4,
            radical: '大'
        },
        {
            kanji: '学',
            onyomi: ['ガク'],
            kunyomi: ['まな.ぶ'],
            meanings: ['study', 'learning', 'science'],
            jlpt: 'N5',
            grade: '1',
            strokes: 8,
            categories: ['action'],
            frequency: 5,
            radical: '子'
        },
        {
            kanji: '山',
            onyomi: ['サン', 'セン'],
            kunyomi: ['やま'],
            meanings: ['mountain', 'hill'],
            jlpt: 'N5',
            grade: '1',
            strokes: 3,
            categories: ['place', 'nature'],
            frequency: 6,
            radical: '山'
        },
        {
            kanji: '川',
            onyomi: ['セン'],
            kunyomi: ['かわ'],
            meanings: ['river', 'stream'],
            jlpt: 'N5',
            grade: '1',
            strokes: 3,
            categories: ['place', 'nature'],
            frequency: 7,
            radical: '川'
        },
        {
            kanji: '天',
            onyomi: ['テン'],
            kunyomi: ['あまつ', 'あめ', 'あま-'],
            meanings: ['heaven', 'sky', 'imperial'],
            jlpt: 'N5',
            grade: '1',
            strokes: 4,
            categories: ['place', 'abstract'],
            frequency: 8,
            radical: '大'
        },
        {
            kanji: '生',
            onyomi: ['セイ', 'ショウ'],
            kunyomi: ['い.きる', 'い.かす', 'い.ける', 'う.まれる', 'お.う', 'は.える', 'は.やす', 'き', 'なま', 'なま-', 'な.る', 'な.す', 'む.す', '-う', 'う.む'],
            meanings: ['life', 'genuine', 'birth', 'grow'],
            jlpt: 'N5',
            grade: '1',
            strokes: 5,
            categories: ['body', 'action', 'time'],
            frequency: 9,
            radical: '生'
        },
        {
            kanji: '花',
            onyomi: ['カ', 'ケ'],
            kunyomi: ['はな'],
            meanings: ['flower', 'blossom'],
            jlpt: 'N5',
            grade: '1',
            strokes: 7,
            categories: ['plant'],
            frequency: 10,
            radical: '艸'
        },
        {
            kanji: '猫',
            onyomi: ['ビョウ'],
            kunyomi: ['ねこ'],
            meanings: ['cat'],
            jlpt: 'N5',
            grade: 'S',
            strokes: 11,
            categories: ['animal'],
            frequency: 248,
            radical: '犬'
        },
        {
            kanji: '愛',
            onyomi: ['アイ'],
            kunyomi: ['いと.しい', 'かな.しい', 'め.でる', 'お.しむ', 'まな'],
            meanings: ['love', 'affection', 'favourite'],
            jlpt: 'N3',
            grade: 'S',
            strokes: 13,
            categories: ['emotion'],
            frequency: 156,
            radical: '心'
        },
        {
            kanji: '戦',
            onyomi: ['セン'],
            kunyomi: ['いくさ', 'たたか.う', 'おのの.く', 'そよ.ぐ', 'わか.る'],
            meanings: ['war', 'battle', 'fight'],
            jlpt: 'N2',
            grade: 'S',
            strokes: 13,
            categories: ['fight'],
            frequency: 67,
            radical: '戈'
        },
        {
            kanji: '春',
            onyomi: ['シュン'],
            kunyomi: ['はる'],
            meanings: ['spring', 'springtime'],
            jlpt: 'N4',
            grade: '2',
            strokes: 9,
            categories: ['time'],
            frequency: 89,
            radical: '日'
        },
        {
            kanji: '東京',
            onyomi: ['トウ', 'キョウ'],
            kunyomi: [],
            meanings: ['Tokyo', 'east capital'],
            jlpt: 'N5',
            grade: 'S',
            strokes: 0, // Compound word
            categories: ['place'],
            frequency: 15,
            radical: ''
        }
    ];
}

// Initialize DataTables
function initializeDataTable() {
    loadFavorites();

    kanjiTable = $('#kanjiTable').DataTable({
        data: filteredData,
        columns: [
            {
                data: 'kanji',
                title: '<i class="fa-solid fa-star"></i>', // Title for the favorite column
                render: function (data, type, row) {
                    const activeClass = isFavorite(data) ? 'active' : '';
                    const starIcon = isFavorite(data) ? 'fa-solid' : 'fa-regular';
                    return `<i class="${starIcon} fa-star favorite-star ${activeClass}" onclick="toggleFavorite('${data}', event)"></i>`;
                },
                orderable: false,
                className: 'text-center',
                width: '30px' // Adjust width as needed
            },
            {
                data: 'kanji',
                title: 'Kanji',
                render: function (data, type, row) {
                    if (type === 'display') {
                        return `<span class="kanji-character" onclick="showKanjiDetail('${data}')">${data}</span>`;
                    }
                    return data;
                },
                width: '80px'
            },
            {
                data: null,
                title: 'Readings',
                render: function (data, type, row) {
                    if (type === 'display') {
                        if (studyMode && !isFavorite(row.kanji)) {
                            return `<span class="study-blur">HIDDEN</span>`;
                        }
                        const on = row.onyomi && row.onyomi.length > 0 ? row.onyomi.join(', ') : '';
                        const kun = row.kunyomi && row.kunyomi.length > 0 ? row.kunyomi.join(', ') : '';
                        return `<div class="kanji-readings">
                            ${on ? `<span style="color: #4CAF50">音: ${on}</span>` : ''}
                            ${kun ? `<br><span style="color: #2196F3">訓: ${kun}</span>` : ''}
                        </div>`;
                    }
                    return (row.onyomi || []).concat(row.kunyomi || []).join(' ');
                },
                width: '200px'
            },
            {
                data: 'meanings',
                title: 'Meanings',
                render: function (data, type, row) {
                    if (type === 'display') {
                        if (studyMode && !isFavorite(row.kanji)) {
                            return `<span class="study-blur">HIDDEN</span>`;
                        }
                        const meanings = Array.isArray(data) ? data : [data];
                        return `<div class="kanji-meanings" title="${meanings.join(', ')}">${meanings.slice(0, 3).join(', ')}${meanings.length > 3 ? '...' : ''}</div>`;
                    }
                    return Array.isArray(data) ? data.join(', ') : data;
                },
                width: '150px'
            },
            {
                data: 'jlpt',
                title: 'JLPT',
                render: function (data, type, row) {
                    if (type === 'display') {
                        return `<span class="jlpt-badge jlpt-${data}">${data}</span>`;
                    }
                    return data;
                },
                width: '80px'
            },
            {
                data: 'grade',
                title: 'Grade',
                render: function (data, type, row) {
                    if (type === 'display') {
                        const gradeMap = {
                            '1': 'Grade 1', '2': 'Grade 2', '3': 'Grade 3', '4': 'Grade 4',
                            '5': 'Grade 5', '6': 'Grade 6', 'S': 'Secondary', 'U': 'University'
                        };
                        return `<span class="grade-badge">${gradeMap[data] || data}</span>`;
                    }
                    return data;
                },
                width: '100px'
            },
            {
                data: 'strokes',
                title: 'Strokes',
                render: function (data, type, row) {
                    if (type === 'display') {
                        return `<span class="stroke-count">${data}</span>`;
                    }
                    return data;
                },
                width: '80px'
            },
            {
                data: 'categories',
                title: 'Categories',
                render: function (data, type, row) {
                    if (type === 'display') {
                        const categories = Array.isArray(data) ? data : [data];
                        return `<div class="category-tags">
                            ${categories.slice(0, 3).map(cat => `<span class="category-tag">${cat}</span>`).join('')}
                            ${categories.length > 3 ? `<span class="category-tag">+${categories.length - 3}</span>` : ''}
                        </div>`;
                    }
                    return Array.isArray(data) ? data.join(', ') : data;
                },
                width: '150px'
            },
            {
                data: 'frequency',
                title: 'Frequency',
                render: function (data, type, row) {
                    if (type === 'display') {
                        return `<span class="frequency-rank">#${data || 'N/A'}</span>`;
                    }
                    return data || 9999;
                },
                width: '100px'
            }
        ],
        pageLength: 25,
        lengthMenu: [[10, 25, 50, 100, -1], [10, 25, 50, 100, "All"]],
        responsive: true,
        scrollX: true,
        order: [[8, 'asc']], // Sort by frequency by default (index 8 now due to new column)
        language: {
            search: "Search kanji, meanings, readings:",
            lengthMenu: "Show _MENU_ kanji per page",
            info: "Showing _START_ to _END_ of _TOTAL_ kanji",
            infoEmpty: "No kanji found",
            infoFiltered: "(filtered from _MAX_ total kanji)",
            paginate: {
                first: "First",
                last: "Last",
                next: "Next",
                previous: "Previous"
            }
        },
        initComplete: function () {
            // Add custom search functionality
            setupCustomSearch();
        }
    });
}

// Setup filter controls
function setupFilters() {
    // JLPT Level filter
    $('#jlptFilter').on('change', function () {
        const value = $(this).val();
        applyFilters();
    });

    // Grade filter
    $('#gradeFilter').on('change', function () {
        const value = $(this).val();
        applyFilters();
    });

    // Category filter
    $('#categoryFilter').on('change', function () {
        const value = $(this).val();
        applyFilters();
    });

    // Stroke count filter
    $('#strokeFilter').on('change', function () {
        const value = $(this).val();
        applyFilters();
    });
}

// Apply all filters
function applyFilters() {
    const jlptFilter = $('#jlptFilter').val();
    const gradeFilter = $('#gradeFilter').val();
    const categoryFilter = $('#categoryFilter').val();
    const strokeFilter = $('#strokeFilter').val();

    const favoriteFilter = $('#favoriteFilter').is(':checked');

    filteredData = allKanjiData.filter(kanji => {
        // Favorite filter
        if (favoriteFilter && !isFavorite(kanji.kanji)) {
            return false;
        }

        // JLPT filter
        if (jlptFilter && kanji.jlpt !== jlptFilter) {
            return false;
        }

        // Grade filter
        if (gradeFilter && kanji.grade !== gradeFilter) {
            return false;
        }

        // Category filter
        if (categoryFilter) {
            const categories = Array.isArray(kanji.categories) ? kanji.categories : [kanji.categories];
            if (!categories.includes(categoryFilter)) {
                return false;
            }
        }

        // Stroke filter
        if (strokeFilter) {
            const strokes = kanji.strokes;
            let strokeMatch = false;
            switch (strokeFilter) {
                case '1-5':
                    strokeMatch = strokes >= 1 && strokes <= 5;
                    break;
                case '6-10':
                    strokeMatch = strokes >= 6 && strokes <= 10;
                    break;
                case '11-15':
                    strokeMatch = strokes >= 11 && strokes <= 15;
                    break;
                case '16-20':
                    strokeMatch = strokes >= 16 && strokes <= 20;
                    break;
                case '21+':
                    strokeMatch = strokes >= 21;
                    break;
            }
            if (!strokeMatch) return false;
        }

        return true;
    });

    // Reset grid page
    currentGridPage = 1;

    // Update DataTable
    kanjiTable.clear();
    kanjiTable.rows.add(filteredData);
    kanjiTable.draw();

    // Update grid view if active
    if (currentViewMode === 'grid') {
        updateGridDisplay();
    }

    updateStats();
}

// Reset all filters
function resetFilters() {
    $('#jlptFilter').val('');
    $('#gradeFilter').val('');
    $('#categoryFilter').val('');
    $('#strokeFilter').val('');
    $('#favoriteFilter').prop('checked', false);
    $('#searchInput').val('');

    filteredData = [...allKanjiData];
    currentGridPage = 1;

    kanjiTable.clear();
    kanjiTable.rows.add(filteredData);
    kanjiTable.draw();

    // Update grid view if active
    if (currentViewMode === 'grid') {
        updateGridDisplay();
    }

    updateStats();
}

// Custom search functionality
function setupCustomSearch() {
    $('#searchInput').on('keyup', function () {
        const searchTerm = $(this).val().toLowerCase();

        if (searchTerm.length === 0) {
            // Clear custom search and apply default DataTable search
            $.fn.dataTable.ext.search.pop(); // Remove previous custom search
            kanjiTable.search('').draw();
            return;
        }

        // Remove any previous custom search function to avoid stacking
        $.fn.dataTable.ext.search.pop();

        // Custom search function
        $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
            // Adjust indices for new column:
            // Kanji character is now data[1]
            // Readings is now data[2]
            // Meanings is now data[3]
            const kanji = data[1].toLowerCase(); // Kanji character
            const readings = data[2].toLowerCase(); // Readings
            const meanings = data[3].toLowerCase(); // Meanings

            return kanji.includes(searchTerm) ||
                readings.includes(searchTerm) ||
                meanings.includes(searchTerm);
        });

        kanjiTable.draw();
    });
}

// Toggle Study Mode
function toggleStudyMode() {
    studyMode = !studyMode;
    const btn = document.getElementById('studyModeToggle');
    if (btn) {
        btn.classList.toggle('active', studyMode);
    }

    // Refresh displays to reflect study mode (e.g., hiding hints)
    if (kanjiTable) {
        kanjiTable.rows().invalidate().draw(false);
    }
    if (currentViewMode === 'grid') {
        updateGridDisplay();
    }
}

// Audio functionality
function playAudio(type) {
    const kanji = document.getElementById('modalKanji').innerText;
    const kanjiData = allKanjiData.find(k => k.kanji === kanji);
    if (!kanjiData) return;

    let text = '';
    if (type === 'onyomi') {
        text = (kanjiData.onyomi || []).join(', ');
    } else if (type === 'kunyomi') {
        text = (kanjiData.kunyomi || []).join(', ');
    } else {
        text = kanji;
    }

    if (!text) return;

    // Use Web Speech API for Japanese audio
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
}

// HanziWriter Functions
function initStrokeAnimation(kanji) {
    const container = document.getElementById('kanjiStrokeAnim');
    container.innerHTML = ''; // Clear previous

    currentWriter = HanziWriter.create('kanjiStrokeAnim', kanji, {
        width: 200,
        height: 200,
        padding: 5,
        strokeAnimationSpeed: 1,
        delayBetweenStrokes: 200,
        showOutline: true,
        strokeColor: '#FF6B6B',
        outlineColor: '#f0f0f0'
    });

    currentWriter.animateCharacter();
}

function animateStrokes() {
    if (currentWriter) {
        currentWriter.animateCharacter();
    }
}

function restartAnimation() {
    if (currentWriter) {
        currentWriter.animateCharacter();
    }
}

// Update statistics
function updateStats() {
    const totalKanji = filteredData.length;
    const jouyouKanji = filteredData.filter(k => k.jlpt && ['N5', 'N4', 'N3', 'N2', 'N1'].includes(k.jlpt)).length;
    const jinmeiyouKanji = filteredData.filter(k => !k.jlpt || !['N5', 'N4', 'N3', 'N2', 'N1'].includes(k.jlpt)).length;
    const avgStrokes = totalKanji > 0 ? Math.round(filteredData.reduce((sum, k) => sum + (k.strokes || 0), 0) / totalKanji) : 0;

    $('#totalKanji').text(totalKanji.toLocaleString());
    $('#jouyouKanji').text(jouyouKanji.toLocaleString());
    $('#jinmeiyouKanji').text(jinmeiyouKanji.toLocaleString());
    $('#avgStrokes').text(avgStrokes);
}

// Show kanji detail modal
// Show kanji detail modal
function showKanjiDetail(kanji) {
    console.log('Clicked kanji:', kanji);
    try {

        const kanjiData = allKanjiData.find(k => k.kanji === kanji);
        if (!kanjiData) return;

        // Populate modal
        document.getElementById('modalKanji').innerText = kanjiData.kanji;
        document.getElementById('modalMeanings').innerText = Array.isArray(kanjiData.meanings) ? kanjiData.meanings.join(', ') : kanjiData.meanings;
        document.getElementById('modalOnyomi').innerText = (kanjiData.onyomi || []).join('、 ') || 'N/A';
        document.getElementById('modalKunyomi').innerText = (kanjiData.kunyomi || []).join('、 ') || 'N/A';
        document.getElementById('modalStrokes').innerText = kanjiData.strokes || 'N/A';
        document.getElementById('modalRadical').innerText = kanjiData.radical || 'N/A';
        document.getElementById('modalFrequency').innerText = kanjiData.frequency ? `#${kanjiData.frequency}` : 'N/A';

        // Populate badges
        const badgesContainer = document.getElementById('modalBadges');
        badgesContainer.innerHTML = '';

        if (kanjiData.jlpt) {
            const jlptBadge = document.createElement('div');
            jlptBadge.className = 'meta-badge';
            jlptBadge.innerText = `JLPT ${kanjiData.jlpt}`;
            badgesContainer.appendChild(jlptBadge);
        }

        if (kanjiData.grade) {
            const gradeBadge = document.createElement('div');
            gradeBadge.className = 'meta-badge';
            gradeBadge.innerText = `Grade ${kanjiData.grade}`;
            badgesContainer.appendChild(gradeBadge);
        }

        updateModalFavoriteIcon(kanjiData.kanji);

        // Fetch vocabulary examples
        fetchVocabulary(kanjiData.kanji);

        // Initialize stroke animation
        setTimeout(() => {
            initStrokeAnimation(kanjiData.kanji);
        }, 100);

        // Show modal
        const modal = document.getElementById('kanjiModal');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    } catch (e) {
        console.error("Error showing details:", e);
        alert("Error: " + e.message);
    }
}

function closeKanjiModal() {
    const modal = document.getElementById('kanjiModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Close modal when clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('kanjiModal');
    if (event.target === modal) {
        closeKanjiModal();
    }
};

// Filter vocabulary based on checkboxes
function filterVocab() {
    const kanji = document.getElementById('modalKanji').innerText;
    fetchVocabulary(kanji);
}

async function fetchVocabulary(kanji) {
    const vocabList = document.getElementById('modalVocabList');
    if (!vocabList) return;

    // Get selected filters
    const selectedTags = Array.from(document.querySelectorAll('.vocab-filters input:checked'))
        .map(cb => cb.value);

    // Construct query param
    let query = `${API_BASE_URL}/vocabulary/${kanji}?limit=24`;
    if (selectedTags.length > 0) {
        // Simple OR filtering for now, or just pick the first one since API is simple
        // Let's just pass the first one for now as a POC, or update API to handle multiple
        // Our simple API update handles single tag LIKE. 
        // Let's iterate and show only matching if we want client side, or just pass one.
        // For simplicity, let's pass the first selected tag if any.
        // Improvements can be made to support multiple OR/AND.
        query += `&tag=${encodeURIComponent(selectedTags[0])}`;
    }

    vocabList.innerHTML = '<div class="vocab-loading"><i class="fas fa-spinner fa-spin"></i> Loading examples...</div>';

    try {
        const response = await fetch(query);
        const data = await response.json();

        if (data.success && data.vocabulary && data.vocabulary.length > 0) {
            vocabList.innerHTML = '';
            data.vocabulary.forEach(item => {
                const card = document.createElement('div');
                card.className = 'vocab-card';
                card.innerHTML = `
                    <div class="vocab-expr">${item.expression}</div>
                    <div class="vocab-reading">${item.reading || ''}</div>
                    <div class="vocab-meaning">${item.translation}</div>
                    ${item.tags ? `<span class="vocab-tag">${item.tags}</span>` : ''}
                `;
                vocabList.appendChild(card);
            });
        } else {
            vocabList.innerHTML = '<div class="vocab-loading">No vocabulary examples found matching criteria.</div>';
        }
    } catch (error) {
        console.error('Failed to fetch vocabulary:', error);
        vocabList.innerHTML = '<div class="vocab-loading" style="color: #ff6b6b">Error loading vocabulary.</div>';
    }
}

// Export data to CSV
function exportData() {
    const csvContent = [
        ['Kanji', 'Onyomi', 'Kunyomi', 'Meanings', 'JLPT', 'Grade', 'Strokes', 'Categories', 'Frequency'],
        ...filteredData.map(k => [
            k.kanji,
            (k.onyomi || []).join('; '),
            (k.kunyomi || []).join('; '),
            Array.isArray(k.meanings) ? k.meanings.join('; ') : k.meanings,
            k.jlpt || '',
            k.grade || '',
            k.strokes || '',
            Array.isArray(k.categories) ? k.categories.join('; ') : k.categories,
            k.frequency || ''
        ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'kanji-table-export.csv';
    link.click();
}

// Loading overlay functions
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    overlay.style.display = show ? 'flex' : 'none';
}

function showError(message) {
    alert(`Error: ${message}`);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initializeKanjiTable);
