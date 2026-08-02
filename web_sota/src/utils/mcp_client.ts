export interface SystemStatus {
    success: boolean;
    server: string;
    version: string;
    engines: {
        stockfish: { url: string };
        shogi: { url: string };
        go: { url: string };
    };
}

interface JsonRpcResponse {
    jsonrpc: string;
    id?: number;
    result?: any;
    error?: { code: number; message: string };
}

/** Parse FastMCP streamable-HTTP responses: plain JSON or SSE `data:` frames. */
function parseMcpResponse(text: string, id: number): any {
    if (text.trim().startsWith('{')) {
        return JSON.parse(text);
    }
    const frames = text
        .split(/\r?\n/)
        .filter((line) => line.startsWith('data: '))
        .map((line) => line.slice(6).trim())
        .filter(Boolean);
    for (const frame of frames) {
        try {
            const parsed = JSON.parse(frame) as JsonRpcResponse;
            if (parsed.id === id) return parsed;
        } catch {
            // ignore malformed frames
        }
    }
    if (frames.length > 0) return JSON.parse(frames[frames.length - 1]);
    throw new Error(`Unparseable MCP response: ${text.slice(0, 200)}`);
}

class GamesAPIClient {
    private baseUrl: string;
    private mcpUrl: string;
    private sessionId: string | null = null;

    constructor(port: number = 10987) {
        // 127.0.0.1 (not localhost) to match the Tauri CSP connect-src allowlist.
        // Trailing slash REQUIRED: Starlette mounts match only with it (mount regex ^/mcp/).
        this.baseUrl = `http://127.0.0.1:${port}`;
        this.mcpUrl = `${this.baseUrl}/mcp/`;
    }

    private async mcpRequest(method: string, params: Record<string, unknown> = {}): Promise<JsonRpcResponse> {
        const id = Date.now();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            Accept: 'application/json, text/event-stream',
        };
        if (this.sessionId) headers['Mcp-Session-Id'] = this.sessionId;

        let response = await fetch(this.mcpUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify({ jsonrpc: '2.0', id, method, params }),
        });
        if (response.status === 400 && this.sessionId) {
            // Stale session (server restarted) — re-initialize once and retry.
            this.sessionId = null;
            await this.initialize();
            headers['Mcp-Session-Id'] = this.sessionId!;
            response = await fetch(this.mcpUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify({ jsonrpc: '2.0', id, method, params }),
            });
        }
        if (!response.ok) throw new Error(`HTTP ${response.status} from /mcp/`);
        return parseMcpResponse(await response.text(), id);
    }

    async initialize(): Promise<void> {
        const id = Date.now();
        const response = await fetch(this.mcpUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id,
                method: 'initialize',
                params: {
                    protocolVersion: '2025-11-25',
                    capabilities: {},
                    clientInfo: { name: 'ai-games-collectionboard', version: '2.5.0' },
                },
            }),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status} during MCP initialize`);
        this.sessionId = response.headers.get('Mcp-Session-Id') || this.sessionId;
        parseMcpResponse(await response.text(), id);
    }

    private async ensureSession(): Promise<void> {
        if (!this.sessionId) await this.initialize();
    }

    async getStatus(): Promise<SystemStatus> {
        const response = await fetch(`${this.baseUrl}/api/v1/status`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
    }

    async getHealth(): Promise<{ status: string; service: string }> {
        const response = await fetch(`${this.baseUrl}/health`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
    }

    async startEngines(): Promise<{ success: boolean; exit_code: number; stdout: string; stderr: string }> {
        const response = await fetch(`${this.baseUrl}/api/v1/start-engines`, { method: 'POST' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
    }

    async dockerUp(): Promise<{ success: boolean; exit_code: number; stdout: string; stderr: string }> {
        const response = await fetch(`${this.baseUrl}/api/v1/docker-up`, { method: 'POST' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
    }

    async dockerDown(): Promise<{ success: boolean; exit_code: number; stdout: string; stderr: string }> {
        const response = await fetch(`${this.baseUrl}/api/v1/docker-down`, { method: 'POST' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
    }

    async listTools(): Promise<Array<{ name: string; description?: string; inputSchema?: any }>> {
        await this.ensureSession();
        const data = await this.mcpRequest('tools/list');
        if (data.error) throw new Error(data.error.message);
        return data.result?.tools ?? [];
    }

    async callMCPTool(name: string, args: Record<string, unknown> = {}): Promise<any> {
        await this.ensureSession();
        const data = await this.mcpRequest('tools/call', { name, arguments: args });
        if (data.error) throw new Error(data.error.message);
        return data.result;
    }

    async callTool(name: string, args: Record<string, unknown> = {}): Promise<any> {
        return this.callMCPTool(name, args);
    }
}

export const apiClient = new GamesAPIClient();
// Legacy alias
export const mcpClient = apiClient;
