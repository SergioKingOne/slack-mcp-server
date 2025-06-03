import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerPrompts(server: McpServer) {
  // Find recent discussions prompt
  const FindRecentDiscussionsArgs = z.object({
    topic: z.string().describe("The topic or keywords to search for"),
    days: z
      .string()
      .optional()
      .describe("Number of days to look back (default: 7)"),
  });
  server.prompt(
    "find_recent_discussions",
    "Find recent discussions about a specific topic across channels",
    FindRecentDiscussionsArgs.shape,
    async ({
      topic,
      days = "7",
    }: z.infer<typeof FindRecentDiscussionsArgs>) => {
      const daysNum = parseInt(days, 10);
      const dateStr = new Date(Date.now() - daysNum * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      return {
        messages: [
          {
            role: "user" as const,
            content: {
              type: "text" as const,
              text: `Find all recent discussions about "${topic}" in our Slack workspace from the last ${days} days.

Please:
1. Search for messages containing "${topic}" or related terms
2. Group the results by channel
3. For each relevant discussion, show:
   - Channel name
   - Message author
   - Message timestamp
   - Message content (with context if it's part of a thread)
   - Number of replies (if it's a thread)
4. Sort by relevance and recency
5. Summarize the key points from these discussions

Search query hint: Use the slack_search_messages tool with query: "${topic} after:${dateStr}"`,
            },
          },
        ],
      };
    }
  );

  // Channel activity summary prompt
  const ChannelActivitySummaryArgs = z.object({
    channel_names: z
      .string()
      .describe(
        "Comma-separated list of channel names (e.g., 'general,engineering,support')"
      ),
    hours: z
      .string()
      .optional()
      .describe("Number of hours to look back (default: 24)"),
  });
  server.prompt(
    "channel_activity_summary",
    "Generate a summary of recent activity in specific channels",
    ChannelActivitySummaryArgs.shape,
    async ({
      channel_names,
      hours = "24",
    }: z.infer<typeof ChannelActivitySummaryArgs>) => {
      const hoursNum = parseInt(hours, 10);
      const timestamp = Math.floor(
        Date.now() / 1000 - hoursNum * 3600
      ).toString();

      return {
        messages: [
          {
            role: "user" as const,
            content: {
              type: "text" as const,
              text: `Generate a comprehensive activity summary for the following channels: ${channel_names}

For the last ${hours} hours, please:

1. First, find the channel IDs for: ${channel_names}
2. For each channel:
   - Count total messages posted
   - Identify the most active users
   - List any threads with significant discussion (3+ replies)
   - Highlight messages with many reactions
   - Note any shared files or links
   - Identify key topics discussed

3. Provide insights:
   - Peak activity times
   - Cross-channel themes or related discussions
   - Important announcements or decisions
   - Action items or questions that need attention

Use the following tools:
- slack_list_channels to find channel IDs
- slack_list_messages with oldest:"${timestamp}" to get recent messages
- slack_list_threads to identify active discussions

Format the summary in a clear, executive-friendly format.`,
            },
          },
        ],
      };
    }
  );

  // Team member activity prompt
  const TeamMemberActivityArgs = z.object({
    user_names: z
      .string()
      .describe("Comma-separated list of user names or email addresses"),
  });
  server.prompt(
    "team_member_activity",
    "Check recent activity and status of team members",
    TeamMemberActivityArgs.shape,
    async ({ user_names }: z.infer<typeof TeamMemberActivityArgs>) => {
      return {
        messages: [
          {
            role: "user" as const,
            content: {
              type: "text" as const,
              text: `Check the recent Slack activity for these team members: ${user_names}

Please provide:

1. User Information:
   - Find each user's ID using slack_list_users
   - Get their profile details with slack_get_user_info
   - Current status (emoji and text)
   - Time zone and local time

2. Recent Activity:
   - Search for their recent messages across channels
   - Identify channels they're most active in
   - Recent files they've shared
   - Threads they've participated in

3. Collaboration Patterns:
   - Who they frequently interact with
   - Main topics they discuss
   - Channels they're members of

This will help understand team dynamics and ensure no one is blocked or needs assistance.`,
            },
          },
        ],
      };
    }
  );

  // Daily standup helper prompt
  const DailyStandupHelperArgs = z.object({
    team_channel: z.string().describe("The team's main channel name"),
    standup_channel: z
      .string()
      .optional()
      .describe("Channel where standups are posted (if different)"),
  });
  server.prompt(
    "daily_standup_helper",
    "Gather information for daily standup meetings",
    DailyStandupHelperArgs.shape,
    async ({
      team_channel,
      standup_channel,
    }: z.infer<typeof DailyStandupHelperArgs>) => {
      const yesterday = Math.floor(Date.now() / 1000 - 24 * 3600).toString();

      return {
        messages: [
          {
            role: "user" as const,
            content: {
              type: "text" as const,
              text: `Help prepare for daily standup by gathering relevant information from ${team_channel}${standup_channel ? ` and ${standup_channel}` : ""}.

Please collect:

1. Yesterday's Updates:
   - Find messages in ${standup_channel || team_channel} from the last 24 hours
   - Look for keywords like "completed", "finished", "done", "shipped"
   - Identify completed tasks and achievements

2. Current Work:
   - Active threads and discussions
   - Open questions that need answers
   - Work-in-progress mentions

3. Blockers:
   - Search for keywords like "blocked", "stuck", "help", "issue", "problem"
   - Unresolved questions from yesterday
   - Requests waiting for responses

4. Team Highlights:
   - Celebrations or kudos (look for reactions like :tada:, :clap:)
   - Important announcements
   - Upcoming deadlines mentioned

Use oldest:"${yesterday}" when listing messages to focus on the last 24 hours.

Format this as a standup summary that the team lead can quickly review.`,
            },
          },
        ],
      };
    }
  );

  // Knowledge search prompt
  const KnowledgeSearchArgs = z.object({
    query: z
      .string()
      .describe(
        "What you're looking for (e.g., 'deployment process', 'API documentation')"
      ),
    channels: z
      .string()
      .optional()
      .describe("Specific channels to search in (optional, comma-separated)"),
  });
  server.prompt(
    "knowledge_search",
    "Search for institutional knowledge and previous solutions",
    KnowledgeSearchArgs.shape,
    async ({ query, channels }: z.infer<typeof KnowledgeSearchArgs>) => {
      return {
        messages: [
          {
            role: "user" as const,
            content: {
              type: "text" as const,
              text: `Search for institutional knowledge about: "${query}"

Please help find relevant information by:

1. Searching for messages:
   - Use slack_search_messages with query: "${query}${channels ? ` in:${channels.replace(/,/g, " in:")}` : ""}"
   - Look for detailed explanations, documentation links, or solutions

2. Check pinned messages and bookmarks:
   - If you find relevant channels, check their bookmarks with slack_list_bookmarks
   - These often contain important documentation

3. Find subject matter experts:
   - Identify users who frequently discuss this topic
   - Note their contributions and expertise

4. Compile findings:
   - Group information by relevance
   - Include message links (permalink) for reference
   - Highlight the most useful/detailed responses
   - Note any conflicting information or outdated content

5. Provide recommendations:
   - Suggest channels to join for more information
   - Identify people to reach out to for clarification
   - Recommend documentation that should be created if gaps exist

This search will help preserve and surface tribal knowledge within the organization.`,
            },
          },
        ],
      };
    }
  );
}
