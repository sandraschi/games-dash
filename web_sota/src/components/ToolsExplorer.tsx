import React, { useState, useEffect } from 'react';
import { mcpClient } from '../utils/mcp_client';

interface Tool {
    name: string;
    description?: string;
    inputSchema?: any;
}

const ToolsExplorer: React.FC = () => {
    const [tools, setTools] = useState<Tool[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
    const [args, setArgs] = useState<string>('{}');
    const [result, setResult] = useState<any>(null);
    const [executing, setExecuting] = useState(false);

    useEffect(() => {
        const fetchTools = async () => {
            try {
                const toolList = await mcpClient.listTools();
                setTools(toolList);
            } catch (error) {
                console.error('Failed to fetch tools:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTools();
    }, []);

    const handleExecute = async () => {
        if (!selectedTool) return;
        setExecuting(true);
        setResult(null);
        try {
            const parsedArgs = JSON.parse(args);
            const output = await mcpClient.callTool(selectedTool.name, parsedArgs);
            setResult(output);
        } catch (error) {
            setResult({ error: String(error) });
        } finally {
            setExecuting(false);
        }
    };

    if (loading) return <div className="loading">Loading tools...</div>;

    return (
        <div className="tools-explorer">
            <div className="tools-sidebar glass-panel">
                <h3>Available Tools ({tools.length})</h3>
                <div className="tools-list">
                    {tools.map((tool) => (
                        <button
                            key={tool.name}
                            className={`tool-item ${selectedTool?.name === tool.name ? 'active' : ''}`}
                            onClick={() => {
                                setSelectedTool(tool);
                                setResult(null);
                            }}
                        >
                            {tool.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="tool-details glass-panel">
                {selectedTool ? (
                    <>
                        <h2>{selectedTool.name}</h2>
                        <p className="tool-desc">{selectedTool.description}</p>

                        <div className="tool-execution">
                            <h4>Arguments (JSON)</h4>
                            <textarea
                                value={args}
                                onChange={(e) => setArgs(e.target.value)}
                                className="glass-input tool-args"
                                rows={5}
                                title="Tool Arguments (JSON)"
                                placeholder='{"arg1": "value1"}'
                            />
                            <button
                                className="premium-button"
                                onClick={handleExecute}
                                disabled={executing}
                            >
                                {executing ? 'Executing...' : 'Run Tool'}
                            </button>
                        </div>

                        {result && (
                            <div className="tool-result">
                                <h4>Result</h4>
                                <pre className="glass-panel">{JSON.stringify(result, null, 2)}</pre>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="select-tool-prompt">
                        <span className="prompt-icon">👈</span>
                        <p>Select a tool from the list to explore its functionality.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ToolsExplorer;
