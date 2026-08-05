// Tarock Game Implementation (Austrian Zwanzigerrufen, 2-player)
// **Timestamp**: 2026-08-05
// Faithful 40-card Zwanzigerrufen: tarocks I/IV-XXI + Sküs, suits K-Q-R-B-Glatze.
// Farbzwang + Trumpfzwang (no Stichzwang), 88 card points, 45 to win the contract.
// 2-player adaptation: declarer plays alone (the XX-partner call is a 4-player mechanic).

let deck = [];
let players = [];
let dealerIdx = 0;
let vorHandIdx = 1;
let gamePhase = 'idle'; // idle | bidding | declaring | playing | finished
let bidState = null; // {bidder, current}
let contract = null; // {type, value, declarer, called}
let currentLeader = 0;
let playedThisTrick = [];
let trickCount = 0;
let matchScore = [0, 0];
let declarationState = null; // {absolut, pagatUltimo}
let pagatInfo = null; // {owner, playedEarly, lastPlayed, lastWon}
let mondCaughtBy = -1;
let trullHolder = -1;
let kings4Holder = -1;
let aiThinking = false;
let trickResolving = false;
let matchOver = false;

const MATCH_TARGET = 10;

const TRUMP_RANKS = {
    'Sküs': 22, 'XXI': 21, 'XX': 20, 'XIX': 19, 'XVIII': 18, 'XVII': 17,
    'XVI': 16, 'XV': 15, 'XIV': 14, 'XIII': 13, 'XII': 12, 'XI': 11,
    'X': 10, 'IX': 9, 'VIII': 8, 'VII': 7, 'VI': 6, 'V': 5, 'IV': 4, 'I': 1
};
const TRUMP_ORDER = ['Sküs', 'XXI', 'XX', 'XIX', 'XVIII', 'XVII', 'XVI', 'XV',
                     'XIV', 'XIII', 'XII', 'XI', 'X', 'IX', 'VIII', 'VII',
                     'VI', 'V', 'IV', 'I'];
const CALLABLE_TRUMPS = ['XX', 'XIX', 'XVIII', 'XVII', 'XVI'];
const SUITS = ['♠', '♥', '♦', '♣'];
const SUIT_RANKS = { 'K': 4, 'Q': 3, 'R': 2, 'B': 1, 'G': 0 };

function createDeck() {
    const d = [];
    TRUMP_ORDER.forEach(label => {
        d.push({ type: 'tarock', label, rank: TRUMP_RANKS[label], points: TRUMP_RANKS[label] === 22 || TRUMP_RANKS[label] === 21 || TRUMP_RANKS[label] === 1 ? 5 : 1, isTrull: label === 'Sküs' || label === 'XXI' || label === 'I' });
    });
    SUITS.forEach(suit => {
        const glatzeLabel = (suit === '♠' || suit === '♣') ? '10' : 'A';
        d.push({ type: 'suit', suit, label: 'K', rank: 4, points: 5, suitRank: 4 });
        d.push({ type: 'suit', suit, label: 'Q', rank: 3, points: 4, suitRank: 3 });
        d.push({ type: 'suit', suit, label: 'R', rank: 2, points: 3, suitRank: 2 });
        d.push({ type: 'suit', suit, label: 'B', rank: 1, points: 2, suitRank: 1 });
        d.push({ type: 'suit', suit, label: glatzeLabel, rank: 0, points: 0, suitRank: 0, isGlatze: true });
    });
    return d;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function cardDisplay(card) {
    return card.type === 'tarock' ? card.label : `${card.label}${card.suit}`;
}

function sortHand(hand) {
    hand.sort((a, b) => {
        if (a.type !== b.type) return a.type === 'tarock' ? -1 : 1;
        if (a.type === 'tarock') return b.rank - a.rank;
        if (a.suit !== b.suit) return SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit);
        return b.rank - a.rank;
    });
}

function newGame() {
    matchScore = [0, 0];
    matchOver = false;
    dealerIdx = Math.floor(Math.random() * 2);
    vorHandIdx = (dealerIdx + 1) % 2;
    startHand();
}

function startHand() {
    deck = createDeck();
    shuffle(deck);
    players = [
        { name: 'You', hand: [], tricks: [], points: 0, isHuman: true },
        { name: 'AI', hand: [], tricks: [], points: 0, isHuman: false }
    ];
    // 2-player adaptation: all 40 cards are dealt (20 each), so all 88 points
    // are in play and the 45-point target / 32-point Absolut threshold hold.
    players.forEach(p => {
        for (let i = 0; i < 20; i++) p.hand.push(deck.pop());
        sortHand(p.hand);
    });

    trickCount = 0;
    playedThisTrick = [];
    currentLeader = vorHandIdx;
    contract = null;
    bidState = { bidder: vorHandIdx, current: null };
    declarationState = null;
    pagatInfo = { owner: -1, playedEarly: false, lastPlayed: false, lastWon: false };
    mondCaughtBy = -1;
    trullHolder = -1;
    kings4Holder = -1;

    // Material premiums are decided by the opening hand
    const hasTrull = p => p.hand.some(c => c.isTrull && c.label === 'Sküs') &&
        p.hand.some(c => c.label === 'XXI') && p.hand.some(c => c.label === 'I');
    const has4Kings = p => p.hand.filter(c => c.type === 'suit' && c.label === 'K').length === 4;
    players.forEach((p, i) => {
        if (hasTrull(p)) trullHolder = i;
        if (has4Kings(p)) kings4Holder = i;
    });
    if (players.some((p, i) => p.hand.some(c => c.label === 'I'))) {
        pagatInfo.owner = players.findIndex(p => p.hand.some(c => c.label === 'I'));
    }

    gamePhase = 'bidding';
    renderAll();
    updateStatus(`${players[vorHandIdx].name} is Vorhand (leads). Bidding starts...`);
    logMessage(`New hand. ${players[dealerIdx].name} deals; ${players[vorHandIdx].name} is Vorhand.`);

    if (bidState.bidder === 1) {
        aiThinking = true;
        setTimeout(aiBid, 1200);
    }
}

// ---------- Bidding ----------

function findCallableTrump(hand) {
    for (let i = 0; i < CALLABLE_TRUMPS.length; i++) {
        if (!hand.some(c => c.type === 'tarock' && c.label === CALLABLE_TRUMPS[i])) {
            return CALLABLE_TRUMPS[i];
        }
    }
    return null; // holds XX..XVI: cannot play a normal game
}

function canBidRufer(idx) {
    return findCallableTrump(players[idx].hand) !== null;
}

function canBidFarbensolo(idx) {
    const suitCards = players[idx].hand.filter(c => c.type === 'suit').length;
    return suitCards >= 5;
}

const BID_RANK = { rufer: 1, farbensolo: 2, solo: 3 };
const BID_NAME = { rufer: 'Rufer', farbensolo: 'Farbensolo', solo: 'Solo' };
const BID_VALUE = { rufer: 1, farbensolo: 4, solo: 4 };

function makeBid(type) {
    if (gamePhase !== 'bidding' || !bidState) return;
    if (players[bidState.bidder].isHuman === false) return;

    if (type === 'rufer' && !canBidRufer(bidState.bidder)) return;
    if (type === 'farbensolo' && !canBidFarbensolo(bidState.bidder)) return;
    if (type !== 'pass' && bidState.current && BID_RANK[type] <= BID_RANK[bidState.current.type]) return;

    placeBid(type);
}

function placeBid(type) {
    const bidder = bidState.bidder;
    const other = (bidder + 1) % 2;

    if (type === 'pass') {
        logMessage(`${players[bidder].name} passes.`);
        if (bidState.current) {
            resolveContract(bidState.current);
            return;
        }
        // Vorhand passed: second player may bid or pass
        if (bidState.bidder === vorHandIdx) {
            bidState.bidder = other;
            updateStatus(`${players[other].name} bids — Pass or a game?`);
            renderAll();
            if (other === 1) {
                aiThinking = true;
                setTimeout(aiBid, 1200);
            }
            return;
        }
        logMessage('Both players passed — redealing.');
        updateStatus('Both passed. Redealing...');
        setTimeout(() => {
            dealerIdx = (dealerIdx + 1) % 2;
            vorHandIdx = (dealerIdx + 1) % 2;
            startHand();
        }, 1500);
        return;
    }

    const bid = { type, value: BID_VALUE[type], declarer: bidder };
    if (type === 'rufer') {
        bid.called = findCallableTrump(players[bidder].hand);
    }
    bidState.current = bid;
    logMessage(`${players[bidder].name} bids ${BID_NAME[type]}${type === 'rufer' ? ` (calls the ${bid.called})` : ''}.`);

    if (bidState.bidder === vorHandIdx) {
        bidState.bidder = other;
        updateStatus(`${players[other].name} bids — Pass or overbid?`);
        renderAll();
        if (other === 1) {
            aiThinking = true;
            setTimeout(aiBid, 1200);
        }
    } else {
        resolveContract(bid);
    }
}

function resolveContract(bid) {
    contract = bid;
    gamePhase = 'declaring';
    bidState = null;
    logMessage(`${players[bid.declarer].name} plays a ${BID_NAME[bid.type]}${bid.type === 'rufer' ? ` calling the ${bid.called}` : ''}!`);

    const decl = bid.declarer;
    const canDeclarePagat = pagatInfo.owner === decl;
    declarationState = { absolut: false, pagatUltimo: false };

    updateStatus(`Contract: ${BID_NAME[bid.type]}. ${players[decl].name} may declare premiums.`);
    renderAll();

    if (decl === 1) {
        aiThinking = true;
        setTimeout(aiDeclare, 1200);
    }
}

function declarePremium(premium) {
    if (gamePhase !== 'declaring' || !declarationState) return;
    if (players[contract.declarer].isHuman === false) return;
    if (premium === 'absolut') declarationState.absolut = true;
    if (premium === 'pagatUltimo') {
        if (pagatInfo.owner !== contract.declarer) return;
        declarationState.pagatUltimo = true;
    }
    logMessage(`${players[contract.declarer].name} declares ${premium === 'absolut' ? 'Absolut' : 'Pagat Ultimo'}!`);
    renderAll();
}

function endDeclarations() {
    if (gamePhase !== 'declaring') return;
    gamePhase = 'playing';
    currentLeader = vorHandIdx;
    playedThisTrick = [];
    trickCount = 0;
    updateStatus(`${players[currentLeader].name} leads the first trick.`);
    logMessage('Play begins.');
    renderAll();
    startTurn();
}

function startTurn() {
    if (gamePhase !== 'playing') return;
    renderAll();
    const p = players[currentLeader];
    if (!p.isHuman) {
        aiThinking = true;
        setTimeout(aiPlay, 1200);
    } else {
        const led = playedThisTrick.length ? playedThisTrick[0].card : null;
        updateStatus(led
            ? `Your turn! Follow suit or trump.`
            : `Your turn! Lead a card.`);
    }
}

// ---------- Card play ----------

function legalMoves(idx, ledCard) {
    const hand = players[idx].hand;
    const farbenSolo = contract && contract.type === 'farbensolo';

    if (!ledCard) return hand.slice();

    if (farbenSolo) {
        if (ledCard.type === 'tarock') {
            const tarocks = hand.filter(c => c.type === 'tarock');
            return tarocks.length ? tarocks : hand.slice();
        }
        const following = hand.filter(c => c.type === 'suit' && c.suit === ledCard.suit);
        if (following.length) return following;
        const suits = hand.filter(c => c.type === 'suit');
        if (suits.length) return suits; // may not play tarock while holding suit cards
        return hand.slice();
    }

    if (ledCard.type === 'suit') {
        const following = hand.filter(c => c.type === 'suit' && c.suit === ledCard.suit);
        if (following.length) return following;
        const tarocks = hand.filter(c => c.type === 'tarock');
        if (tarocks.length) return tarocks; // Trumpfzwang
        return hand.slice();
    }

    const tarocks = hand.filter(c => c.type === 'tarock');
    return tarocks.length ? tarocks : hand.slice();
}

function playCard(playerIdx, cardIdx) {
    if (gamePhase !== 'playing') return;
    if (aiThinking) return;
    if (trickResolving) return;
    if (currentLeader !== playerIdx) return;

    const led = playedThisTrick.length ? playedThisTrick[0].card : null;
    const card = players[playerIdx].hand[cardIdx];
    if (!card) return;

    const legal = legalMoves(playerIdx, led);
    if (!legal.some(c => c === card)) {
        if (led && led.type === 'suit') {
            updateStatus('You must follow suit or play a tarock!');
        } else {
            updateStatus('You must play a tarock here!');
        }
        return;
    }

    players[playerIdx].hand.splice(cardIdx, 1);
    playedThisTrick.push({ card, player: playerIdx });

    // Pagat tracking
    if (card.label === 'I') {
        if (trickCount < 19) pagatInfo.playedEarly = true;
        pagatInfo.lastPlayed = trickCount === 19;
    }

    logMessage(`${players[playerIdx].name} plays ${cardDisplay(card)}.`);
    updateStatus(`${players[playerIdx].name} played ${cardDisplay(card)}...`);

    // Mondfang tracking
    const otherCard = playedThisTrick.find(x => x.player !== playerIdx);
    if (otherCard && card.label === 'Sküs' && otherCard.card.label === 'XXI') {
        mondCaughtBy = playerIdx;
    } else if (otherCard && otherCard.card.label === 'Sküs' && card.label === 'XXI') {
        mondCaughtBy = otherCard.player;
    }

    renderAll();

    if (playedThisTrick.length === 2) {
        trickResolving = true;
        setTimeout(resolveTrick, 1100);
    } else {
        currentLeader = (playerIdx + 1) % 2;
        if (players[currentLeader].isHuman) {
            startTurn();
        } else {
            aiThinking = true;
            setTimeout(aiPlay, 1200);
        }
    }
}

function resolveTrick() {
    trickResolving = false;
    const [c1, c2] = playedThisTrick;
    let winner;

    if (contract.type === 'farbensolo') {
        if (c1.card.type === 'tarock') {
            winner = c2.card.type === 'tarock' && c2.card.rank > c1.card.rank ? c2.player : c1.player;
        } else {
            const followed = c2.card.type === 'suit' && c2.card.suit === c1.card.suit;
            winner = followed && c2.card.suitRank > c1.card.suitRank ? c2.player : c1.player;
        }
    } else if (c1.card.type === 'tarock' || c2.card.type === 'tarock') {
        if (c1.card.type === 'tarock' && c2.card.type === 'tarock') {
            winner = c2.card.rank > c1.card.rank ? c2.player : c1.player;
        } else {
            winner = c1.card.type === 'tarock' ? c1.player : c2.player;
        }
    } else {
        // Both suit cards (c1 is the led card)
        const followed = c2.card.suit === c1.card.suit;
        winner = followed && c2.card.suitRank > c1.card.suitRank ? c2.player : c1.player;
    }

    const trickCards = [c1.card, c2.card];
    players[winner].tricks.push(...trickCards);
    trickCount++;
    playedThisTrick = [];

    const wonByPagat = trickCards.some(c => c.label === 'I') && winner === pagatInfo.owner;
    if (trickCount === 20 && pagatInfo.owner !== -1) {
        pagatInfo.lastPlayed = trickCards.some(c => c.label === 'I');
        pagatInfo.lastWon = wonByPagat;
    }

    logMessage(`${players[winner].name} wins trick ${trickCount}.`);
    updateStatus(`${players[winner].name} wins the trick!`);

    if (trickCount === 20) {
        trickResolving = true;
        setTimeout(handOver, 1400);
        return;
    }

    currentLeader = winner;
    renderAll();
    startTurn();
}

// ---------- End of hand / scoring ----------

function handOver() {
    gamePhase = 'finished';
    trickResolving = false;
    players.forEach((p, i) => {
        p.points = p.tricks.reduce((s, c) => s + c.points, 0);
    });

    const declarer = contract.declarer;
    const opponent = (declarer + 1) % 2;
    const soloMult = contract.type === 'solo' ? 2 : 1;
    const breakdown = [];
    let net = 0;

    const declarerWon = players[declarer].points >= 45;
    let base = contract.value * (declarerWon ? 1 : -1);
    breakdown.push(`Contract (${BID_NAME[contract.type]}): ${declarerWon ? '+' : '−'}${contract.value}`);
    net += base;

    // Material premiums (opening hand)
    if (trullHolder !== -1) {
        const gain = 1 * soloMult;
        breakdown.push(`Trull: +${gain} ${players[trullHolder].name}`);
        net += (trullHolder === declarer ? 1 : -1) * gain;
    }
    if (kings4Holder !== -1) {
        const gain = 2 * soloMult;
        breakdown.push(`4 Könige: +${gain} ${players[kings4Holder].name}`);
        net += (kings4Holder === declarer ? 1 : -1) * gain;
    }

    // Mondfang
    if (mondCaughtBy !== -1) {
        const gain = 1 * soloMult;
        breakdown.push(`Mond gefangen: +${gain} ${players[mondCaughtBy].name}`);
        net += (mondCaughtBy === declarer ? 1 : -1) * gain;
    }

    // Pagat Ultimo
    const pagatOwner = pagatInfo.owner;
    if (pagatOwner !== -1) {
        if (declarationState.pagatUltimo && pagatOwner === declarer) {
            const success = pagatInfo.lastPlayed && pagatInfo.lastWon;
            const gain = 2 * soloMult * (success ? 1 : -1);
            breakdown.push(`Pagat Ultimo (declared): ${success ? '+' : '−'}${2 * soloMult}`);
            net += gain;
        } else {
            if (pagatInfo.lastPlayed && pagatInfo.lastWon) {
                const gain = 1 * soloMult;
                breakdown.push(`Pagat Ultimo (silent): +${gain} ${players[pagatOwner].name}`);
                net += (pagatOwner === declarer ? 1 : -1) * gain;
            } else if (pagatInfo.lastPlayed && !pagatInfo.lastWon) {
                const gain = 1 * soloMult;
                breakdown.push(`Pagat Ultimo (silent, lost): −${gain} ${players[pagatOwner].name}`);
                net += (pagatOwner === declarer ? -1 : 1) * gain;
            }
        }
    }

    // Absolut: a side held to <= 32 points
    const opponentAbsolut = players[opponent].points <= 32;
    const declarerAbsolut = players[declarer].points <= 32;
    if (declarationState.absolut) {
        const success = opponentAbsolut;
        const gain = 2 * soloMult * (success ? 1 : -1);
        breakdown.push(`Absolut (declared): ${success ? '+' : '−'}${2 * soloMult}`);
        net += gain;
    } else {
        if (opponentAbsolut) {
            const gain = 1 * soloMult;
            breakdown.push(`Absolut: +${gain} ${players[declarer].name}`);
            net += gain;
        } else if (declarerAbsolut) {
            const gain = 1 * soloMult;
            breakdown.push(`Absolut: +${gain} ${players[opponent].name}`);
            net -= gain;
        }
    }

    // Valat: declarer won all 20 tricks
    if (players[declarer].tricks.length === 20) {
        const gain = 6 * soloMult;
        breakdown.push(`Valat: +${gain}`);
        net += gain;
    }

    matchScore[declarer] += net;
    matchScore[opponent] -= net;

    logMessage(`--- ${players[declarer].name}: ${players[declarer].points} pts, ${players[opponent].name}: ${players[opponent].points} pts ---`);
    breakdown.forEach(b => logMessage(`  ${b}`));

    if (Math.abs(matchScore[declarer]) >= MATCH_TARGET) {
        matchOver = true;
        gamePhase = 'finished';
        const winner = matchScore[declarer] > 0 ? declarer : opponent;
        updateStatus(`🏆 MATCH OVER! ${players[winner].name} reaches ±${MATCH_TARGET} points (${matchScore[0]}:${matchScore[1]}). New Game for another match.`);
    } else {
        updateStatus(`Hand over: ${players[declarer].name} ${declarerWon ? 'wins' : 'loses'} the ${BID_NAME[contract.type]}. Match: ${matchScore[0]} : ${matchScore[1]} (first to ±${MATCH_TARGET}).`);
    }
    renderAll();
}

function nextHand() {
    if (gamePhase !== 'finished' || matchOver) return;
    dealerIdx = (dealerIdx + 1) % 2;
    vorHandIdx = (dealerIdx + 1) % 2;
    startHand();
}

// ---------- AI ----------

function aiBid() {
    aiThinking = false;
    if (gamePhase !== 'bidding') return;
    const idx = 1;
    const hand = players[1].hand;
    const evalBid = evaluateHand(hand);

    const opponentBid = bidState.current;

    if (opponentBid) {
        if (opponentBid.type === 'rufer' && evalBid.best === 'solo') {
            placeBid('solo');
            return;
        }
        if (opponentBid.type === 'rufer' && evalBid.best === 'farbensolo') {
            placeBid('farbensolo');
            return;
        }
        if (opponentBid.type === 'farbensolo' && evalBid.best === 'solo') {
            placeBid('solo');
            return;
        }
        placeBid('pass');
        return;
    }

    if (evalBid.best === 'solo') placeBid('solo');
    else if (evalBid.best === 'farbensolo') placeBid('farbensolo');
    else if (evalBid.best === 'rufer') placeBid('rufer');
    else placeBid('pass');
}

function evaluateHand(hand) {
    const points = hand.reduce((s, c) => s + c.points, 0);
    const tarocks = hand.filter(c => c.type === 'tarock');
    const trull = tarocks.filter(c => c.isTrull).length;
    const suitCards = hand.length - tarocks.length;

    if (tarocks.length >= 8 && (points >= 36 || trull >= 2)) return { best: 'solo', points, tarocks: tarocks.length };
    if (suitCards >= 6 && points <= 28) return { best: 'farbensolo', points, tarocks: tarocks.length };
    if (points >= 30 && tarocks.length >= 5) return { best: 'rufer', points, tarocks: tarocks.length };
    return { best: 'pass', points, tarocks: tarocks.length };
}

function aiDeclare() {
    aiThinking = false;
    if (gamePhase !== 'declaring') return;
    const hand = players[1].hand;
    const points = hand.reduce((s, c) => s + c.points, 0);
    const tarocks = hand.filter(c => c.type === 'tarock').length;

    if (pagatInfo.owner === 1 && tarocks >= 6) declarationState.pagatUltimo = true;
    if (points >= 42) declarationState.absolut = true;

    if (declarationState.pagatUltimo || declarationState.absolut) {
        const d = [];
        if (declarationState.pagatUltimo) d.push('Pagat Ultimo');
        if (declarationState.absolut) d.push('Absolut');
        logMessage(`AI declares ${d.join(' and ')}!`);
    }
    endDeclarations();
}

function aiPlay() {
    aiThinking = false;
    if (gamePhase !== 'playing') return;
    if (currentLeader !== 1) return;

    const hand = players[1].hand;
    const led = playedThisTrick.length ? playedThisTrick[0].card : null;
    let options = legalMoves(1, led);

    let pick;
    if (!led) {
        pick = aiChooseLead();
    } else {
        pick = aiChooseFollow(led, options);
    }

    const idx = hand.indexOf(pick);
    if (idx === -1) return;
    playCard(1, idx);
}

function aiChooseLead() {
    const hand = players[1].hand;
    const opponentCards = players[0].hand.length;
    const isLastTrick = trickCount === 19;
    const wantPagatUltimo = declarationState.pagatUltimo || (pagatInfo.owner === 1 && !pagatInfo.playedEarly);

    // Pagat Ultimo: on the last trick, lead the Pagat if it can win (no higher tarocks left)
    if (isLastTrick && wantPagatUltimo && pagatInfo.owner === 1) {
        const pagat = hand.find(c => c.label === 'I');
        if (pagat) {
            const higherLeft = TRUMP_ORDER.filter(t => TRUMP_RANKS[t] > 1 && t !== 'I' && !playedTarocks().includes(t));
            if (higherLeft.length === 0 && opponentCards <= 1) return pagat;
        }
    }

    // Dump 0-point cards first (Glatzen, low tarocks), keeping Pagat/XXI/Sküs and top trumps
    const dumpCandidates = hand.filter(c => c.points === 0 && c.label !== 'I');
    if (dumpCandidates.length) {
        const glatze = dumpCandidates.filter(c => c.type === 'suit');
        return glatze.length ? glatze[0] : dumpCandidates[0];
    }

    // Then lowest card of the longest suit (dump long suits' weak cards)
    let bestSuit = null;
    let bestCount = 0;
    SUITS.forEach(s => {
        const count = hand.filter(c => c.type === 'suit' && c.suit === s).length;
        if (count > bestCount) { bestCount = count; bestSuit = s; }
    });
    if (bestSuit) {
        const suitCards = hand.filter(c => c.type === 'suit' && c.suit === bestSuit);
        const weakest = suitCards.reduce((a, b) => (b.rank < a.rank ? b : a));
        if (weakest.rank < 3) return weakest; // lead weak cards of long suits
    }

    // Otherwise lead the lowest tarock (but keep Trull and top trumps)
    const lowTarocks = hand.filter(c => c.type === 'tarock' && !c.isTrull && c.rank < 18);
    if (lowTarocks.length) {
        const lowest = lowTarocks.reduce((a, b) => (b.rank < a.rank ? b : a));
        return lowest;
    }

    // Last resort: any low card except Sküs/XXI (keep them for Mondfang / control)
    const playable = hand.filter(c => c.label !== 'Sküs' && c.label !== 'XXI' && c.label !== 'I');
    if (playable.length) return playable[0];
    return hand[hand.length - 1];
}

function aiChooseFollow(led, options) {
    const hand = players[1].hand;
    const isLastTrick = trickCount === 19;
    const iAmDeclarer = contract.declarer === 1;
    const wantPagatUltimo = declarationState.pagatUltimo || (pagatInfo.owner === 1 && !pagatInfo.playedEarly);

    // Mondfang: Sküs catches the Mond
    if (led.label === 'XXI') {
        const skus = hand.find(c => c.label === 'Sküs');
        if (skus) return skus;
    }

    // Avoid playing the Pagat before the last trick (Pagat Ultimo protection)
    let candidates = options.filter(c => !(c.label === 'I' && !isLastTrick && wantPagatUltimo));

    // Avoid throwing the Mond under the Sküs (Mondfang risk)
    const skusStillOut = !playedTarocks().includes('Sküs');
    candidates = candidates.filter(c => !(c.label === 'XXI' && skusStillOut));

    // Avoid dumping the Sküs needlessly
    candidates = candidates.filter(c => c.label !== 'Sküs' || candidates.length === 1);

    if (candidates.length === 0) candidates = options;

    // Last trick + Pagat: win with the Pagat if possible
    if (isLastTrick && pagatInfo.owner === 1) {
        const pagat = candidates.find(c => c.label === 'I');
        if (pagat) {
            const canWin = led.type === 'suit'; // a tarock lead can never be beaten by the Pagat
            if (canWin) return pagat;
            if (options.some(c => c.label === 'I') && candidates.length === 1) return pagat; // forced
        }
    }

    // Prefer the lowest card that loses the trick (keep strength), but if the trick is cheap and winning is useful, take it
    const ledRank = led.rank;
    const canWin = c => (led.type === 'tarock' ? c.rank > led.rank : c.type === 'tarock' || c.suitRank > led.suitRank);
    const winners = candidates.filter(canWin);

    if (iAmDeclarer && players[0].tricks.length >= 5 && winners.length) {
        // Declarer behind: take winning tricks with the cheapest winner
        return winners.reduce((a, b) => (b.rank < a.rank ? b : a));
    }

    // Default: cheapest card (by points then rank) that does NOT win
    const losers = candidates.filter(c => !canWin(c));
    const pool = losers.length ? losers : candidates;
    return pool.reduce((a, b) => {
        const av = a.points * 10 + a.rank, bv = b.points * 10 + b.rank;
        return bv < av ? b : a;
    });
}

function playedTarocks() {
    const played = [];
    players.forEach(p => p.tricks.forEach(c => { if (c.type === 'tarock') played.push(c.label); }));
    return played;
}

// ---------- Rendering ----------

function renderAll() {
    renderPlayerHand();
    renderAIHand();
    renderPlayedCards();
    renderBidding();
    renderDeclarations();
    renderScores();
}

function renderPlayerHand() {
    const el = document.getElementById('playerHand');
    el.innerHTML = '';
    if (!players.length) return;
    const led = playedThisTrick.length ? playedThisTrick[0].card : null;
    const legal = (gamePhase === 'playing' && currentLeader === 0 && !aiThinking && !trickResolving)
        ? legalMoves(0, led) : [];
    players[0].hand.forEach((card, index) => {
        const cardEl = createCardElement(card);
        if (legal.some(c => c === card)) {
            cardEl.onclick = () => playCard(0, index);
            cardEl.classList.add('clickable');
        }
        el.appendChild(cardEl);
    });
    if (!players[0].hand.length) {
        el.innerHTML = '<div style="color:#888; padding:10px;">No cards</div>';
    }
}

function renderAIHand() {
    const el = document.getElementById('aiHand');
    el.innerHTML = '';
    if (!players.length) return;
    players[1].hand.forEach(() => {
        const cardEl = document.createElement('div');
        cardEl.className = 'tarock-card back';
        cardEl.textContent = '🂠';
        el.appendChild(cardEl);
    });
    if (!players[1].hand.length) {
        el.innerHTML = '<div style="color:#888; padding:10px;">No cards</div>';
    }
}

function renderPlayedCards() {
    const el = document.getElementById('playArea');
    el.innerHTML = '';
    if (!playedThisTrick.length) {
        el.innerHTML = '<div style="color:#999;">—</div>';
        return;
    }
    const order = [0, 1];
    order.forEach(idx => {
        const played = playedThisTrick.find(p => p.player === idx);
        if (!played) return;
        const wrap = document.createElement('div');
        wrap.className = 'played-wrap';
        const label = document.createElement('div');
        label.className = 'played-label';
        label.textContent = players[idx].name + (idx === 1 ? ' (AI)' : '');
        wrap.appendChild(label);
        wrap.appendChild(createCardElement(played.card));
        el.appendChild(wrap);
    });
}

function createCardElement(card) {
    const div = document.createElement('div');
    div.className = 'tarock-card';
    if (card.type === 'tarock') {
        div.classList.add('trump');
        if (card.isTrull) div.classList.add('trull');
        div.innerHTML = `<div class="card-value">${card.label}</div>`;
        if (card.points) div.innerHTML += `<div class="card-points">${card.points}</div>`;
    } else {
        const red = card.suit === '♥' || card.suit === '♦';
        div.classList.add('suit');
        div.style.color = red ? '#C62828' : '#1a1a1a';
        div.innerHTML = `
            <div class="card-value">${card.label}</div>
            <div class="card-suit" style="color: ${red ? '#C62828' : '#1a1a1a'};">${card.suit}</div>
            ${card.points ? `<div class="card-points">${card.points}</div>` : ''}
        `;
    }
    return div;
}

function renderBidding() {
    const panel = document.getElementById('bidArea');
    const declarePanel = document.getElementById('declareArea');
    if (!panel) return;

    if (gamePhase === 'bidding' && players.length && players[bidState.bidder].isHuman) {
        panel.style.display = 'block';
        const p = players[0];
        const canRufer = canBidRufer(0);
        const canFarben = canBidFarbensolo(0);
        const ruferBtn = document.getElementById('bidRufer');
        const farbenBtn = document.getElementById('bidFarbensolo');
        const soloBtn = document.getElementById('bidSolo');
        ruferBtn.disabled = !canRufer;
        farbenBtn.disabled = !canFarben;
        if (bidState.current && BID_RANK[bidState.current.type] >= 1) {
            // Rufer may be overbid by Farbensolo/Solo; Farbensolo by Solo only
            ruferBtn.disabled = true;
        }
        if (bidState.current && BID_RANK[bidState.current.type] >= 2) {
            farbenBtn.disabled = true;
        }
        if (bidState.current && BID_RANK[bidState.current.type] >= 3) {
            soloBtn.disabled = true;
        }
        document.getElementById('bidHint').textContent = bidState.current
            ? `Opponent bids ${BID_NAME[bidState.current.type]} — overbid or pass.`
            : `You are ${vorHandIdx === 0 ? 'Vorhand' : 'second'} — bid or pass.`;
        declarePanel.style.display = 'none';
    } else if (gamePhase === 'declaring' && players.length && players[contract.declarer].isHuman) {
        panel.style.display = 'none';
        declarePanel.style.display = 'block';
        const pagatBtn = document.getElementById('declPagat');
        pagatBtn.disabled = pagatInfo.owner !== 0;
        document.getElementById('contractLabel').textContent = BID_NAME[contract.type];
    } else {
        panel.style.display = 'none';
        declarePanel.style.display = 'none';
    }

    const nextBtn = document.getElementById('nextHandBtn');
    if (nextBtn) {
        nextBtn.style.display = (gamePhase === 'finished' && !matchOver) ? 'inline-block' : 'none';
    }
}

function renderDeclarations() {
    const badge = document.getElementById('declarationBadge');
    if (!badge) return;
    if (declarationState && (declarationState.absolut || declarationState.pagatUltimo)) {
        const parts = [];
        if (declarationState.absolut) parts.push('Absolut');
        if (declarationState.pagatUltimo) parts.push('Pagat Ultimo');
        badge.textContent = `Declared: ${parts.join(' + ')}`;
        badge.style.display = 'inline-block';
    } else {
        badge.style.display = 'none';
    }
}

function renderScores() {
    const livePoints = idx => players.length
        ? players[idx].tricks.reduce((s, c) => s + c.points, 0)
        : 0;
    document.getElementById('playerScore').textContent = livePoints(0);
    document.getElementById('aiScore').textContent = livePoints(1);
    document.getElementById('matchScore').textContent = players.length ? `${matchScore[0]} : ${matchScore[1]} (first to ±${MATCH_TARGET})` : '';
    document.getElementById('handInfo').textContent = players.length
        ? `Trick ${Math.min(trickCount + 1, 20)}/20 — ${players[vorHandIdx].name} leads`
        : '';
}

function logMessage(message) {
    const log = document.getElementById('gameLog');
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.textContent = message;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
}

function updateStatus(message) {
    document.getElementById('statusMessage').textContent = message;
}

// Initialize
document.addEventListener('DOMContentLoaded', function () {
    newGame();
});
