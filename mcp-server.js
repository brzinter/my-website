const express = require('express');
const cors = require('cors');
const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');

const app = express();
app.use(cors());
app.use(express.json());

// Store MCP client instance
let mcpClient = null;
let mcpTransport = null;

// Configuration for the MCP server to connect to
const MCP_SERVER_CONFIG = {
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem', '/Users/jason.wang'], // Example: filesystem MCP server
    // To use a different MCP server, modify the command and args above
    // Examples:
    // - Memory server: ['@modelcontextprotocol/server-memory']
    // - Custom server: ['/path/to/your/server.js']
};

// Initialize MCP client connection
async function initMCPClient() {
    if (mcpClient) {
        console.log('MCP client already initialized');
        return mcpClient;
    }

    try {
        console.log('Initializing MCP client...');
        console.log('Command:', MCP_SERVER_CONFIG.command, MCP_SERVER_CONFIG.args.join(' '));

        mcpTransport = new StdioClientTransport({
            command: MCP_SERVER_CONFIG.command,
            args: MCP_SERVER_CONFIG.args,
        });

        mcpClient = new Client({
            name: 'web-dashboard-client',
            version: '1.0.0',
        }, {
            capabilities: {}
        });

        await mcpClient.connect(mcpTransport);
        console.log('MCP client connected successfully');

        return mcpClient;
    } catch (error) {
        console.error('Error initializing MCP client:', error);
        mcpClient = null;
        mcpTransport = null;
        throw error;
    }
}

// Endpoint to list available tools
app.get('/api/mcp/tools', async (req, res) => {
    try {
        const client = await initMCPClient();
        const tools = await client.listTools();
        res.json({ success: true, tools: tools.tools });
    } catch (error) {
        console.error('Error listing tools:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Endpoint to list available resources
app.get('/api/mcp/resources', async (req, res) => {
    try {
        const client = await initMCPClient();
        const resources = await client.listResources();
        res.json({ success: true, resources: resources.resources });
    } catch (error) {
        console.error('Error listing resources:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Endpoint to call a tool
app.post('/api/mcp/call-tool', async (req, res) => {
    try {
        const { toolName, arguments: toolArgs } = req.body;

        if (!toolName) {
            return res.status(400).json({ success: false, error: 'toolName is required' });
        }

        const client = await initMCPClient();
        const result = await client.callTool({ name: toolName, arguments: toolArgs || {} });

        res.json({ success: true, result });
    } catch (error) {
        console.error('Error calling tool:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Endpoint to read a resource
app.post('/api/mcp/read-resource', async (req, res) => {
    try {
        const { uri } = req.body;

        if (!uri) {
            return res.status(400).json({ success: false, error: 'uri is required' });
        }

        const client = await initMCPClient();
        const result = await client.readResource({ uri });

        res.json({ success: true, result });
    } catch (error) {
        console.error('Error reading resource:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        mcpConnected: mcpClient !== null,
        serverConfig: {
            command: MCP_SERVER_CONFIG.command,
            args: MCP_SERVER_CONFIG.args
        }
    });
});

// Cleanup on shutdown
process.on('SIGINT', async () => {
    console.log('\nShutting down MCP server...');
    if (mcpClient) {
        await mcpClient.close();
    }
    process.exit(0);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`MCP bridge server running on http://localhost:${PORT}`);
    console.log(`MCP server config: ${MCP_SERVER_CONFIG.command} ${MCP_SERVER_CONFIG.args.join(' ')}`);
    console.log('\nAvailable endpoints:');
    console.log(`  GET  /api/health - Health check`);
    console.log(`  GET  /api/mcp/tools - List available tools`);
    console.log(`  GET  /api/mcp/resources - List available resources`);
    console.log(`  POST /api/mcp/call-tool - Call a specific tool`);
    console.log(`  POST /api/mcp/read-resource - Read a specific resource`);
});
