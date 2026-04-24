import { useEffect } from 'react';
import { useNavigationUIStore } from '../store/useNavigationUIStore';

export function useTabBarVisibility(hidden: boolean) {
  const setTabBarHidden = useNavigationUIStore((state) => state.setTabBarHidden);

  useEffect(() => {
    setTabBarHidden(hidden);

    return () => {
      setTabBarHidden(false);
    };
  }, [hidden, setTabBarHidden]);
}
