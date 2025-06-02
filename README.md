# Slack MCP Server

A Model Context Protocol (MCP) server that enables LLMs to interact with Slack workspaces. List channels, read messages, and browse threads using a simple and secure interface.

## Features

- 📋 **List Channels** - Browse public and private channels in your workspace
- 💬 **Read Messages** - Fetch messages from channels and threads
- 🧵 **Browse Threads** - Discover and read threaded conversations
- 🔒 **Secure** - Uses official Slack Web API with bot tokens
- ⚡ **Fast** - Built with TypeScript and the official Slack SDK
- 🚀 **Easy Setup** - Run directly with `npx`

## Quick Start

### 1. Create a Slack App

1. Go to [api.slack.com/apps](https://api.slack.com/apps) and click "Create New App"
2. Choose "From scratch" and give your app a name
3. Select the workspace where you want to install it

### 2. Configure OAuth Scopes

In your app settings, go to "OAuth & Permissions" and add these scopes:

**Bot Token Scopes:**

- `channels:read` - View basic channel information
- `channels:history` - View messages in public channels
- `groups:read` - View basic information about private channels
- `groups:history` - View messages in private channels
- `im:read` - View basic information about direct messages
- `im:history` - View messages in direct messages
- `mpim:read` - View basic information about group direct messages
- `mpim:history` - View messages in group direct messages

### 3. Install the App

1. In "OAuth & Permissions", click "Install to Workspace"
2. Copy the "Bot User OAuth Token" (starts with `xoxb-`)

### 4. Run with Claude Desktop

Add to your Claude Desktop config file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "slack": {
      "command": "npx",
      "args": ["-y", "@sergdev1/slack-mcp-server"],
      "env": {
        "SLACK_BOT_TOKEN": "xoxb-your-bot-token"
      }
    }
  }
}
```

## Usage Examples

Once configured, you can ask Claude:

- "List all Slack channels"
- "Show me the latest messages in #general"
- "Find threads in #engineering from the last week"
- "Read the replies in that thread about the deployment"

## Available Tools

### slack_list_channels

Lists channels in your Slack workspace.

**Parameters:**

- `exclude_archived` (optional): Exclude archived channels (default: true)
- `types` (optional): Channel types to include (default: "public_channel,private_channel")
- `limit` (optional): Maximum number of channels to return (default: 100)
- `cursor` (optional): Pagination cursor

**Example response:**

```json
{
  "success": true,
  "channels": [
    {
      "id": "C1234567890",
      "name": "general",
      "is_private": false,
      "is_archived": false,
      "num_members": 42,
      "topic": "Company-wide announcements",
      "purpose": "This channel is for team-wide communication",
      "created": "2023-01-15T10:30:00Z"
    }
  ],
  "total": 1
}
```

### slack_list_messages

Lists messages in a channel or thread.

**Parameters:**

- `channel` (required): Channel ID (e.g., "C1234567890")
- `thread_ts` (optional): Thread timestamp to get replies
- `limit` (optional): Maximum messages to return (default: 100)
- `cursor` (optional): Pagination cursor
- `oldest` (optional): Only messages after this Unix timestamp
- `latest` (optional): Only messages before this Unix timestamp
- `inclusive` (optional): Include messages with oldest/latest timestamps
- `include_all_metadata` (optional): Include all message metadata

**Example response:**

```json
{
  "success": true,
  "messages": [
    {
      "ts": "1234567890.123456",
      "text": "Hello team!",
      "user": "U1234567890",
      "timestamp": "2024-01-15T10:30:00Z",
      "reply_count": 3
    }
  ],
  "has_more": false,
  "total": 1
}
```

### slack_list_threads

Lists threads in a channel.

**Parameters:**

- `channel` (required): Channel ID
- `limit` (optional): Maximum threads to return (default: 100)
- `cursor` (optional): Pagination cursor
- `oldest` (optional): Only threads after this Unix timestamp
- `latest` (optional): Only threads before this Unix timestamp

**Example response:**

```json
{
  "success": true,
  "threads": [
    {
      "thread_ts": "1234567890.123456",
      "reply_count": 5,
      "reply_users_count": 3,
      "latest_reply": "1234567899.123456",
      "root_message": {
        "text": "Starting a discussion about the new feature",
        "user": "U1234567890",
        "timestamp": "2024-01-15T10:30:00Z"
      }
    }
  ],
  "has_more": false,
  "total": 1
}
```

## Development

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/slack-mcp-server.git
cd slack-mcp-server

# Install dependencies
npm install

# Build the project
npm run build
```

### Testing

```bash
# Set your Slack token
export SLACK_BOT_TOKEN="xoxb-your-bot-token"

# Run the server
npm test
```

### Publishing

```bash
# Update version in package.json
npm version patch

# Build and publish
npm run build
npm publish
```

## Environment Variables

- `SLACK_BOT_TOKEN` (required): Your Slack bot token (xoxb-...)

## Permissions

The server requires appropriate Slack permissions. Make sure your bot has been invited to channels it needs to access:

```
/invite @your-bot-name
```

## Security

- Never commit your Slack bot token
- Use environment variables for sensitive data
- The server only performs read operations
- All API calls use the official Slack SDK

## Troubleshooting

### "channel_not_found" error

- Make sure your bot is a member of the channel
- Check that you're using the channel ID (C...) not the name

### "missing_scope" error

- Add the required OAuth scopes to your Slack app
- Reinstall the app to your workspace

### No messages returned

- Verify the bot has `channels:history` or `groups:history` scope
- Check if the channel has any messages

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Related Projects

- [Model Context Protocol](https://modelcontextprotocol.io)
- [Slack Web API](https://api.slack.com/web)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)

---

Made with ❤️ for the MCP community
