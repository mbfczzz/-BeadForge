import { create } from 'zustand';

interface NavigationUIState {
  tabBarHidden: boolean;
  setTabBarHidden: (hidden: boolean) => void;
}

export const useNavigationUIStore = create<NavigationUIState>((set) => ({
  tabBarHidden: false,
  setTabBarHidden: (hidden) => set({ tabBarHidden: hidden }),
}));
