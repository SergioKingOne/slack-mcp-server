import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SlackClient } from "./slack-client.js";

// Tool parameter schemas
const ListChannelsSchema = z.object({
  exclude_archived: z.boolean().optional().default(true),
  types: z.string().optional().default("public_channel,private_channel"),
  limit: z.number().optional().default(100),
  cursor: z.string().optional(),
});

const ListMessagesSchema = z.object({
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
});

const ListThreadsSchema = z.object({
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
});

const SearchMessagesSchema = z.object({
  query: z.string().describe("Search query (supports Slack search modifiers)"),
  count: z.number().optional().default(20),
  page: z.number().optional().default(1),
  highlight: z.boolean().optional().default(true),
  sort: z.enum(["score", "timestamp"]).optional().default("score"),
  sort_dir: z.enum(["asc", "desc"]).optional().default("desc"),
});

const GetUserInfoSchema = z.object({
  user_id: z.string().describe("User ID (e.g., U1234567890)"),
});

const GetChannelInfoSchema = z.object({
  channel_id: z.string().describe("Channel ID (e.g., C1234567890)"),
});

const ListUsersSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().optional().default(100),
  include_locale: z.boolean().optional().default(false),
});

const ListBookmarksSchema = z.object({
  channel_id: z.string().describe("Channel ID (e.g., C1234567890)"),
});

const ListFilesSchema = z.object({
  channel: z.string().optional().describe("Filter files by channel"),
  user: z.string().optional().describe("Filter files by user"),
  ts_from: z
    .string()
    .optional()
    .describe("Filter files created after this timestamp"),
  ts_to: z
    .string()
    .optional()
    .describe("Filter files created before this timestamp"),
  types: z
    .string()
    .optional()
    .describe("Filter files by type (e.g., images, gdocs, pdfs)"),
  count: z.number().optional().default(20),
  page: z.number().optional().default(1),
});

const AddReactionSchema = z.object({
  channel: z.string().describe("Channel ID where the message is"),
  timestamp: z.string().describe("Message timestamp (ts)"),
  name: z
    .string()
    .describe("Reaction emoji name without colons (e.g., 'thumbsup')"),
});

const RemoveReactionSchema = z.object({
  channel: z.string().describe("Channel ID where the message is"),
  timestamp: z.string().describe("Message timestamp (ts)"),
  name: z
    .string()
    .describe("Reaction emoji name without colons (e.g., 'thumbsup')"),
});

export function registerTools(server: McpServer, slackClient: SlackClient) {
  // List channels tool
  server.tool(
    "slack_list_channels",
    ListChannelsSchema.shape,
    async (args, extra) => {
      try {
        const result = await slackClient.listChannels(args);
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

  // List messages tool
  server.tool(
    "slack_list_messages",
    ListMessagesSchema.shape,
    async (args, extra) => {
      try {
        const result = await slackClient.listMessages(args);
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

  // List threads tool
  server.tool(
    "slack_list_threads",
    ListThreadsSchema.shape,
    async (args, extra) => {
      try {
        const result = await slackClient.listThreads(args);
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

  // Search messages tool
  server.tool(
    "slack_search_messages",
    SearchMessagesSchema.shape,
    async (args, extra) => {
      try {
        const result = await slackClient.searchMessages(args);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  messages: result.messages.map((item) => ({
                    channel: {
                      id: item.channel.id,
                      name: item.channel.name,
                    },
                    message: {
                      ts: item.message.ts,
                      text: item.message.text,
                      user: item.message.user,
                    },
                  })),
                  total: result.total,
                  page: result.page,
                  pages: result.pages,
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

  // Get user info tool
  server.tool(
    "slack_get_user_info",
    GetUserInfoSchema.shape,
    async (args, extra) => {
      try {
        const user = await slackClient.getUserInfo(args.user_id);
        if (!user) {
          throw new Error("User not found");
        }
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  user: {
                    id: user.id,
                    name: user.name,
                    real_name: user.real_name,
                    display_name: user.profile.display_name,
                    status_text: user.profile.status_text,
                    status_emoji: user.profile.status_emoji,
                    email: user.profile.email,
                    title: user.profile.title,
                    is_bot: user.is_bot,
                    is_admin: user.is_admin,
                    timezone: user.tz,
                  },
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

  // Get channel info tool
  server.tool(
    "slack_get_channel_info",
    GetChannelInfoSchema.shape,
    async (args, extra) => {
      try {
        const channel = await slackClient.getChannelInfo(args.channel_id);
        if (!channel) {
          throw new Error("Channel not found");
        }
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  channel: {
                    id: channel.id,
                    name: channel.name,
                    is_private: channel.is_private,
                    is_archived: channel.is_archived,
                    topic: channel.topic?.value,
                    purpose: channel.purpose?.value,
                    created: new Date(channel.created * 1000).toISOString(),
                    creator: channel.creator,
                    num_members: channel.num_members,
                  },
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

  // List users tool
  server.tool(
    "slack_list_users",
    ListUsersSchema.shape,
    async (args, extra) => {
      try {
        const result = await slackClient.listUsers(args);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  users: result.users
                    .filter((user) => !user.deleted)
                    .map((user) => ({
                      id: user.id,
                      name: user.name,
                      real_name: user.real_name,
                      display_name: user.profile.display_name,
                      email: user.profile.email,
                      is_bot: user.is_bot,
                      is_admin: user.is_admin,
                    })),
                  next_cursor: result.next_cursor,
                  total: result.users.length,
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

  // List bookmarks tool
  server.tool(
    "slack_list_bookmarks",
    ListBookmarksSchema.shape,
    async (args, extra) => {
      try {
        const bookmarks = await slackClient.listBookmarks(args.channel_id);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  bookmarks: bookmarks.map((bookmark) => ({
                    id: bookmark.id,
                    title: bookmark.title,
                    link: bookmark.link,
                    emoji: bookmark.emoji,
                    type: bookmark.type,
                    created: new Date(
                      bookmark.date_created * 1000
                    ).toISOString(),
                  })),
                  total: bookmarks.length,
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

  // List files tool
  server.tool(
    "slack_list_files",
    ListFilesSchema.shape,
    async (args, extra) => {
      try {
        const result = await slackClient.listFiles(args);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  files: result.files.map((file) => ({
                    id: file.id,
                    name: file.name,
                    title: file.title,
                    mimetype: file.mimetype,
                    filetype: file.filetype,
                    size: file.size,
                    user: file.user,
                    created: new Date(file.created * 1000).toISOString(),
                    permalink: file.permalink,
                  })),
                  paging: result.paging,
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

  // Add reaction tool
  server.tool(
    "slack_add_reaction",
    AddReactionSchema.shape,
    async (args, extra) => {
      try {
        const success = await slackClient.addReaction(
          args.channel,
          args.timestamp,
          args.name
        );
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success,
                  message: success
                    ? "Reaction added successfully"
                    : "Failed to add reaction",
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

  // Remove reaction tool
  server.tool(
    "slack_remove_reaction",
    RemoveReactionSchema.shape,
    async (args, extra) => {
      try {
        const success = await slackClient.removeReaction(
          args.channel,
          args.timestamp,
          args.name
        );
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success,
                  message: success
                    ? "Reaction removed successfully"
                    : "Failed to remove reaction",
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
}
