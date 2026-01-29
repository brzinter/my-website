// MCP Server Configuration Examples
// Copy this file to customize your MCP server connection in mcp-server.js

module.exports = {
    // Example 1: Filesystem MCP Server
    // Allows reading/writing files in a specific directory
    filesystem: {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-filesystem', '/Users/jason.wang'],
    },

    // Example 2: Memory MCP Server
    // Provides a simple key-value store
    memory: {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-memory'],
    },

    // Example 3: Custom MCP Server
    // Run your own custom MCP server
    custom: {
        command: 'node',
        args: ['/path/to/your/custom-mcp-server.js'],
    },

    // Example 4: Python-based MCP Server
    python: {
        command: 'python3',
        args: ['/path/to/your/server.py'],
    },
};

// To use a different configuration:
// 1. Choose one of the examples above
// 2. Update the MCP_SERVER_CONFIG in mcp-server.js with your chosen config
// 3. Restart the MCP backend server
