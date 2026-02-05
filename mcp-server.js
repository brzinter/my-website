require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const https = require('https');
const crypto = require('crypto');
const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StreamableHTTPClientTransport } = require('@modelcontextprotocol/sdk/client/streamableHttp.js');

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

// ServiceNow OAuth token storage
let servicenowAccessToken = process.env.SERVICENOW_ACCESS_TOKEN || null;
let servicenowRefreshToken = process.env.SERVICENOW_REFRESH_TOKEN || null;
let servicenowTokenExpiry = null;
let oauthState = null;

// Refresh ServiceNow access token using refresh token
async function refreshServiceNowToken() {
    if (!servicenowRefreshToken) {
        throw new Error('No refresh token available. Please authorize first.');
    }

    try {
        console.log('Refreshing ServiceNow OAuth token...');
        const tokenUrl = `${process.env.SERVICENOW_INSTANCE_URL}/oauth_token.do`;

        const params = new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: servicenowRefreshToken,
            client_id: process.env.SERVICENOW_OAUTH_CLIENT_ID,
            client_secret: process.env.SERVICENOW_OAUTH_CLIENT_SECRET
        });

        const response = await axios.post(tokenUrl, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            httpsAgent: httpsAgent
        });

        servicenowAccessToken = response.data.access_token;
        if (response.data.refresh_token) {
            servicenowRefreshToken = response.data.refresh_token;
        }

        const expiresIn = response.data.expires_in || 3600;
        servicenowTokenExpiry = Date.now() + (expiresIn * 800);

        console.log('✓ ServiceNow OAuth token refreshed');
        console.log('💡 Save these tokens to your .env file:');
        console.log(`SERVICENOW_ACCESS_TOKEN=${servicenowAccessToken}`);
        console.log(`SERVICENOW_REFRESH_TOKEN=${servicenowRefreshToken}`);

        return servicenowAccessToken;
    } catch (error) {
        console.error('Error refreshing ServiceNow OAuth token:', error.response?.data || error.message);
        servicenowAccessToken = null;
        servicenowRefreshToken = null;
        throw error;
    }
}

// Get ServiceNow OAuth access token
async function getServiceNowAccessToken() {
    // Check if we have a valid token
    if (servicenowAccessToken && servicenowTokenExpiry && Date.now() < servicenowTokenExpiry) {
        return servicenowAccessToken;
    }

    // Try to refresh if we have a refresh token
    if (servicenowRefreshToken) {
        try {
            return await refreshServiceNowToken();
        } catch (error) {
            console.error('Token refresh failed, need to re-authorize');
            throw new Error('Authorization required. Please visit http://localhost:3001/oauth/authorize');
        }
    }

    throw new Error('No access token available. Please authorize at: http://localhost:3001/oauth/authorize');
}

// Initialize MCP client connection
async function initMCPClient() {
    if (mcpClient) {
        console.log('MCP client already initialized');
        return mcpClient;
    }

    try {
        console.log('Initializing MCP client for ServiceNow...');

        // Get OAuth token
        const accessToken = await getServiceNowAccessToken();

        // Construct full MCP endpoint URL
        const mcpUrl = `${process.env.SERVICENOW_INSTANCE_URL}${process.env.SERVICENOW_MCP_ENDPOINT}`;
        console.log('Connecting to:', mcpUrl);

        mcpTransport = new StreamableHTTPClientTransport(mcpUrl, {
            requestInit: {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            },
            fetch: async (url, init) => {
                // Refresh token if needed before each request
                const token = await getServiceNowAccessToken();
                if (init && init.headers) {
                    init.headers['Authorization'] = `Bearer ${token}`;
                }
                return fetch(url, init);
            }
        });

        mcpClient = new Client({
            name: 'web-dashboard-client',
            version: '1.0.0',
        }, {
            capabilities: {}
        });

        await mcpClient.connect(mcpTransport);
        console.log('✓ MCP client connected successfully to ServiceNow');

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

// ServiceNow MCP Connection - Connect endpoint
app.post('/api/servicenow/connect', async (req, res) => {
    try {
        console.log('Attempting to connect to ServiceNow MCP...');

        // Try to initialize the MCP client
        const client = await initMCPClient();

        res.json({
            success: true,
            message: 'Connected to ServiceNow MCP',
            instance: process.env.SERVICENOW_INSTANCE_URL
        });
    } catch (error) {
        console.error('ServiceNow connection error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to connect to ServiceNow MCP'
        });
    }
});

// ServiceNow MCP Tools - List available tools
app.get('/api/servicenow/tools', async (req, res) => {
    try {
        const client = await initMCPClient();
        const tools = await client.listTools();
        res.json({ success: true, tools: tools.tools });
    } catch (error) {
        console.error('Error listing ServiceNow tools:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ServiceNow MCP Resources - List available resources
app.get('/api/servicenow/resources', async (req, res) => {
    try {
        const client = await initMCPClient();
        const resources = await client.listResources();
        res.json({ success: true, resources: resources.resources });
    } catch (error) {
        console.error('Error listing ServiceNow resources:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ServiceNow MCP - Call a tool
app.post('/api/servicenow/call-tool', async (req, res) => {
    try {
        const { toolName, arguments: toolArgs } = req.body;

        if (!toolName) {
            return res.status(400).json({ success: false, error: 'toolName is required' });
        }

        const client = await initMCPClient();
        const result = await client.callTool({ name: toolName, arguments: toolArgs || {} });

        res.json({ success: true, result });
    } catch (error) {
        console.error('Error calling ServiceNow tool:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// OAuth Authorization - Step 1: Redirect user to ServiceNow authorization page
app.get('/oauth/authorize', (req, res) => {
    // Generate random state for CSRF protection
    oauthState = crypto.randomBytes(16).toString('hex');

    const authUrl = new URL(`${process.env.SERVICENOW_INSTANCE_URL}/oauth_auth.do`);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', process.env.SERVICENOW_OAUTH_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', process.env.SERVICENOW_OAUTH_REDIRECT_URI);
    authUrl.searchParams.set('scope', 'useraccount');
    authUrl.searchParams.set('state', oauthState);

    console.log(`🔐 Redirecting to ServiceNow authorization: ${authUrl.toString()}`);
    res.redirect(authUrl.toString());
});

// OAuth Callback - Step 2: Exchange authorization code for tokens
app.get('/oauth/callback', async (req, res) => {
    const { code, state } = req.query;

    // Verify state to prevent CSRF
    if (state !== oauthState) {
        console.error('OAuth state mismatch - possible CSRF attack');
        return res.status(400).send('Invalid state parameter');
    }

    if (!code) {
        console.error('No authorization code received');
        return res.status(400).send('No authorization code received');
    }

    try {
        console.log('Exchanging authorization code for tokens...');
        const tokenUrl = `${process.env.SERVICENOW_INSTANCE_URL}/oauth_token.do`;

        const params = new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: process.env.SERVICENOW_OAUTH_REDIRECT_URI,
            client_id: process.env.SERVICENOW_OAUTH_CLIENT_ID,
            client_secret: process.env.SERVICENOW_OAUTH_CLIENT_SECRET
        });

        console.log('Token exchange request:');
        console.log('  URL:', tokenUrl);
        console.log('  Client ID:', process.env.SERVICENOW_OAUTH_CLIENT_ID);
        console.log('  Redirect URI:', process.env.SERVICENOW_OAUTH_REDIRECT_URI);
        console.log('  Grant Type:', 'authorization_code');
        console.log('  Code length:', code.length);

        const response = await axios.post(tokenUrl, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            httpsAgent: httpsAgent
        });

        servicenowAccessToken = response.data.access_token;
        servicenowRefreshToken = response.data.refresh_token;

        const expiresIn = response.data.expires_in || 3600;
        servicenowTokenExpiry = Date.now() + (expiresIn * 800);

        console.log('✅ OAuth authorization successful!');
        console.log('\n💡 IMPORTANT: Save these tokens to your .env file:\n');
        console.log(`SERVICENOW_ACCESS_TOKEN=${servicenowAccessToken}`);
        console.log(`SERVICENOW_REFRESH_TOKEN=${servicenowRefreshToken}\n`);

        // Clear state after successful authorization
        oauthState = null;

        res.send(`
            <html>
            <head><title>Authorization Successful</title></head>
            <body style="font-family: Arial; padding: 40px; max-width: 800px; margin: 0 auto;">
                <h1>✅ Authorization Successful!</h1>
                <p>You have successfully authorized access to ServiceNow.</p>
                <h2>📝 Next Steps:</h2>
                <ol>
                    <li>Add these tokens to your <code>.env</code> file:</li>
                </ol>
                <pre style="background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto;">
SERVICENOW_ACCESS_TOKEN=${servicenowAccessToken}
SERVICENOW_REFRESH_TOKEN=${servicenowRefreshToken}</pre>
                <p><strong>Note:</strong> Tokens will automatically refresh when they expire.</p>
                <p><a href="http://localhost:8000">← Back to Dashboard</a></p>
            </body>
            </html>
        `);

    } catch (error) {
        console.error('Error exchanging authorization code:', error.response?.data || error.message);
        res.status(500).send(`
            <html>
            <body style="font-family: Arial; padding: 40px;">
                <h1>❌ Authorization Failed</h1>
                <p>Error: ${error.response?.data?.error_description || error.message}</p>
                <p><a href="/oauth/authorize">Try Again</a></p>
            </body>
            </html>
        `);
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        mcpConnected: mcpClient !== null,
        servicenow: {
            instance: process.env.SERVICENOW_INSTANCE_URL,
            endpoint: process.env.SERVICENOW_MCP_ENDPOINT,
            hasToken: servicenowAccessToken !== null
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
    console.log(`MCP server: ServiceNow @ ${process.env.SERVICENOW_INSTANCE_URL}`);
    console.log('\nAvailable endpoints:');
    console.log(`  GET  /api/health - Health check`);
    console.log(`  GET  /api/stock/:symbol - Fetch real-time stock data`);
    console.log(`  GET  /api/mcp/tools - List available tools`);
    console.log(`  GET  /api/mcp/resources - List available resources`);
    console.log(`  POST /api/mcp/call-tool - Call a specific tool`);
    console.log(`  POST /api/mcp/read-resource - Read a specific resource`);
});
