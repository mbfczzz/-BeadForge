import { create } from 'zustand';
import type { ProductData } from '../api/market';

export interface CartItem {
  id: string;
  product: ProductData;
  qty: number;
  selected: boolean;
  variant: string;
}

interface CartState {
  items: CartItem[];
  addItem: (product: ProductData, options?: { qty?: number; variant?: string }) => void;
  updateQty: (id: string, qty: number) => void;
  toggleItem: (id: string) => void;
  toggleAll: (selected: boolean) => void;
  removeItem: (id: string) => void;
  clearSelected: () => void;
}

const buildItemId = (productId: number, variant: string) => `${productId}:${variant}`;

export const useCartStore = create<CartState>((set) => ({
  items: [],

  addItem: (product, options) => {
    const qty = Math.max(1, options?.qty || 1);
    const variant = options?.variant || '默认规格';
    const id = buildItemId(product.id, variant);

    set((state) => {
      const found = state.items.find((item) => item.id === id);
      if (found) {
        return {
          items: state.items.map((item) => (
            item.id === id
              ? { ...item, qty: item.qty + qty, selected: true }
              : item
          )),
        };
      }

      return {
        items: [
          {
            id,
            product,
            qty,
            selected: true,
            variant,
          },
          ...state.items,
        ],
      };
    });
  },

  updateQty: (id, qty) => {
    set((state) => ({
      items: state.items.map((item) => (
        item.id === id
          ? { ...item, qty: Math.max(1, qty) }
          : item
      )),
    }));
  },

  toggleItem: (id) => {
    set((state) => ({
      items: state.items.map((item) => (
        item.id === id
          ? { ...item, selected: !item.selected }
          : item
      )),
    }));
  },

  toggleAll: (selected) => {
    set((state) => ({
      items: state.items.map((item) => ({ ...item, selected })),
    }));
  },

  removeItem: (id) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
  },

  clearSelected: () => {
    set((state) => ({
      items: state.items.filter((item) => !item.selected),
    }));
  },
}));
