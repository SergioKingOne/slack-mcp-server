import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SlackClient } from "./slack-client.js";

export function registerResources(server: McpServer, slackClient: SlackClient) {
  // Workspace info resource
  server.resource(
    "Workspace Information",
    "slack://workspace",
    {
      description: "Current Slack workspace information",
      mimeType: "application/json",
    },
    async () => {
      try {
        const workspace = await slackClient.getWorkspaceInfo();
        if (!workspace) {
          throw new Error("Unable to fetch workspace information");
        }
        return {
          contents: [
            {
              uri: "slack://workspace",
              mimeType: "application/json",
              text: JSON.stringify(
                {
                  id: workspace.id,
                  name: workspace.name,
                  domain: workspace.domain,
                  email_domain: workspace.email_domain,
                  enterprise_id: workspace.enterprise_id,
                  enterprise_name: workspace.enterprise_name,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return {
          contents: [
            {
              uri: "slack://workspace",
              mimeType: "application/json",
              text: JSON.stringify(
                {
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

  // Current user (bot) info resource
  server.resource(
    "Bot User Information",
    "slack://me",
    {
      description: "Information about the current bot user",
      mimeType: "application/json",
    },
    async () => {
      try {
        const authInfo = await slackClient.getAuthInfo();
        if (!authInfo) {
          throw new Error("Unable to fetch auth information");
        }
        const userInfo = await slackClient.getUserInfo(authInfo.user_id);
        if (!userInfo) {
          throw new Error("Unable to fetch user information");
        }
        return {
          contents: [
            {
              uri: "slack://me",
              mimeType: "application/json",
              text: JSON.stringify(
                {
                  user_id: authInfo.user_id,
                  bot_id: authInfo.bot_id,
                  team_id: authInfo.team_id,
                  name: userInfo.name,
                  real_name: userInfo.real_name,
                  is_bot: userInfo.is_bot,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return {
          contents: [
            {
              uri: "slack://me",
              mimeType: "application/json",
              text: JSON.stringify(
                {
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

  // Users list resource
  server.resource(
    "Workspace Users",
    "slack://users",
    {
      description: "List of all users in the workspace",
      mimeType: "application/json",
    },
    async () => {
      try {
        const allUsers: any[] = [];
        let cursor: string | undefined;
        // Fetch all users (handling pagination)
        do {
          const result = await slackClient.listUsers({ cursor, limit: 200 });
          allUsers.push(...result.users.filter((user) => !user.deleted));
          cursor = result.next_cursor;
        } while (cursor);
        return {
          contents: [
            {
              uri: "slack://users",
              mimeType: "application/json",
              text: JSON.stringify(
                {
                  total: allUsers.length,
                  users: allUsers.map((user) => ({
                    id: user.id,
                    name: user.name,
                    real_name: user.real_name,
                    display_name: user.profile.display_name,
                    email: user.profile.email,
                    is_bot: user.is_bot,
                    is_admin: user.is_admin,
                    timezone: user.tz,
                  })),
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return {
          contents: [
            {
              uri: "slack://users",
              mimeType: "application/json",
              text: JSON.stringify(
                {
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

  // Channels list resource
  server.resource(
    "All Channels",
    "slack://channels",
    {
      description: "List of all accessible channels",
      mimeType: "application/json",
    },
    async () => {
      try {
        const allChannels: any[] = [];
        let cursor: string | undefined;
        // Fetch all channels (handling pagination)
        do {
          const result = await slackClient.listChannels({
            cursor,
            limit: 200,
            types: "public_channel,private_channel,mpim,im",
          });
          allChannels.push(...result.channels);
          cursor = result.next_cursor;
        } while (cursor);
        return {
          contents: [
            {
              uri: "slack://channels",
              mimeType: "application/json",
              text: JSON.stringify(
                {
                  total: allChannels.length,
                  channels: allChannels.map((ch) => ({
                    id: ch.id,
                    name: ch.name,
                    is_private: ch.is_private,
                    is_archived: ch.is_archived,
                    is_channel: ch.is_channel,
                    is_group: ch.is_group,
                    is_im: ch.is_im,
                    is_mpim: ch.is_mpim,
                    topic: ch.topic?.value,
                    purpose: ch.purpose?.value,
                    num_members: ch.num_members,
                  })),
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return {
          contents: [
            {
              uri: "slack://channels",
              mimeType: "application/json",
              text: JSON.stringify(
                {
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
