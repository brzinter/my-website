# MCP Client Integration

This dashboard now includes Model Context Protocol (MCP) client functionality. The AI Agent button connects to a local MCP server to invoke tools and access resources.

## Architecture

```
Browser (Frontend)  <-->  Node.js Backend  <-->  MCP Server (Local)
   main.js                 mcp-server.js         (stdio/SSE/WebSocket)
```

Since browsers cannot directly communicate with stdio-based MCP servers, we use a Node.js backend as a bridge.

## Setup

### 1. Start the MCP Backend Server

In one terminal:

```bash
npm run mcp
```

This starts the MCP bridge server on `http://localhost:3001`.

### 2. Start the Frontend Dev Server

In another terminal:

```bash
npm run dev
```

This serves the frontend on `http://localhost:8000`.

### 3. Click the AI Agent Button

Open `http://localhost:8000` in your browser and click the robot button to invoke the MCP client.

## Configuration

The MCP server configuration is in [mcp-server.js](mcp-server.js:11-15). By default, it connects to the filesystem MCP server:

```javascript
const MCP_SERVER_CONFIG = {
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem', '/Users/jason.wang'],
};
```

### Available MCP Servers

1. **Filesystem Server** (default)
   - Read and write files
   - List directories
   - `args: ['-y', '@modelcontextprotocol/server-filesystem', '/path/to/directory']`

2. **Memory Server**
   - Key-value storage
   - `args: ['-y', '@modelcontextprotocol/server-memory']`

3. **Custom Servers**
   - Use your own MCP server implementation
   - `command: 'node'`, `args: ['/path/to/your-server.js']`

See [mcp-config.example.js](mcp-config.example.js) for more examples.

## API Endpoints

The MCP backend exposes these endpoints:

- `GET /api/health` - Check backend status
- `GET /api/mcp/tools` - List available tools
- `GET /api/mcp/resources` - List available resources
- `POST /api/mcp/call-tool` - Call a specific tool
- `POST /api/mcp/read-resource` - Read a resource

## Frontend Integration

The frontend code in [main.js](src/js/main.js:332-410) handles:

1. Checking backend health
2. Listing available tools
3. Calling tools with arguments
4. Displaying results

### Example: Calling a Tool

```javascript
const response = await fetch('http://localhost:3001/api/mcp/call-tool', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        toolName: 'read_file',
        arguments: {
            path: '/path/to/file.txt'
        }
    })
});

const data = await response.json();
console.log(data.result);
```

## Customization

### Change the Tool Being Called

Edit [main.js](src/js/main.js:332-410) to customize which tool gets called when the button is clicked.

### Change the MCP Server

Edit [mcp-server.js](mcp-server.js:11-15) to connect to a different MCP server.

### Add More Endpoints

Extend [mcp-server.js](mcp-server.js) with additional Express routes for more MCP functionality.

## Troubleshooting

### "MCP backend is not running"

Make sure you've started the backend server with `npm run mcp`.

### "Failed to fetch tools"

Check that:
1. The MCP server command is correct in `mcp-server.js`
2. The MCP server is installed (filesystem server is installed automatically via `npx`)
3. Check the backend terminal for error messages

### CORS Issues

The backend includes CORS middleware to allow requests from the frontend. If you change ports, update the CORS configuration in `mcp-server.js`.

## Learn More

- [MCP Documentation](https://modelcontextprotocol.io/)
- [MCP SDK on GitHub](https://github.com/modelcontextprotocol/sdk)
- [Available MCP Servers](https://github.com/modelcontextprotocol/servers)
