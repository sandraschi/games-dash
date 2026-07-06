// Theorem Prover — Lean 4 Proof Game
const API = 'http://localhost:10855';

// Curated problem database
const PROBLEMS = [
    // EASY
    { tier:'easy', statement:'∀ n : ℕ, n + 0 = n', source:'Nat.add_zero', pts:50, hints:['Nat.add_zero'] },
    { tier:'easy', statement:'∀ n : ℕ, 0 + n = n', source:'Nat.zero_add', pts:50, hints:['Nat.zero_add'] },
    { tier:'easy', statement:'∀ n : ℕ, n * 1 = n', source:'Nat.mul_one', pts:50, hints:['Nat.mul_one'] },
    { tier:'easy', statement:'∀ n : ℕ, 1 * n = n', source:'Nat.one_mul', pts:50, hints:['Nat.one_mul'] },
    { tier:'easy', statement:'∀ n : ℕ, n + n = 2 * n', source:'basic arithmetic', pts:75, hints:['two_mul', 'Nat.succ_eq_add_one'] },
    { tier:'easy', statement:'∀ a b : ℕ, a + b = b + a', source:'Nat.add_comm', pts:75, hints:['Nat.add_comm'] },
    { tier:'easy', statement:'∀ a b c : ℕ, a + b + c = a + c + b', source:'add_comm', pts:75, hints:['add_comm', 'add_assoc'] },
    // MEDIUM
    { tier:'medium', statement:'∀ n : ℕ, 2 * ∑ i ∈ Finset.range (n+1), i = n * (n+1)', source:'sum formula', pts:150, hints:['Finset.sum_range_succ', 'Nat.succ_eq_add_one', 'mul_add', 'add_comm', 'add_assoc'] },
    { tier:'medium', statement:'∀ n : ℕ, ∑ i ∈ Finset.range (n+1), (2*i+1) = (n+1)^2', source:'odd sum', pts:150, hints:['Finset.sum_range_succ', 'Nat.pow_two', 'Nat.succ_mul'] },
    { tier:'medium', statement:'∀ n : ℕ, ∑ i ∈ Finset.range (n+1), i^2 = (n*(n+1)*(2*n+1))/6', source:'sum of squares', pts:200, hints:['Finset.sum_range_succ', 'Nat.succ_eq_add_one', 'ring'] },
    { tier:'medium', statement:'∀ n m : ℕ, n * m = m * n', source:'Nat.mul_comm', pts:100, hints:['Nat.mul_comm'] },
    { tier:'medium', statement:'∀ n : ℕ, n * (n+1) % 2 = 0', source:'even product', pts:150, hints:['Nat.mod_two_eq_zero_or_one', 'Nat.even_mul_succ_self'] },
    // HARD
    { tier:'hard', statement:'∀ n : ℕ, n.succ * ∑ i ∈ Finset.range (n+1), i = (n*n*(n+1))/2', source:'advanced sum', pts:300, hints:['Finset.sum_range_succ', 'Nat.mul_add', 'Nat.add_comm', 'Nat.succ_mul', 'ring'] },
    { tier:'hard', statement:'∀ n : ℕ, Finset.sum (Finset.range (n+1)) (λ i => i^3) = (∑ i ∈ Finset.range (n+1), i)^2', source:'sum of cubes', pts:400, hints:['Finset.sum_range_succ', 'Nat.pow_two', 'Nat.pow_three', 'ring'] },
    { tier:'hard', statement:'∀ a b : ℕ, gcd a b = gcd (a % b) b', source:'GCD recursion', pts:350, hints:['Nat.gcd_eq_gcd_ab', 'Nat.gcd_rec'] },
    { tier:'hard', statement:'∀ n : ℕ, n - n = 0', source:'Nat.sub_self', pts:100, hints:['Nat.sub_self'] },
];

const LEANFORGE_PORT = 10855;

let state = { score:0, level:1, proved:0, streak:0, solved:{} };
let currentProblem = null;
let currentJobId = null;
let pollTimer = null;
let activeTier = 'easy';

function loadState() {
    try { const s = localStorage.getItem('theorem-game'); if (s) state = JSON.parse(s); } catch {}
    updateUI();
}
function saveState() {
    try { localStorage.setItem('theorem-game', JSON.stringify(state)); } catch {}
}

function updateUI() {
    document.getElementById('scoreDisplay').textContent = state.score;
    document.getElementById('levelDisplay').textContent = state.level;
    document.getElementById('provedDisplay').textContent = state.proved;
    document.getElementById('streakDisplay').textContent = state.streak;
    renderTiers();
}

function renderTiers() {
    const tiers = ['easy','medium','hard'];
    const counts = {};
    for (const p of PROBLEMS) {
        if (!counts[p.tier]) counts[p.tier] = { total:0, solved:0 };
        counts[p.tier].total++;
        if (state.solved[p.statement]) counts[p.tier].solved++;
    }
    document.getElementById('tierBar').innerHTML = tiers.map(t =>
        '<div class="tier' + (activeTier === t ? ' active' : '') + '" onclick="selectTier(\'' + t + '\')">' +
        t.charAt(0).toUpperCase() + t.slice(1) + ' ' +
        (counts[t] ? counts[t].solved + '/' + counts[t].total : '0/0') +
        '</div>'
    ).join('');
}

function selectTier(tier) {
    activeTier = tier;
    renderTiers();
    showProblem();
}

function showProblem() {
    const available = PROBLEMS.filter(p =>
        p.tier === activeTier && !state.solved[p.statement]
    );
    if (available.length === 0) {
        document.getElementById('theoremCard').style.display = 'none';
        document.getElementById('emptyState').style.display = 'block';
        document.getElementById('emptyState').querySelector('p').textContent =
            'All ' + activeTier + ' theorems proved! Try another tier.';
        return;
    }
    currentProblem = available[Math.floor(Math.random() * available.length)];
    document.getElementById('theoremCard').style.display = 'block';
    document.getElementById('emptyState').style.display = 'none';
    document.getElementById('theoremStatement').textContent = currentProblem.statement;
    document.getElementById('diffBadge').className = 'diff ' + currentProblem.tier;
    document.getElementById('diffBadge').textContent = currentProblem.tier;
    document.getElementById('theoremSource').textContent = currentProblem.source;
    document.getElementById('theoremPoints').textContent = '+' + currentProblem.pts + ' pts';

    const hintList = document.getElementById('hintList');
    hintList.innerHTML = currentProblem.hints.map(h =>
        '<span class="hint-tag" onclick="useHint(\'' + h + '\')">' + h + '</span>'
    ).join('');

    document.getElementById('proveBtn').disabled = false;
    document.getElementById('proveBtn').textContent = '\u25b6 Prove It';
    document.getElementById('progressCard').classList.remove('active');
    document.getElementById('proofDisplay').style.display = 'none';
}

function nextTheorem() {
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
    currentJobId = null;
    showProblem();
}

async function submitProof() {
    if (!currentProblem) return;
    document.getElementById('proveBtn').disabled = true;
    document.getElementById('proveBtn').textContent = 'Submitting...';
    document.getElementById('progressCard').classList.add('active');
    document.getElementById('progressStatus').textContent = 'Submitting...';
    document.getElementById('progressStatus').className = 'status queued';
    document.getElementById('progressLog').innerHTML = '';
    document.getElementById('proofDisplay').style.display = 'none';

    try {
        const resp = await fetch('http://localhost:' + LEANFORGE_PORT + '/api/jobs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                statement: currentProblem.statement,
                hints: currentProblem.hints.join(', '),
                tier: 1,
                parallel_agents: 4,
                max_turns: 40,
            }),
        });
        const data = await resp.json();
        if (data.job_id) {
            currentJobId = data.job_id;
            document.getElementById('progressStatus').textContent = 'Queued...';
            pollJob(currentJobId);
        } else {
            throw new Error(data.error || 'No job_id');
        }
    } catch (e) {
        logLine('error', 'Failed: ' + e.message + '. Is leanforge-mcp running on port ' + LEANFORGE_PORT + '?');
        document.getElementById('proveBtn').disabled = false;
        document.getElementById('proveBtn').textContent = '\u25b6 Retry';
    }
}

function pollJob(jobId) {
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = setInterval(async () => {
        try {
            const resp = await fetch('http://localhost:' + LEANFORGE_PORT + '/api/jobs/' + jobId);
            const data = await resp.json();
            if (data.status === 'complete') {
                clearInterval(pollTimer); pollTimer = null;
                onProofComplete(jobId, data);
            } else if (data.status === 'failed' || data.status === 'cancelled') {
                clearInterval(pollTimer); pollTimer = null;
                onProofFailed(data);
            } else if (data.status === 'running') {
                document.getElementById('progressStatus').textContent = 'Running... (turn ' + (data.latest_turn || '?') + ')';
                document.getElementById('progressStatus').className = 'status running';
                document.getElementById('progressDetail').textContent = data.latest_model || '';
                if (data.latest_compiler_output) {
                    logLine('turn', 'Turn ' + (data.latest_turn || '?') + ': ' + data.latest_compiler_output.substring(0, 200));
                }
            } else {
                document.getElementById('progressStatus').textContent = data.status || 'Waiting...';
            }
        } catch (e) {
            logLine('error', 'Poll error: ' + e.message);
        }
    }, 2000);
}

function onProofComplete(jobId, data) {
    document.getElementById('progressStatus').textContent = '\u2713 Proved!';
    document.getElementById('progressStatus').className = 'status complete';
    logLine('success', 'Theorem proved successfully!');
    if (data.proof) {
        document.getElementById('proofDisplay').textContent = data.proof;
        document.getElementById('proofDisplay').style.display = 'block';
    }
    state.solved[currentProblem.statement] = true;
    state.proved++;
    state.streak++;
    state.score += currentProblem.pts;
    state.level = Math.floor(state.proved / 3) + 1;
    saveState();
    updateUI();
    document.getElementById('proveBtn').textContent = '\u2713 Proved!';
    document.getElementById('proveBtn').className = 'btn success';
    showCelebration(currentProblem.pts);
}

function onProofFailed(data) {
    document.getElementById('progressStatus').textContent = '\u2717 Failed';
    document.getElementById('progressStatus').className = 'status failed';
    logLine('error', data.error || 'Proof search failed');
    state.streak = 0;
    saveState();
    updateUI();
    document.getElementById('proveBtn').disabled = false;
    document.getElementById('proveBtn').textContent = '\u25b6 Retry';
    document.getElementById('proveBtn').className = 'btn primary';
}

function logLine(type, msg) {
    const log = document.getElementById('progressLog');
    const cls = type === 'turn' ? 'turn' : type === 'success' ? 'success' : 'error';
    log.innerHTML += '<div class="' + cls + '">' + escapeHtml(msg) + '</div>';
    log.scrollTop = log.scrollHeight;
}

function escapeHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function showCelebration(pts) {
    document.getElementById('earnedPoints').textContent = '+' + pts;
    document.getElementById('proofSummary').textContent = currentProblem.statement;
    document.getElementById('celebration').classList.add('show');
}

function closeCelebration() {
    document.getElementById('celebration').classList.remove('show');
    nextTheorem();
}

function useHint(hint) {
    if (!currentProblem) return;
    // Try Mathlib search via leanforge-mcp
    fetch('http://localhost:' + LEANFORGE_PORT + '/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            statement: currentProblem.statement,
            hints: hint,
            tier: 1,
            parallel_agents: 2,
            max_turns: 20,
        }),
    }).then(r => r.json()).then(data => {
        if (data.job_id) {
            currentJobId = data.job_id;
            document.getElementById('progressCard').classList.add('active');
            document.getElementById('progressStatus').textContent = 'Running with hint: ' + hint;
            pollJob(data.job_id);
        }
    }).catch(() => {
        logLine('error', 'Hint search failed (is leanforge-mcp running?)');
    });
}

loadState();
selectTier('easy');
