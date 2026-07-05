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

class GamesAPIClient {
    private baseUrl: string;

    constructor(port: number = 10987) {
        this.baseUrl = `http://localhost:${port}`;
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

    async listTools(): Promise<Array<{ name: string; description?: string }>> {
        const response = await fetch(`${this.baseUrl}/mcp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: Date.now(),
                method: 'tools/list',
            }),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        return data?.result?.tools ?? [];
    }

    async callMCPTool(name: string, args: Record<string, unknown> = {}): Promise<unknown> {
        const response = await fetch(`${this.baseUrl}/mcp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: Date.now(),
                method: 'tools/call',
                params: { name, arguments: args },
            }),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
    }

    async callTool(name: string, args: Record<string, unknown> = {}): Promise<unknown> {
        return this.callMCPTool(name, args);
    }
}

export const apiClient = new GamesAPIClient();
// Legacy alias
export const mcpClient = apiClient;
