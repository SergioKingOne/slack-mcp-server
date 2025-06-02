#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { SlackClient } from "./slack-client.js";

// Type definitions for schema inference
type ListChannelsParams = {
  exclude_archived?: boolean;
  types?: string;
  limit?: number;
  cursor?: string;
};

type ListMessagesParams = {
  channel: string;
  thread_ts?: string;
  limit?: number;
  cursor?: string;
  oldest?: string;
  latest?: string;
  inclusive?: boolean;
  include_all_metadata?: boolean;
};

type ListThreadsParams = {
  channel: string;
  limit?: number;
  cursor?: string;
  oldest?: string;
  latest?: string;
};

// Main server implementation
async function main() {
  // Get environment variables
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) {
    console.error("Error: SLACK_BOT_TOKEN environment variable is required");
    process.exit(1);
  }

  // Initialize Slack client
  const slackClient = new SlackClient(token);

  // Create MCP server
  const server = new McpServer({
    name: "slack-mcp-server",
    version: "1.0.0",
  });

  // Register tool: list_channels
  server.tool(
    "slack_list_channels",
    {
      exclude_archived: z.boolean().optional().default(true),
      types: z.string().optional().default("public_channel,private_channel"),
      limit: z.number().optional().default(100),
      cursor: z.string().optional(),
    },
    async (input: ListChannelsParams) => {
      try {
        const result = await slackClient.listChannels(input);

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  channels: result.channels.map((ch) => ({
                    id: ch.id,
                    name: ch.name,
                    is_private: ch.is_private,
                    is_archived: ch.is_archived,
                    num_members: ch.num_members,
                    topic: ch.topic?.value,
                    purpose: ch.purpose?.value,
                    created: new Date(ch.created * 1000).toISOString(),
                  })),
                  next_cursor: result.next_cursor,
                  total: result.channels.length,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: false,
                  error: error instanceof Error ? error.message : String(error),
                },
                null,
                2
              ),
            },
          ],
        };
      }
    }
  );

  // Register tool: list_messages
  server.tool(
    "slack_list_messages",
    {
      channel: z.string().describe("Channel ID (e.g., C1234567890)"),
      thread_ts: z
        .string()
        .optional()
        .describe("Thread timestamp to get replies from"),
      limit: z.number().optional().default(100),
      cursor: z.string().optional(),
      oldest: z
        .string()
        .optional()
        .describe("Only messages after this Unix timestamp"),
      latest: z
        .string()
        .optional()
        .describe("Only messages before this Unix timestamp"),
      inclusive: z.boolean().optional().default(false),
      include_all_metadata: z.boolean().optional().default(false),
    },
    async (input: ListMessagesParams) => {
      try {
        const result = await slackClient.listMessages(input);

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  messages: result.messages.map((msg) => ({
                    ts: msg.ts,
                    text: msg.text,
                    user: msg.user,
                    bot_id: msg.bot_id,
                    type: msg.type,
                    subtype: msg.subtype,
                    thread_ts: msg.thread_ts,
                    reply_count: msg.reply_count,
                    reply_users_count: msg.reply_users_count,
                    latest_reply: msg.latest_reply,
                    timestamp: new Date(
                      parseFloat(msg.ts) * 1000
                    ).toISOString(),
                  })),
                  has_more: result.has_more,
                  next_cursor: result.next_cursor,
                  total: result.messages.length,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: false,
                  error: error instanceof Error ? error.message : String(error),
                },
                null,
                2
              ),
            },
          ],
        };
      }
    }
  );

  // Register tool: list_threads
  server.tool(
    "slack_list_threads",
    {
      channel: z.string().describe("Channel ID (e.g., C1234567890)"),
      limit: z.number().optional().default(100),
      cursor: z.string().optional(),
      oldest: z
        .string()
        .optional()
        .describe("Only threads after this Unix timestamp"),
      latest: z
        .string()
        .optional()
        .describe("Only threads before this Unix timestamp"),
    },
    async (input: ListThreadsParams) => {
      try {
        const result = await slackClient.listThreads(input);

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  threads: result.threads.map((thread) => ({
                    thread_ts: thread.thread_ts,
                    reply_count: thread.reply_count,
                    reply_users_count: thread.reply_users_count,
                    latest_reply: thread.latest_reply,
                    reply_users: thread.reply_users,
                    root_message: thread.root_message
                      ? {
                          text: thread.root_message.text,
                          user: thread.root_message.user,
                          timestamp: new Date(
                            parseFloat(thread.thread_ts) * 1000
                          ).toISOString(),
                        }
                      : undefined,
                  })),
                  has_more: result.has_more,
                  next_cursor: result.next_cursor,
                  total: result.threads.length,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: false,
                  error: error instanceof Error ? error.message : String(error),
                },
                null,
                2
              ),
            },
          ],
        };
      }
    }
  );

  // Create and connect transport
  const transport = new StdioServerTransport();

  // Handle graceful shutdown
  process.on("SIGINT", async () => {
    await server.close();
    process.exit(0);
  });

  // Connect and start server
  await server.connect(transport);
  console.error("Slack MCP server running on stdio transport");
}

// Run the server
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
