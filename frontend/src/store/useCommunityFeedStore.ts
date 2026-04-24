import { create } from 'zustand';
import type { FeedItemData } from '../api/community';

interface CommunityFeedState {
  localFeeds: FeedItemData[];
  addLocalFeed: (feed: FeedItemData) => void;
}

export const useCommunityFeedStore = create<CommunityFeedState>((set) => ({
  localFeeds: [],
  addLocalFeed: (feed) => set((state) => ({ localFeeds: [feed, ...state.localFeeds] })),
}));
