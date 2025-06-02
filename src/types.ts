export interface SlackChannel {
  id: string;
  name: string;
  is_channel: boolean;
  is_group: boolean;
  is_im: boolean;
  is_mpim: boolean;
  is_private: boolean;
  created: number;
  creator?: string;
  is_archived: boolean;
  is_general: boolean;
  topic?: {
    value: string;
    creator: string;
    last_set: number;
  };
  purpose?: {
    value: string;
    creator: string;
    last_set: number;
  };
  num_members?: number;
}

export interface SlackMessage {
  type: string;
  subtype?: string;
  text?: string;
  ts: string;
  user?: string;
  bot_id?: string;
  thread_ts?: string;
  reply_count?: number;
  reply_users_count?: number;
  latest_reply?: string;
  reply_users?: string[];
  attachments?: any[];
  blocks?: any[];
  reactions?: {
    name: string;
    users: string[];
    count: number;
  }[];
}

export interface SlackThread {
  thread_ts: string;
  reply_count: number;
  reply_users_count: number;
  latest_reply: string;
  reply_users: string[];
  root_message?: SlackMessage;
}

export interface ListChannelsOptions {
  exclude_archived?: boolean;
  types?: string;
  limit?: number;
  cursor?: string;
}

export interface ListMessagesOptions {
  channel: string;
  cursor?: string;
  limit?: number;
  oldest?: string;
  latest?: string;
  inclusive?: boolean;
  include_all_metadata?: boolean;
  thread_ts?: string;
}

export interface ListThreadsOptions {
  channel: string;
  cursor?: string;
  limit?: number;
  oldest?: string;
  latest?: string;
}
