/**
 * Game Replay & Save — shared module for all games.
 * Include: <script src="/js/game-replay.js"></script>
 *
 * Usage:
 *   GameReplay.init('checkers', moveHistory, {
 *     replayMove: (m) => makeMove(m.fromRow, m.fromCol, m.toRow, m.toCol),
 *     serialize:   (m) => ({fromRow:m.fromRow, fromCol:m.fromCol, toRow:m.toRow, toCol:m.toCol}),
 *     newGame:     () => newGame(),
 *     onSave:      () => {},    // extra callback after save
 *     onUndo:      () => {},    // extra callback after undo
 *     onReady:     () => {},    // called on page load if no saved game
 *   });
 */

const GameReplay = (() => {
  const STORE = {};

  function _key(name) { return name + '-last-game'; }

  function save(name, moves, opts) {
    try {
      const ser = (opts && opts.serialize) || (m => m);
      localStorage.setItem(_key(name), JSON.stringify({
        moves: moves.map(ser),
        ts: Date.now()
      }));
    } catch (_) {}
  }

  function load(name, opts) {
    try {
      const raw = localStorage.getItem(_key(name));
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (!data.moves || !data.moves.length) return false;
      if (!opts || !opts.replayMove) return false;
      // Reset board
      if (opts.newGame) opts.newGame();
      STORE[name] = STORE[name] || {};
      STORE[name]._savingDisabled = true;
      for (const m of data.moves) {
        opts.replayMove(m);
      }
      STORE[name]._savingDisabled = false;
      const btn = document.getElementById('resumeBtn');
      if (btn) btn.style.display = 'inline-block';
      return true;
    } catch (_) { return false; }
  }

  function resume(name, opts) {
    const btn = document.getElementById('resumeBtn');
    if (btn) btn.style.display = 'none';
    return load(name, opts);
  }

  return {
    init(name, moveHistory, opts) {
      STORE[name] = STORE[name] || {};
      // Patch moveHistory.push to auto-save
      const origPush = moveHistory.push;
      const _savingDisabled = () => STORE[name]._savingDisabled;
      moveHistory.push = function(...args) {
        const result = origPush.apply(this, args);
        if (!_savingDisabled()) save(name, moveHistory, opts);
        return result;
      };
      // Expose save for undo callbacks
      STORE[name].saveNow = () => save(name, moveHistory, opts);
      window.resumeGame = () => resume(name, opts);
      // Auto-load after page init
      const tryLoad = () => { if (!load(name, opts) && opts && opts.onReady) opts.onReady(); };
      if (document.readyState === 'complete') tryLoad();
      else window.addEventListener('load', tryLoad);
    },

    saveNow(name, moveHistory, opts) {
      save(name, moveHistory, opts);
    },

    isSavingDisabled(name) {
      return !!(STORE[name] && STORE[name]._savingDisabled);
    },
  };
})();
