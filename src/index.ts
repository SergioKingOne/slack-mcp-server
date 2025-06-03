#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SlackClient } from "./slack-client.js";
import { registerTools } from "./tools.js";
import { registerResources } from "./resources.js";
import { registerPrompts } from "./prompts.js";

// Main server implementation
async function main() {
  // Get environment variables
  const token = process.env.SLACK_BOT_TOKEN;
  const teamId = process.env.SLACK_TEAM_ID;

  if (!token) {
    console.error("Error: SLACK_BOT_TOKEN environment variable is required");
    console.error("\nTo use this MCP server:");
    console.error("1. Create a Slack app at https://api.slack.com/apps");
    console.error(
      "2. Add OAuth scopes: channels:read, channels:history, groups:read, groups:history, users:read, search:read"
    );
    console.error("3. Install the app to your workspace");
    console.error(
      "4. Set SLACK_BOT_TOKEN environment variable to your Bot User OAuth Token"
    );
    console.error("5. Optionally set SLACK_TEAM_ID for workspace info");
    process.exit(1);
  }

  try {
    // Initialize Slack client
    const slackClient = new SlackClient(token, teamId);

    // Verify connection by testing auth
    const authInfo = await slackClient.getAuthInfo();
    if (!authInfo) {
      console.error(
        "Error: Unable to authenticate with Slack. Please check your token."
      );
      process.exit(1);
    }

    console.error(
      `Successfully connected to Slack as ${authInfo.user_id} in team ${authInfo.team_id}`
    );

    // Create MCP server
    const server = new McpServer({
      name: "slack-mcp-server",
      version: "2.0.0",
      description:
        "MCP server for Slack integration with tools, resources, and prompts",
    });

    // Register all components
    registerTools(server, slackClient);
    registerResources(server, slackClient);
    registerPrompts(server);

    // Create and connect transport
    const transport = new StdioServerTransport();

    // Handle graceful shutdown
    process.on("SIGINT", async () => {
      console.error("\nShutting down Slack MCP server...");
      await server.close();
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      await server.close();
      process.exit(0);
    });

    // Connect and start server
    await server.connect(transport);
    console.error("Slack MCP server running on stdio transport");
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Run the server
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
