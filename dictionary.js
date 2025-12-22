const API_BASE_URL = 'http://localhost:5003/api';
let currentPage = 1;
let currentSearch = '';
let currentTag = '';
let currentSource = 'all';
let searchTimeout = null;

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const tagSelect = document.getElementById('tagWaitlist');
    const sourceSelect = document.getElementById('sourceSelect');

    // Debounced search
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        currentSearch = e.target.value;
        currentPage = 1;
        searchTimeout = setTimeout(fetchResults, 300);
    });

    tagSelect.addEventListener('change', (e) => {
        currentTag = e.target.value;
        currentPage = 1;
        fetchResults();
    });

    sourceSelect.addEventListener('change', (e) => {
        currentSource = e.target.value;
        currentPage = 1;
        fetchResults();
    });

    // Initial load? Maybe not, too heavy. Let's wait for input or just load first page.
    fetchResults(); // Load initial page
});

async function fetchResults() {
    const container = document.getElementById('resultsContainer');
    container.innerHTML = '<div style="text-align:center; padding: 2rem;">Loading...</div>';

    try {
        const response = await fetch(`${API_BASE_URL}/dictionary/search?search=${encodeURIComponent(currentSearch)}&tag=${encodeURIComponent(currentTag)}&source=${encodeURIComponent(currentSource)}&page=${currentPage}&limit=20`);
        const data = await response.json();

        if (data.success) {
            renderResults(data.results);
            renderPagination(data.page, data.pages);
        } else {
            container.innerHTML = '<div style="text-align:center; color: red;">Error loading data</div>';
        }
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = '<div style="text-align:center; color: red;">Connection error</div>';
    }
}

function renderResults(results) {
    const container = document.getElementById('resultsContainer');
    container.innerHTML = '';

    if (results.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: rgba(255,255,255,0.5); padding: 2rem;">No results found.</div>';
        return;
    }

    results.forEach(vocab => {
        const card = document.createElement('div');
        card.className = 'vocab-card';

        const favClass = vocab.is_favorite ? 'active' : '';

        const sourceBadge = vocab.source === 'my_vocab'
            ? '<span class="vocab-tag" style="border-color: #ffd700; color: #ffd700;">My Word</span>'
            : '<span class="vocab-tag" style="border-color: rgba(255,255,255,0.3); color: rgba(255,255,255,0.5);">Official</span>';

        card.innerHTML = `
            <div class="vocab-expression">${vocab.expression}</div>
            <div class="vocab-details">
                <div class="vocab-reading">${vocab.reading}</div>
                <div class="vocab-translation">${vocab.translation}</div>
                <div class="vocab-tags">
                   ${sourceBadge}
                   ${tagsHtml.replace('<div class="vocab-tags">', '').replace('</div>', '')} 
                </div>
                <button class="example-btn" onclick="toggleExamples(this, '${vocab.expression}')">
                    <i class="fas fa-quote-right"></i> Show Examples
                </button>
                <div class="examples-section"></div>
            </div>
            <div>
                <button class="fav-btn ${favClass}" onclick="toggleFavorite(${vocab.id}, this)">
                    <i class="fas fa-star"></i>
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

async function toggleExamples(btn, word) {
    const section = btn.nextElementSibling;
    const isActive = section.classList.contains('active');

    if (isActive) {
        section.classList.remove('active');
        btn.innerHTML = '<i class="fas fa-quote-right"></i> Show Examples';
        return;
    }

    // Expand
    section.innerHTML = '<div style="padding:0.5rem; color:rgba(255,255,255,0.5)">Loading examples...</div>';
    section.classList.add('active');
    btn.innerHTML = '<i class="fas fa-chevron-up"></i> Hide Examples';

    try {
        const response = await fetch(`${API_BASE_URL}/examples/search?word=${encodeURIComponent(word)}`);
        const data = await response.json();

        if (data && data.results && data.results.length > 0) {
            section.innerHTML = data.results.map(ex => `
                <div class="example-item">
                    <div class="example-jp">${ex.japanese}</div>
                    <div class="example-en">${ex.english}</div>
                </div>
            `).join('');
        } else {
            section.innerHTML = '<div style="padding:0.5rem; color:rgba(255,255,255,0.5)">No examples found.</div>';
        }
    } catch (e) {
        console.error(e);
        section.innerHTML = '<div style="padding:0.5rem; color:#ff6b6b">Error loading examples.</div>';
    }
}

function renderPagination(current, total) {
    const container = document.getElementById('pagination');
    container.innerHTML = '';

    if (total <= 1) return;

    // Simple pagination: Prev, Next, and surrounding pages
    const createBtn = (page, text, isActive = false) => {
        const btn = document.createElement('button');
        btn.className = `page-btn ${isActive ? 'active' : ''}`;
        btn.innerText = text;
        btn.disabled = isActive;
        btn.onclick = () => {
            currentPage = page;
            fetchResults();
            window.scrollTo(0, 0);
        };
        return btn;
    };

    if (current > 1) {
        container.appendChild(createBtn(current - 1, 'Previous'));
    }

    let startPage = Math.max(1, current - 2);
    let endPage = Math.min(total, current + 2);

    if (startPage > 1) {
        container.appendChild(createBtn(1, '1'));
        if (startPage > 2) container.appendChild(document.createTextNode(' ... '));
    }

    for (let i = startPage; i <= endPage; i++) {
        container.appendChild(createBtn(i, i.toString(), i === current));
    }

    if (endPage < total) {
        if (endPage < total - 1) container.appendChild(document.createTextNode(' ... '));
        container.appendChild(createBtn(total, total.toString()));
    }

    if (current < total) {
        container.appendChild(createBtn(current + 1, 'Next'));
    }
}

async function toggleFavorite(vocabId, btnElement) {
    const isAdding = !btnElement.classList.contains('active');
    const method = isAdding ? 'POST' : 'DELETE';
    const url = isAdding
        ? `${API_BASE_URL}/dictionary/favorites`
        : `${API_BASE_URL}/dictionary/favorites?id=${vocabId}`;

    // Optimistic UI update
    btnElement.classList.toggle('active');

    try {
        const options = { method: method };
        if (isAdding) {
            options.headers = { 'Content-Type': 'application/json' };
            options.body = JSON.stringify({ vocab_id: vocabId });
        }

        const response = await fetch(url, options);
        const data = await response.json();

        if (!data.success) {
            // Revert if failed
            btnElement.classList.toggle('active');
            alert('Failed to update favorite: ' + (data.error || 'Unknown error'));
        }
    } catch (e) {
        console.error(e);
        btnElement.classList.toggle('active');
        alert('Connection error');
    }
}
