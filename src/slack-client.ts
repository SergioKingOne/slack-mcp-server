import { WebClient } from "@slack/web-api";
import type {
  SlackChannel,
  SlackMessage,
  SlackThread,
  SlackUser,
  SlackFile,
  SlackBookmark,
  WorkspaceInfo,
  ListChannelsOptions,
  ListMessagesOptions,
  ListThreadsOptions,
  ListUsersOptions,
  ListFilesOptions,
  SearchOptions,
} from "./types.js";

export class SlackClient {
  private client: WebClient;
  private teamId?: string;

  constructor(token: string, teamId?: string) {
    if (!token) {
      throw new Error("Slack bot token is required");
    }
    this.client = new WebClient(token);
    this.teamId = teamId;
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

  async searchMessages(options: SearchOptions): Promise<{
    messages: Array<{
      channel: SlackChannel;
      message: SlackMessage;
    }>;
    total: number;
    page: number;
    pages: number;
  }> {
    try {
      const result = await this.client.search.messages({
        query: options.query,
        count: options.count || 20,
        page: options.page || 1,
        highlight: options.highlight ?? true,
        sort: options.sort || "score",
        sort_dir: options.sort_dir || "desc",
      });

      const matches = (result.messages?.matches || []).map((match: any) => ({
        channel: match.channel as SlackChannel,
        message: {
          ...match,
          timestamp: new Date(parseFloat(match.ts) * 1000).toISOString(),
        } as SlackMessage,
      }));

      return {
        messages: matches,
        total: result.messages?.total || 0,
        page: result.messages?.paging?.page || 1,
        pages: result.messages?.paging?.pages || 1,
      };
    } catch (error) {
      throw new Error(
        `Failed to search messages: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async getUserInfo(userId: string): Promise<SlackUser | null> {
    try {
      const result = await this.client.users.info({
        user: userId,
      });
      return result.user as SlackUser;
    } catch (error) {
      return null;
    }
  }

  async listUsers(options: ListUsersOptions = {}): Promise<{
    users: SlackUser[];
    next_cursor?: string;
  }> {
    try {
      const result = await this.client.users.list({
        cursor: options.cursor,
        limit: options.limit || 100,
        include_locale: options.include_locale,
      });

      return {
        users: (result.members || []) as SlackUser[],
        next_cursor: result.response_metadata?.next_cursor,
      };
    } catch (error) {
      throw new Error(
        `Failed to list users: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async listBookmarks(channelId: string): Promise<SlackBookmark[]> {
    try {
      const result = await this.client.bookmarks.list({
        channel_id: channelId,
      });
      return (result.bookmarks || []) as SlackBookmark[];
    } catch (error) {
      throw new Error(
        `Failed to list bookmarks: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async listFiles(options: ListFilesOptions = {}): Promise<{
    files: SlackFile[];
    paging: {
      count: number;
      total: number;
      page: number;
      pages: number;
    };
  }> {
    try {
      const result = await this.client.files.list({
        channel: options.channel,
        user: options.user,
        ts_from: options.ts_from,
        ts_to: options.ts_to,
        types: options.types,
        count: options.count || 20,
        page: options.page || 1,
      });

      return {
        files: (result.files || []) as SlackFile[],
        paging: result.paging as any,
      };
    } catch (error) {
      throw new Error(
        `Failed to list files: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async addReaction(
    channel: string,
    timestamp: string,
    name: string
  ): Promise<boolean> {
    try {
      await this.client.reactions.add({
        channel,
        timestamp,
        name,
      });
      return true;
    } catch (error) {
      if ((error as any)?.data?.error === "already_reacted") {
        return true; // Already reacted, consider it success
      }
      throw new Error(
        `Failed to add reaction: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async removeReaction(
    channel: string,
    timestamp: string,
    name: string
  ): Promise<boolean> {
    try {
      await this.client.reactions.remove({
        channel,
        timestamp,
        name,
      });
      return true;
    } catch (error) {
      if ((error as any)?.data?.error === "no_reaction") {
        return true; // No reaction to remove, consider it success
      }
      throw new Error(
        `Failed to remove reaction: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async getWorkspaceInfo(): Promise<WorkspaceInfo | null> {
    try {
      const result = await this.client.team.info({
        team: this.teamId,
      });
      return result.team as WorkspaceInfo;
    } catch (error) {
      return null;
    }
  }

  async getAuthInfo(): Promise<{
    user_id: string;
    team_id: string;
    bot_id?: string;
  } | null> {
    try {
      const result = await this.client.auth.test();
      return {
        user_id: result.user_id as string,
        team_id: result.team_id as string,
        bot_id: result.bot_id as string | undefined,
      };
    } catch (error) {
      return null;
    }
  }
}
