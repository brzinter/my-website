# MCP Servers Guide

Here are different MCP servers you can connect to and what they do:

## 1. Filesystem Server (Currently Active)
**What it does:** Read, write, search files on your computer
**Configuration:**
```javascript
{
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem', '/Users/jason.wang']
}
```
**Tools:** 14 file operations (read, write, list, search, etc.)

## 2. Memory Server
**What it does:** Simple key-value storage (like a database)
**Configuration:**
```javascript
{
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-memory']
}
```
**Tools:**
- `store_memory` - Save data with a key
- `retrieve_memory` - Get data by key
- `list_memories` - See all stored keys
- `delete_memory` - Remove stored data

**Use case:** Store and retrieve data between sessions

## 3. GitHub Server
**What it does:** Interact with GitHub repositories
**Configuration:**
```javascript
{
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-github']
}
```
**Tools:**
- Create issues
- List pull requests
- Search repositories
- Get file contents from repos
- Create/update files

**Note:** Requires GitHub API token

## 4. Brave Search Server
**What it does:** Web search capabilities
**Configuration:**
```javascript
{
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-brave-search']
}
```
**Tools:**
- `brave_web_search` - Search the web
- Get real-time information

**Note:** Requires Brave Search API key

## 5. Google Maps Server
**What it does:** Location and mapping data
**Configuration:**
```javascript
{
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-google-maps']
}
```
**Tools:**
- Geocoding
- Place searches
- Distance calculations
- Route planning

**Note:** Requires Google Maps API key

## 6. PostgreSQL Server
**What it does:** Database operations
**Configuration:**
```javascript
{
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-postgres']
}
```
**Tools:**
- Query databases
- List tables and schemas
- Execute SQL

**Note:** Requires database connection string

## 7. Puppeteer Server
**What it does:** Browser automation and web scraping
**Configuration:**
```javascript
{
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-puppeteer']
}
```
**Tools:**
- Screenshot websites
- Navigate pages
- Fill forms
- Extract data

## 8. Slack Server
**What it does:** Interact with Slack workspaces
**Configuration:**
```javascript
{
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-slack']
}
```
**Tools:**
- Send messages
- List channels
- Get conversation history

**Note:** Requires Slack API token

## 9. SQLite Server
**What it does:** Local database operations
**Configuration:**
```javascript
{
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-sqlite', '/path/to/database.db']
}
```
**Tools:**
- Query SQLite databases
- Create tables
- Execute SQL

## 10. Fetch Server
**What it does:** Make HTTP requests
**Configuration:**
```javascript
{
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-fetch']
}
```
**Tools:**
- `fetch` - Make HTTP GET/POST requests
- Interact with APIs

## How to Switch MCP Servers

1. **Stop the current server:**
   ```bash
   # Find and kill the process
   pkill -f "node mcp-server.js"
   ```

2. **Edit mcp-server.js:**
   Change lines 11-15 to use a different server configuration:
   ```javascript
   const MCP_SERVER_CONFIG = {
       command: 'npx',
       args: ['-y', '@modelcontextprotocol/server-memory']  // Changed!
   };
   ```

3. **Restart the server:**
   ```bash
   npm run mcp
   ```

4. **Refresh your browser** and click the AI Agent button!

## Try Memory Server Now

Want to try something different? The **Memory Server** is easy to set up (no API keys needed):

1. Edit `/Users/jason.wang/claude_project/my-website/mcp-server.js`
2. Change line 13 to:
   ```javascript
   args: ['-y', '@modelcontextprotocol/server-memory'],
   ```
3. Restart: `npm run mcp`
4. Try storing and retrieving data!

## Custom MCP Servers

You can also build your own! Check out:
- [MCP Server Examples](https://github.com/modelcontextprotocol/servers)
- [MCP Python SDK](https://github.com/modelcontextprotocol/python-sdk)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)

## Resources

- [Official MCP Documentation](https://modelcontextprotocol.io/)
- [MCP Server Registry](https://github.com/modelcontextprotocol/servers)
- [Build Your Own Server](https://modelcontextprotocol.io/docs/building-servers)
