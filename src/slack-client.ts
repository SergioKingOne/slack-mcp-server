import { WebClient } from "@slack/web-api";
import type {
  SlackChannel,
  SlackMessage,
  SlackThread,
  ListChannelsOptions,
  ListMessagesOptions,
  ListThreadsOptions,
} from "./types.js";

export class SlackClient {
  private client: WebClient;

  constructor(token: string) {
    if (!token) {
      throw new Error("Slack bot token is required");
    }
    this.client = new WebClient(token);
  }

  async listChannels(options: ListChannelsOptions = {}): Promise<{
    channels: SlackChannel[];
    next_cursor?: string;
  }> {
    try {
      const result = await this.client.conversations.list({
        exclude_archived: options.exclude_archived ?? true,
        types: options.types || "public_channel,private_channel",
        limit: options.limit || 100,
        cursor: options.cursor,
      });

      return {
        channels: (result.channels || []) as SlackChannel[],
        next_cursor: result.response_metadata?.next_cursor,
      };
    } catch (error) {
      throw new Error(
        `Failed to list channels: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async listMessages(options: ListMessagesOptions): Promise<{
    messages: SlackMessage[];
    has_more: boolean;
    next_cursor?: string;
  }> {
    try {
      // If thread_ts is provided, use conversations.replies
      if (options.thread_ts) {
        const result = await this.client.conversations.replies({
          channel: options.channel,
          ts: options.thread_ts,
          cursor: options.cursor,
          limit: options.limit || 100,
          oldest: options.oldest,
          latest: options.latest,
          inclusive: options.inclusive,
        });

        return {
          messages: (result.messages || []) as SlackMessage[],
          has_more: result.has_more || false,
          next_cursor: result.response_metadata?.next_cursor,
        };
      }

      // Otherwise use conversations.history
      const result = await this.client.conversations.history({
        channel: options.channel,
        cursor: options.cursor,
        limit: options.limit || 100,
        oldest: options.oldest,
        latest: options.latest,
        inclusive: options.inclusive,
        include_all_metadata: options.include_all_metadata,
      });

      return {
        messages: (result.messages || []) as SlackMessage[],
        has_more: result.has_more || false,
        next_cursor: result.response_metadata?.next_cursor,
      };
    } catch (error) {
      throw new Error(
        `Failed to list messages: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async listThreads(options: ListThreadsOptions): Promise<{
    threads: SlackThread[];
    has_more: boolean;
    next_cursor?: string;
  }> {
    try {
      // Get messages from the channel
      const result = await this.client.conversations.history({
        channel: options.channel,
        cursor: options.cursor,
        limit: options.limit || 100,
        oldest: options.oldest,
        latest: options.latest,
      });

      // Filter for messages that have replies (are thread parents)
      const threadMessages = (result.messages || []).filter(
        (msg: any) => msg.reply_count && msg.reply_count > 0
      );

      // Transform to thread format
      const threads: SlackThread[] = threadMessages.map((msg: any) => ({
        thread_ts: msg.ts,
        reply_count: msg.reply_count || 0,
        reply_users_count: msg.reply_users_count || 0,
        latest_reply: msg.latest_reply || msg.ts,
        reply_users: msg.reply_users || [],
        root_message: msg as SlackMessage,
      }));

      return {
        threads,
        has_more: result.has_more || false,
        next_cursor: result.response_metadata?.next_cursor,
      };
    } catch (error) {
      throw new Error(
        `Failed to list threads: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async getChannelInfo(channelId: string): Promise<SlackChannel | null> {
    try {
      const result = await this.client.conversations.info({
        channel: channelId,
      });
      return result.channel as SlackChannel;
    } catch (error) {
      return null;
    }
  }
}
