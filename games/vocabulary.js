const API_BASE_URL = 'http://localhost:5003/api';
let allVocab = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchFavorites();

    const filterInput = document.getElementById('filterInput');
    const sortSelect = document.getElementById('sortSelect');

    filterInput.addEventListener('input', () => renderVocab());
    sortSelect.addEventListener('change', () => renderVocab());
});

async function fetchFavorites() {
    try {
        const response = await fetch(`${API_BASE_URL}/dictionary/favorites`);
        const data = await response.json();

        if (data.success) {
            allVocab = data.favorites;
            document.getElementById('statsTotal').innerText = allVocab.length;
            renderVocab();
        } else {
            alert('Error loading favorites');
        }
    } catch (e) {
        console.error(e);
        alert('Connection error');
    }
}

function renderVocab() {
    const grid = document.getElementById('vocabGrid');
    const filterText = document.getElementById('filterInput').value.toLowerCase();
    const sortMethod = document.getElementById('sortSelect').value;

    // Filter
    let filtered = allVocab.filter(v =>
        v.expression.toLowerCase().includes(filterText) ||
        v.reading.toLowerCase().includes(filterText) ||
        v.translation.toLowerCase().includes(filterText)
    );

    // Sort
    filtered.sort((a, b) => {
        if (sortMethod === 'newest') return new Date(b.created_at) - new Date(a.created_at);
        if (sortMethod === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
        if (sortMethod === 'alpha') return a.expression.localeCompare(b.expression);
        return 0;
    });

    grid.innerHTML = '';

    if (filtered.length === 0) {
        grid.innerHTML = '<div style="text-align: center; color: rgba(255,255,255,0.5); padding: 2rem; grid-column: 1/-1;">No words found. Go to the Dictionary to add some!</div>';
        return;
    }

    filtered.forEach(vocab => {
        const card = document.createElement('div');
        card.className = 'vocab-card';

        let tagsHtml = '';
        if (vocab.tags) {
            const tags = vocab.tags.split(',').filter(t => t.trim());
            tagsHtml = `<div class="vocab-tags">${tags.map(t => `<span class="vocab-tag">${t}</span>`).join('')}</div>`;
        }

        card.innerHTML = `
            <button class="delete-btn" onclick="removeFavorite(${vocab.vocab_id}, this)" title="Remove from My Words">
                <i class="fas fa-times"></i>
            </button>
            <div class="vocab-expression">${vocab.expression}</div>
            <div class="vocab-reading">${vocab.reading}</div>
            <div class="vocab-translation">${vocab.translation}</div>
            ${tagsHtml}
        `;
        grid.appendChild(card);
    });
}

async function removeFavorite(vocabId, btn) {
    if (!confirm('Remove this word from your study list?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/dictionary/favorites?id=${vocabId}`, {
            method: 'DELETE'
        });
        const data = await response.json();

        if (data.success) {
            // Remove from local array
            allVocab = allVocab.filter(v => v.vocab_id !== vocabId);
            // Update UI
            document.getElementById('statsTotal').innerText = allVocab.length;
            renderVocab();
        } else {
            alert('Failed to remove: ' + data.error);
        }
    } catch (e) {
        console.error(e);
        alert('Connection error');
    }
}
