export interface MCPResponse {
    jsonrpc: string;
    id: number | string;
    result?: any;
    error?: {
        code: number;
        message: string;
        data?: any;
    };
}

export class GamesMCPClient {
    private baseUrl: string;

    constructor(port: number = 10741) {
        this.baseUrl = `http://localhost:${port}`;
    }

    async callTool(name: string, args: any = {}): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/tools/${name}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(args),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error calling tool ${name}:`, error);
            throw error;
        }
    }

    async listTools(): Promise<any[]> {
        try {
            const response = await fetch(`${this.baseUrl}/tools`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error listing tools:', error);
            return [];
        }
    }

    async getResources(): Promise<any[]> {
        try {
            const response = await fetch(`${this.baseUrl}/resources`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error listing resources:', error);
            return [];
        }
    }
}

export const mcpClient = new GamesMCPClient();
