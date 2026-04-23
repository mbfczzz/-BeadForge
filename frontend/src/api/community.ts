export type FeedMediaType = 'image' | 'video' | 'gif';

export interface FeedMediaData {
  type: FeedMediaType;
  demoAssetId: string;
  aspectRatio: number;
  durationSec?: number;
}

export interface FeedAuthorData {
  name: string;
  title: string;
}

export interface FeedItemData {
  id: number;
  user: FeedAuthorData;
  content: string;
  caption?: string;
  location?: string;
  media: FeedMediaData;
  coverAccent?: string;
  linkedPatternIdx?: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  timeAgo: string;
  tags: string[];
}

export interface HotTopicItem {
  tag: string;
  count: string;
}

export interface StoryUserItem {
  name: string;
  hasNew: boolean;
  ring: [string, string];
}

export interface CommunityUserData {
  name: string;
  title: string;
  bio: string;
  followers: number;
  following: number;
  posts: number;
  likes: number;
  joinDate: string;
  tags: string[];
}
