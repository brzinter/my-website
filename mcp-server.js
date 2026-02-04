require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const https = require('https');
const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');

// Create https agent to handle SSL issues
const httpsAgent = new https.Agent({
    rejectUnauthorized: false
});

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

// Stock data proxy endpoint (bypasses CORS)
app.get('/api/stock/:symbol', async (req, res) => {
    try {
        const { symbol } = req.params;
        console.log(`Fetching stock data for ${symbol}...`);

        // Try multiple endpoints in order of preference
        const endpoints = [
            // Try Alpha Vantage with API key from environment
            {
                name: 'Alpha Vantage',
                url: `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${process.env.ALPHA_VANTAGE_API_KEY || 'demo'}`,
                transform: (data) => {
                    const quote = data?.['Global Quote'];
                    if (!quote || !quote['05. price']) return null;
                    const price = parseFloat(quote['05. price']);
                    const prevClose = parseFloat(quote['08. previous close']);
                    const change = parseFloat(quote['09. change']);
                    const changePercent = parseFloat(quote['10. change percent'].replace('%', ''));
                    return {
                        regularMarketPrice: price,
                        regularMarketOpen: parseFloat(quote['02. open']),
                        regularMarketDayHigh: parseFloat(quote['03. high']),
                        regularMarketDayLow: parseFloat(quote['04. low']),
                        regularMarketPreviousClose: prevClose,
                        regularMarketChange: change,
                        regularMarketChangePercent: changePercent,
                        regularMarketTime: Math.floor(Date.now() / 1000)
                    };
                }
            },
            // Try Yahoo Finance via different query endpoint
            {
                name: 'Yahoo Finance',
                url: `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`,
                transform: (data) => data?.quoteResponse?.result?.[0]
            }
        ];

        let lastError = null;

        for (const endpoint of endpoints) {
            try {
                console.log(`  Trying ${endpoint.name}...`);

                // Use axios for reliable HTTP requests
                const response = await axios.get(endpoint.url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                        'Accept': 'application/json'
                    },
                    timeout: 10000,
                    httpsAgent: httpsAgent
                });

                const data = response.data;
                const quoteResult = endpoint.transform(data);

                if (quoteResult && quoteResult.regularMarketPrice) {
                    console.log(`✓ Stock data fetched successfully from ${endpoint.name} for ${symbol}`);
                    res.json({ success: true, data: quoteResult, source: endpoint.name });
                    return;
                }

                throw new Error('No valid data in response');
            } catch (error) {
                const message = error.response ?
                    `${endpoint.name} returned ${error.response.status}` :
                    error.message;
                console.log(`  ${endpoint.name} failed: ${message}`);
                lastError = error;
                continue;
            }
        }

        // All endpoints failed
        throw new Error(lastError?.message || 'All stock API endpoints failed');

    } catch (error) {
        console.error('Stock API error:', error.message);
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
    console.log(`  GET  /api/stock/:symbol - Fetch real-time stock data`);
    console.log(`  GET  /api/mcp/tools - List available tools`);
    console.log(`  GET  /api/mcp/resources - List available resources`);
    console.log(`  POST /api/mcp/call-tool - Call a specific tool`);
    console.log(`  POST /api/mcp/read-resource - Read a specific resource`);
});
