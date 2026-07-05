import React, { useState } from 'react';
import './App.css';
import ChessBoard from './components/ChessBoard';
import ToolsExplorer from './components/ToolsExplorer';
import FloatingChat from './components/FloatingChat';
import { apiClient, type SystemStatus } from './utils/mcp_client';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [fen, setFen] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
  const [gameId] = useState("chess_1");
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [backendOnline, setBackendOnline] = useState(false);
  const [startingEngines, setStartingEngines] = useState(false);
  const [engineOutput, setEngineOutput] = useState<string | null>(null);

  React.useEffect(() => {
    const updateStatus = async () => {
      try {
        const status = await apiClient.getStatus();
        setSystemStatus(status);
        setBackendOnline(true);
      } catch {
        setBackendOnline(false);
      }
    };

    updateStatus();
    const interval = setInterval(updateStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleStartEngines = async () => {
    setStartingEngines(true);
    setEngineOutput(null);
    try {
      const res = await apiClient.startEngines();
      setEngineOutput(res.stdout || res.stderr || "Started (no output)");
    } catch (e: any) {
      setEngineOutput(`Error: ${e.message}`);
    } finally {
      setStartingEngines(false);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'multiplayer', label: 'Multiplayer', icon: '🌐' },
    { id: 'kibitzer', label: 'Chess Kibitzer', icon: '♟' },
    { id: 'tools', label: 'MCP Tools', icon: '🛠' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
    { id: 'help', label: 'Help', icon: '❓' },
    { id: 'about', label: 'About', icon: 'ℹ️' },
  ];

  return (
    <div className="kibitzer-layout">
      <div className="premium-bg"></div>

      <header className="topbar glass-panel animate-fade-in">
        <div className="logo">
          <span className="logo-icon">🎮</span>
          <h1 className="logo-text">Games MCP <span className="sota-badge">SOTA v2.0</span></h1>
        </div>
        <div className="system-status">
          <span className={`status-indicator ${backendOnline ? 'online' : 'offline'}`}></span>
          <span className="status-text">System: {backendOnline ? 'Online' : 'Offline'}</span>
        </div>
      </header>

      <aside className="sidebar glass-panel animate-fade-in delay-1">
        <nav className="nav-list">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="main-content glass-panel animate-fade-in delay-2">
        {activeTab === 'dashboard' && (
          <div className="dashboard-grid">
            <div className="start-engines-card glass-panel" style={{ gridColumn: '1 / -1' }}>
              <h3>Game Engines</h3>
              <p className="color-secondary mb-12">Start Stockfish, KataGo, YaneuraOu, and other AI game engines.</p>
              <button
                className="premium-button premium-button--large"
                onClick={handleStartEngines}
                disabled={startingEngines}
                data-testid="start-engines"
              >
                {startingEngines ? 'Starting...' : 'Start All Engines'}
              </button>
              {engineOutput && (
                <pre className="engine-output mt-12" style={{ fontSize: 12, maxHeight: 120, overflow: 'auto', color: '#888' }}>
                  {engineOutput}
                </pre>
              )}
            </div>
            <div className="stats-card glass-panel">
              <h3>Backend</h3>
              <div className="stat-value">{systemStatus?.server ?? '--'}</div>
              <div className="stat-trend positive">v{systemStatus?.version ?? '--'}</div>
            </div>
            <div className="stats-card glass-panel">
              <h3>Stockfish</h3>
              <div className="stat-value">{systemStatus?.engines?.stockfish?.url ?? '--'}</div>
              <div className="stat-trend">Port 10780</div>
            </div>
            <div className="stats-card glass-panel">
              <h3>Shogi</h3>
              <div className="stat-value">{systemStatus?.engines?.shogi?.url ?? '--'}</div>
              <div className="stat-trend">Port 10781</div>
            </div>
            <div className="stats-card glass-panel">
              <h3>Go (KataGo)</h3>
              <div className="stat-value">{systemStatus?.engines?.go?.url ?? '--'}</div>
              <div className="stat-trend">Port 10782</div>
            </div>
          </div>
        )}

        {activeTab === 'kibitzer' && (
          <div className="kibitzer-view">
            <div className="view-header">
              <h2>Chess Kibitzer <span className="game-id-tag">#{gameId}</span></h2>
              <div className="actions">
                <input
                  type="text"
                  value={fen}
                  onChange={(e) => setFen(e.target.value)}
                  className="fen-input glass-input"
                  placeholder="FEN String"
                />
                <button className="premium-button">Watch Live</button>
              </div>
            </div>
            <div className="board-container">
              <ChessBoard fen={fen} />
              <div className="game-sidebar glass-panel">
                <div className="info-section">
                  <h4>Players</h4>
                  <div className="player-row">
                    <span className="player-icon white"></span>
                    <div className="player-details">
                      <span className="player-name">Sandra</span>
                      <span className="player-rating">2150</span>
                    </div>
                  </div>
                  <div className="player-row">
                    <span className="player-icon black"></span>
                    <div className="player-details">
                      <span className="player-name">DeepMind AI</span>
                      <span className="player-rating">2850</span>
                    </div>
                  </div>
                </div>

                <div className="info-section">
                  <h4>Analysis</h4>
                  <div className="analysis-summary">
                    <div className="eval-bar-container">
                      <div className="eval-bar">
                        <div className="eval-fill eval-fill-dynamic" style={{ '--eval-height': '52%' } as React.CSSProperties}></div>
                        <span className="eval-value">+0.4</span>
                      </div>
                    </div>
                    <div className="analysis-text">
                      <p className="engine-msg">Calculating... (d=18)</p>
                      <p className="best-move">Best move: <span className="move-highlight">e2e4</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'multiplayer' && (
          <div className="multiplayer-lobby fade-in">
            <div className="view-header">
              <h3>Game Lobby</h3>
              <button className="premium-button">Create New Game</button>
            </div>
            <div className="dashboard-grid mt-24">
              <div className="glass-card stats-card">
                <span className="stat-label">Backend</span>
                <span className="stat-value">{backendOnline ? 'Online' : 'Offline'}</span>
                <span className="stat-trend positive">FastAPI + FastMCP</span>
              </div>
              <div className="glass-card stats-card">
                <span className="stat-label">Version</span>
                <span className="stat-value">{systemStatus?.version ?? '--'}</span>
                <span className="stat-trend">Firebase Realtime Sync</span>
              </div>
            </div>
            <div className="glass-card mt-24 p-24">
              <h4>Active Remote Sessions</h4>
              <p className="color-secondary mb-12">Connect with players worldwide via our dedicated Firebase cluster.</p>
              <div className="tools-list">
                <div className="tool-item">
                  <strong>Session_EU_78</strong> - ♟ Chess (2/2 Players)
                </div>
                <div className="tool-item">
                  <strong>Session_WW_92</strong> - 🏮 Shogi (1/2 Players)
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tools' && (
          <ToolsExplorer />
        )}

        {activeTab === 'settings' && (
          <div className="settings-view fade-in">
            <h3>System Settings</h3>
            <div className="glass-card mt-24 p-32 settings-group">
              <div className="setting-group">
                <label>MCP Bridge URL</label>
                <input type="text" id="bridge-url" className="glass-input w-full mt-8" value="http://localhost:10987" readOnly title="MCP Bridge URL" />
              </div>
              <div className="setting-group">
                <label>Polling Interval (ms)</label>
                <input type="number" id="polling-interval" className="glass-input w-full mt-8" value="5000" readOnly title="Polling Interval (ms)" />
              </div>
              <div className="setting-group">
                <label>Engine Depth</label>
                <select id="engine-depth" className="glass-input w-full mt-8" title="Engine Depth">
                  <option>Standard (12)</option>
                  <option>Deep (18)</option>
                  <option>Extreme (24)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'help' && (
          <div className="placeholder-view">
            <h2>Help & Documentation</h2>
            <p>Learn how to use the Games MCP Platform.</p>
            <div className="doc-grid">
              <div className="doc-card glass-panel">
                <h4>Kibitzer Mode</h4>
                <p>Paste a FEN string to analyze any board position using high-fidelity engines (Stockfish/Yaneuraou).</p>
              </div>
              <div className="doc-card glass-panel">
                <h4>Multiplayer P2P</h4>
                <p>Non-local sessions are now mirrored via Firebase. Start a game to generate a global Session ID for worldwide play.</p>
              </div>
              <div className="doc-card glass-panel">
                <h4>Engine Ports</h4>
                <p>Standardized SOTA ports: Chess (10780), Shogi (10781), Go (10782).</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="about-view fade-in">
            <h3>About Games MCP</h3>
            <div className="glass-card mt-24 p-32">
              <p><strong>Version:</strong> 2.0.4-SOTA</p>
              <p className="mt-24 color-secondary lh-1-6">
                The Games MCP server is a state-of-the-art platform for algorithmic game analysis,
                coaching, and decentralized multiplayer coordination. Built on the Model Context Protocol,
                it enables seamless integration between AI models and complex game engines like Stockfish.
              </p>
              <div className="about-meta mt-24 gap-12">
                <span className="sota-badge">MATERIALIST</span>
                <span className="sota-badge">REDUCTIONIST</span>
                <span className="sota-badge">VIENNA-ALSERGRUND</span>
              </div>
            </div>
          </div>
        )}
      </main>
      <FloatingChat />
    </div>
  );
};

export default App;
