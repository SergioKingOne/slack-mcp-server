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

export interface SlackUser {
  id: string;
  team_id: string;
  name: string;
  deleted: boolean;
  real_name: string;
  tz: string;
  tz_label: string;
  tz_offset: number;
  profile: {
    title?: string;
    phone?: string;
    skype?: string;
    real_name?: string;
    real_name_normalized?: string;
    display_name?: string;
    display_name_normalized?: string;
    status_text?: string;
    status_emoji?: string;
    status_expiration?: number;
    avatar_hash?: string;
    email?: string;
    image_original?: string;
    image_24?: string;
    image_32?: string;
    image_48?: string;
    image_72?: string;
    image_192?: string;
    image_512?: string;
  };
  is_admin?: boolean;
  is_owner?: boolean;
  is_primary_owner?: boolean;
  is_restricted?: boolean;
  is_ultra_restricted?: boolean;
  is_bot?: boolean;
  is_app_user?: boolean;
  updated?: number;
}

export interface SlackFile {
  id: string;
  created: number;
  timestamp: number;
  name: string;
  title: string;
  mimetype: string;
  filetype: string;
  pretty_type: string;
  user: string;
  size: number;
  mode: string;
  is_external: boolean;
  external_type?: string;
  is_public: boolean;
  public_url_shared: boolean;
  url_private: string;
  url_private_download: string;
  permalink: string;
  channels?: string[];
  groups?: string[];
  ims?: string[];
  comments_count?: number;
}

export interface SlackBookmark {
  id: string;
  channel_id: string;
  title: string;
  link: string;
  emoji?: string;
  icon_url?: string;
  type: string;
  entity_id?: string;
  date_created: number;
  date_updated: number;
  rank: string;
  last_updated_by_user_id: string;
  last_updated_by_team_id: string;
  shortcut_id?: string;
  app_id?: string;
}

export interface SearchOptions {
  query: string;
  count?: number;
  page?: number;
  highlight?: boolean;
  sort?: "score" | "timestamp";
  sort_dir?: "asc" | "desc";
}

export interface ListUsersOptions {
  cursor?: string;
  limit?: number;
  include_locale?: boolean;
}

export interface ListFilesOptions {
  channel?: string;
  user?: string;
  ts_from?: string;
  ts_to?: string;
  types?: string;
  count?: number;
  page?: number;
}

export interface WorkspaceInfo {
  id: string;
  name: string;
  domain: string;
  email_domain?: string;
  icon?: {
    image_34?: string;
    image_44?: string;
    image_68?: string;
    image_88?: string;
    image_102?: string;
    image_132?: string;
    image_original?: string;
  };
  enterprise_id?: string;
  enterprise_name?: string;
}
