const fs = require('fs');
const path = require('path');
const os = require('os');

const CONFIG_TARGETS = {
    claude: {
        name: "Claude Desktop",
        path: path.join(os.homedir(), 'AppData', 'Roaming', 'Claude', 'claude_desktop_config.json'),
        type: "mcp_config"
    },
    windsurf: {
        name: "Windsurf",
        path: path.join(os.homedir(), 'AppData', 'Roaming', 'Windsurf', 'mcp_config.json'),
        type: "mcp_config"
    },
    cursor: {
        name: "Cursor",
        path: path.join(os.homedir(), 'AppData', 'Roaming', 'Cursor', 'User', 'globalStorage', 'cursor-storage', 'mcp_config.json'),
        type: "mcp_config"
    },
    antigravity: {
        name: "Antigravity",
        path: path.join(os.homedir(), '.gemini', 'antigravity', 'mcp_config.json'),
        type: "mcp_config"
    },
    zed: {
        name: "Zed/Zen",
        path: path.join(os.homedir(), 'AppData', 'Roaming', 'Zed', 'settings.json'),
        type: "zed_settings"
    }
};

/**
 * Robust multi-IDE MCP installer with backup and revert.
 */
function installMultiMcp(targets = Object.keys(CONFIG_TARGETS)) {
    const results = [];
    const rootDir = path.join(__dirname, '..');

    targets.forEach(key => {
        const target = CONFIG_TARGETS[key];
        if (!target) return;

        try {
            const configPath = target.path;

            // Ensure directory exists
            if (!fs.existsSync(path.dirname(configPath))) {
                fs.mkdirSync(path.dirname(configPath), { recursive: true });
            }

            // Read or create config
            let config = {};
            if (fs.existsSync(configPath)) {
                // Backup before touching
                fs.copyFileSync(configPath, `${configPath}.bak`);
                try {
                    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                } catch (e) {
                    console.error(`[MCP-INSTALLER] Corrupt JSON in ${target.name}, starting fresh.`);
                    config = {};
                }
            }

            // Inject configuration based on type
            const mcpPackageRoot = path.join(rootDir, 'games-mcp', 'src');
            if (target.type === "mcp_config") {
                if (!config.mcpServers) config.mcpServers = {};
                config.mcpServers["games-collection"] = {
                    command: "python",
                    args: ["-m", "games_mcp.mcp_server"],
                    env: {
                        "PYTHONPATH": mcpPackageRoot,
                        "GAMES_APP_ROOT": rootDir
                    }
                };
            } else if (target.type === "zed_settings") {
                // Zed uses a different structure
                if (!config.context_servers) config.context_servers = {};
                config.context_servers["games-collection"] = {
                    command: "python",
                    args: ["-m", "games_mcp.mcp_server"],
                    env: {
                        "PYTHONPATH": mcpPackageRoot,
                        "GAMES_APP_ROOT": rootDir
                    }
                };
            }

            // Atomic write
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            results.push({ name: target.name, success: true, path: configPath });
        } catch (error) {
            results.push({ name: target.name, success: false, error: error.message });
        }
    });

    return results;
}

/**
 * Reverts the configuration for the specified IDEs using .bak files.
 */
function revertMultiMcp(targets = Object.keys(CONFIG_TARGETS)) {
    const results = [];

    targets.forEach(key => {
        const target = CONFIG_TARGETS[key];
        if (!target) return;

        const configPath = target.path;
        const backupPath = `${configPath}.bak`;

        try {
            if (fs.existsSync(backupPath)) {
                fs.copyFileSync(backupPath, configPath);
                results.push({ name: target.name, success: true });
            } else {
                results.push({ name: target.name, success: false, error: "No backup found" });
            }
        } catch (error) {
            results.push({ name: target.name, success: false, error: error.message });
        }
    });

    return results;
}

module.exports = { installMultiMcp, revertMultiMcp };
