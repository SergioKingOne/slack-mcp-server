# Slack MCP Server

A comprehensive Model Context Protocol (MCP) server that enables LLMs to interact with Slack workspaces. This server provides tools for searching, reading, and managing Slack content, along with resources for workspace information and prompts for common workflows.

## Features

### 🛠️ Tools (11 available)

- **Channel Management**
  - `slack_list_channels` - Browse public and private channels
  - `slack_get_channel_info` - Get detailed channel information
  - `slack_list_bookmarks` - List bookmarks in a channel
- **Message Operations**
  - `slack_list_messages` - Read messages from channels and threads
  - `slack_list_threads` - Discover threaded conversations
  - `slack_search_messages` - Search across the workspace
- **User Management**
  - `slack_get_user_info` - Get detailed user information
  - `slack_list_users` - List workspace users
- **Content & Reactions**
  - `slack_list_files` - Browse shared files
  - `slack_add_reaction` - Add emoji reactions
  - `slack_remove_reaction` - Remove emoji reactions

### 📚 Resources (4 available)

- `slack://workspace` - Workspace information
- `slack://me` - Current bot user information
- `slack://users` - Complete user directory
- `slack://channels` - All accessible channels

### 💡 Prompts (5 available)

- `find_recent_discussions` - Search for discussions on specific topics
- `channel_activity_summary` - Summarize channel activity
- `team_member_activity` - Check team member participation
- `daily_standup_helper` - Gather standup information
- `knowledge_search` - Find institutional knowledge

## Quick Start

### 1. Create a Slack App

1. Go to [api.slack.com/apps](https://api.slack.com/apps) and click "Create New App"
2. Choose "From scratch" and give your app a name
3. Select the workspace where you want to install it

### 2. Configure OAuth Scopes

In your app settings, go to "OAuth & Permissions" and add these Bot Token Scopes:

**Essential Scopes:**

- `channels:read` - View basic channel information
- `channels:history` - View messages in public channels
- `groups:read` - View basic information about private channels
- `groups:history` - View messages in private channels
- `users:read` - View people in the workspace
- `users:read.email` - View email addresses
- `team:read` - View workspace information

**Additional Scopes for Full Functionality:**

- `im:read` - View direct messages
- `im:history` - View messages in direct messages
- `mpim:read` - View group direct messages
- `mpim:history` - View messages in group direct messages
- `search:read` - Search messages
- `files:read` - View files
- `reactions:read` - View emoji reactions
- `reactions:write` - Add and remove reactions
- `bookmarks:read` - View bookmarks

### 3. Install the App

1. In "OAuth & Permissions", click "Install to Workspace"
2. Copy the "Bot User OAuth Token" (starts with `xoxb-`)

### 4. Configure Claude Desktop

Add to your Claude Desktop config:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "slack": {
      "command": "npx",
      "args": ["-y", "@sergdev1/slack-mcp-server"],
      "env": {
        "SLACK_BOT_TOKEN": "xoxb-your-bot-token",
        "SLACK_TEAM_ID": "T01234567"
      }
    }
  }
}
```

## Usage Examples

### Using Tools

```
"Search for messages about the deployment"
"List all channels I have access to"
"Show me threads in #engineering from the last week"
"Get information about user U1234567890"
"Add a thumbsup reaction to message 1234567890.123456 in channel C1234567890"
```

### Using Resources

Resources provide quick access to commonly needed information:

```
"Check the workspace resource for company info"
"Look at the users resource to see all team members"
"Review the channels resource for a complete channel list"
```

### Using Prompts

Prompts provide guided workflows for common tasks:

```
"Use the find_recent_discussions prompt to search for budget talks"
"Run the channel_activity_summary for #general and #random"
"Execute daily_standup_helper for the #engineering channel"
"Use knowledge_search to find our deployment process"
```

## Detailed API Reference

### Tools

#### slack_list_channels

Lists channels in your Slack workspace.

**Parameters:**

- `exclude_archived` (boolean, optional): Exclude archived channels (default: true)
- `types` (string, optional): Channel types (default: "public_channel,private_channel")
- `limit` (number, optional): Maximum channels to return (default: 100)
- `cursor` (string, optional): Pagination cursor

#### slack_search_messages

Search for messages across the workspace.

**Parameters:**

- `query` (string, required): Search query with Slack modifiers
- `count` (number, optional): Results per page (default: 20)
- `page` (number, optional): Page number (default: 1)
- `highlight` (boolean, optional): Highlight matches (default: true)
- `sort` (string, optional): Sort by 'score' or 'timestamp' (default: 'score')
- `sort_dir` (string, optional): Sort direction 'asc' or 'desc' (default: 'desc')

**Search Modifiers:**

- `from:@username` - Messages from specific user
- `in:#channel` - Messages in specific channel
- `after:2024-01-01` - Messages after date
- `before:2024-12-31` - Messages before date
- `has:link` - Messages with links
- `has:file` - Messages with files

#### slack_add_reaction / slack_remove_reaction

Manage emoji reactions on messages.

**Parameters:**

- `channel` (string, required): Channel ID
- `timestamp` (string, required): Message timestamp
- `name` (string, required): Emoji name without colons (e.g., 'thumbsup')

### Resources

Resources are accessed via their URIs and return JSON data:

- **slack://workspace**: Returns workspace ID, name, domain, and enterprise info
- **slack://me**: Returns bot user ID, name, and authentication details
- **slack://users**: Returns all active users with profiles
- **slack://channels**: Returns all accessible channels with metadata

### Prompts

Each prompt accepts arguments and returns a structured message for the LLM:

#### find_recent_discussions

- `topic` (string, required): Topic to search for
- `days` (string, optional): Days to look back (default: "7")

#### channel_activity_summary

- `channel_names` (string, required): Comma-separated channel names
- `hours` (string, optional): Hours to analyze (default: "24")

## Advanced Configuration

### Environment Variables

- `SLACK_BOT_TOKEN` (required): Your Slack bot token
- `SLACK_TEAM_ID` (optional): Your workspace ID for team info

### Security Best Practices

1. **Token Security**

   - Never commit tokens to version control
   - Use environment variables for sensitive data
   - Rotate tokens regularly

2. **Channel Access**

   - Bot must be invited to private channels: `/invite @your-bot-name`
   - DMs require explicit user permission

3. **Rate Limits**
   - Respect Slack's rate limits
   - Implement exponential backoff for retries
   - Cache frequently accessed data

## Development

### Project Structure

```
slack-mcp-server/
├── src/
│   ├── index.ts       # Main server entry point
│   ├── slack-client.ts # Slack API client wrapper
│   ├── tools.ts       # Tool implementations
│   ├── resources.ts   # Resource handlers
│   ├── prompts.ts     # Prompt definitions
│   └── types.ts       # TypeScript interfaces
├── package.json
├── tsconfig.json
└── README.md
```

### Building from Source

```bash
# Clone the repository
git clone https://github.com/sergdev1/slack-mcp-server.git
cd slack-mcp-server

# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode
npm run dev
```

### Testing

```bash
# Set your Slack token
export SLACK_BOT_TOKEN="xoxb-your-bot-token"
export SLACK_TEAM_ID="T01234567"  # Optional

# Run the server
npm test

# Use MCP Inspector for testing
npx @modelcontextprotocol/inspector
```

### Extending the Server

To add new tools:

1. Define the schema in `tools.ts`
2. Implement the handler function
3. Register with `server.tool()`

To add new resources:

1. Define the handler in `resources.ts`
2. Register with `server.resource()`

To add new prompts:

1. Define the template in `prompts.ts`
2. Register with `server.prompt()`

## Troubleshooting

### Common Issues

#### "channel_not_found" error

- Ensure bot is a member of the channel
- Check you're using channel ID not name
- Verify channel hasn't been archived

#### "missing_scope" error

- Add required OAuth scopes to your app
- Reinstall the app to your workspace
- Some scopes require admin approval

#### No messages returned

- Verify bot has history scope for channel type
- Check time range parameters
- Ensure channel has messages in range

#### Search not working

- Requires `search:read` scope
- Search index may have delays
- Check query syntax is valid

### Debug Mode

Enable debug logging by setting:

```bash
DEBUG=slack-mcp-server npm run dev
```

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use TypeScript for type safety
- Follow existing code patterns
- Add JSDoc comments for public APIs
- Include tests for new features

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Built with [Model Context Protocol](https://modelcontextprotocol.io)
- Uses [Slack Web API](https://api.slack.com/web)
- Powered by [@slack/web-api](https://www.npmjs.com/package/@slack/web-api)

## Changelog

### v2.0.0

- Added 8 new tools (search, users, files, reactions)
- Added 4 resources for quick data access
- Added 5 prompts for common workflows
- Improved error handling and validation
- Better TypeScript types
- Modular code architecture

### v1.0.0

- Initial release
- Basic channel, message, and thread tools

---

Made with ❤️ for the MCP community
