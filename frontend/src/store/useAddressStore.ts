import { create } from 'zustand';
import type { ProfileAddressItem } from '../api/profile';
import { MOCK_PROFILE_ADDRESSES } from '../mock/profile';

interface AddressState {
  addresses: ProfileAddressItem[];
  createAddress: (data: Omit<ProfileAddressItem, 'id'>) => void;
  updateAddress: (id: string, data: Omit<ProfileAddressItem, 'id'>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
}

export const useAddressStore = create<AddressState>((set) => ({
  addresses: MOCK_PROFILE_ADDRESSES,

  createAddress: (data) => {
    set((state) => {
      const shouldBeDefault = data.isDefault || state.addresses.length === 0;
      const next: ProfileAddressItem = {
        ...data,
        id: `ADDR${Date.now().toString().slice(-8)}`,
        isDefault: shouldBeDefault,
      };

      if (!shouldBeDefault) {
        return { addresses: [next, ...state.addresses] };
      }

      return {
        addresses: [next, ...state.addresses.map((item) => ({ ...item, isDefault: false }))],
      };
    });
  },

  updateAddress: (id, data) => {
    set((state) => {
      const target = state.addresses.find((item) => item.id === id);
      if (!target) {
        return state;
      }

      const hasOtherDefault = state.addresses.some((item) => item.id !== id && item.isDefault);
      const shouldBeDefault = data.isDefault || (!hasOtherDefault && target.isDefault);

      return {
        addresses: state.addresses.map((item) => {
          if (item.id === id) {
            return { ...item, ...data, isDefault: shouldBeDefault };
          }

          if (shouldBeDefault) {
            return { ...item, isDefault: false };
          }

          return item;
        }),
      };
    });
  },

  deleteAddress: (id) => {
    set((state) => {
      const next = state.addresses.filter((item) => item.id !== id);
      if (next.length > 0 && !next.some((item) => item.isDefault)) {
        next[0] = { ...next[0], isDefault: true };
      }
      return { addresses: next };
    });
  },

  setDefaultAddress: (id) => {
    set((state) => ({
      addresses: state.addresses.map((item) => ({ ...item, isDefault: item.id === id })),
    }));
  },
}));
