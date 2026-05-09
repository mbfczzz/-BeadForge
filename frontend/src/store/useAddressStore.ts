import { create } from 'zustand';
import type { ProfileAddressItem } from '../api/profile';
import { addressApi } from '../api/address';

interface AddressState {
  addresses: ProfileAddressItem[];
  loading: boolean;
  loadAddresses: () => Promise<void>;
  createAddress: (data: Omit<ProfileAddressItem, 'id'>) => Promise<void>;
  updateAddress: (id: string, data: Omit<ProfileAddressItem, 'id'>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
}

export const useAddressStore = create<AddressState>((set, get) => ({
  addresses: [],
  loading: false,

  loadAddresses: async () => {
    set({ loading: true });
    try {
      const res = await addressApi.list();
      set({ addresses: res.data || [], loading: false });
    } catch {
      set({ addresses: [], loading: false });
    }
  },

  createAddress: async (data) => {
    try {
      await addressApi.create({
        receiver: data.receiver,
        phone: data.phone,
        region: data.region,
        detail: data.detail,
        tag: data.tag,
        isDefault: data.isDefault,
      });
      await get().loadAddresses();
    } catch (e) {
      throw e; // 冒到 UI 层显示真实失败原因
    }
  },

  updateAddress: async (id, data) => {
    try {
      await addressApi.update(id, {
        receiver: data.receiver,
        phone: data.phone,
        region: data.region,
        detail: data.detail,
        tag: data.tag,
        isDefault: data.isDefault,
      });
      await get().loadAddresses();
    } catch (e) {
      throw e;
    }
  },

  deleteAddress: async (id) => {
    try {
      await addressApi.remove(id);
      await get().loadAddresses();
    } catch (e) {
      throw e;
    }
  },

  setDefaultAddress: async (id) => {
    try {
      await addressApi.setDefault(id);
      await get().loadAddresses();
    } catch (e) {
      throw e;
    }
  },
}));
