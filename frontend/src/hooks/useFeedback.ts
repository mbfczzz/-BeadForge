import { useCallback, useState, useRef } from 'react';
import { Platform } from 'react-native';

/**
 * 触觉反馈 — iOS 用 expo-haptics，Android/Web 静默
 */
let Haptics: any = null;
try { Haptics = require('expo-haptics'); } catch {}

/** 轻触反馈 */
export function hapticLight() {
  if (Platform.OS === 'web') return;
  try { Haptics?.impactAsync?.(Haptics.ImpactFeedbackStyle.Light); } catch {}
}

/** 中等反馈 */
export function hapticMedium() {
  if (Platform.OS === 'web') return;
  try { Haptics?.impactAsync?.(Haptics.ImpactFeedbackStyle.Medium); } catch {}
}

/** 成功反馈 */
export function hapticSuccess() {
  if (Platform.OS === 'web') return;
  try { Haptics?.notificationAsync?.(Haptics.NotificationFeedbackType.Success); } catch {}
}

/** 选择反馈 */
export function hapticSelection() {
  if (Platform.OS === 'web') return;
  try { Haptics?.selectionAsync?.(); } catch {}
}

/**
 * Toast hook — 轻量级临时提示
 */
export function useToast() {
  const [msg, setMsg] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((text: string, duration = 1500) => {
    if (timer.current) clearTimeout(timer.current);
    setMsg(text);
    timer.current = setTimeout(() => setMsg(''), duration);
  }, []);

  const hide = useCallback(() => setMsg(''), []);

  return { msg, show, hide };
}
