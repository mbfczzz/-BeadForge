import { create } from 'zustand';
import { MOCK_PATTERN_LISTINGS } from '../mock/app';

export interface MarketPattern {
  id: number;
  title: string;
  author: string;
  authorId: number;
  price: number;
  free: boolean;
  patIdx: number;
  cat: string;
  downloads: number;
  rating: number;
  cols: number;
  rows: number;
  desc: string;
  gridData?: string[][];
  createdAt: string;
}

interface PatternState {
  listings: MarketPattern[];
  purchased: Set<number>;
  myListings: Set<number>;
  buy: (id: number) => void;
  publish: (pattern: Omit<MarketPattern, 'id' | 'downloads' | 'rating' | 'createdAt'>) => number;
  unlist: (id: number) => void;
  hasBought: (id: number) => boolean;
  isMine: (id: number) => boolean;
}

let nextId = 300;

export const usePatternStore = create<PatternState>((set, get) => ({
  listings: MOCK_PATTERN_LISTINGS,
  purchased: new Set<number>(),
  myListings: new Set<number>(),

  buy: (id) => {
    set((state) => {
      const purchased = new Set(state.purchased);
      purchased.add(id);
      return {
        purchased,
        listings: state.listings.map((item) =>
          item.id === id ? { ...item, downloads: item.downloads + 1 } : item,
        ),
      };
    });
  },

  publish: (pattern) => {
    const id = nextId++;
    const newPattern: MarketPattern = {
      ...pattern,
      id,
      downloads: 0,
      rating: 5,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    set((state) => {
      const myListings = new Set(state.myListings);
      myListings.add(id);
      return {
        listings: [newPattern, ...state.listings],
        myListings,
      };
    });

    return id;
  },

  unlist: (id) => {
    set((state) => {
      const myListings = new Set(state.myListings);
      myListings.delete(id);
      return {
        listings: state.listings.filter((item) => item.id !== id),
        myListings,
      };
    });
  },

  hasBought: (id) => get().purchased.has(id) || get().myListings.has(id),
  isMine: (id) => get().myListings.has(id),
}));
