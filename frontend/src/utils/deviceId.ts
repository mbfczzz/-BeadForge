import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const KEY = 'beadforge_device_id';

function uuid(): string {
  // v4 风格随机 ID（不依赖 crypto，避免引入额外依赖；用于设备识别足够）
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function getOrCreateDeviceId(): Promise<string> {
  try {
    const existing = await AsyncStorage.getItem(KEY);
    if (existing) return existing;
    const id = uuid();
    await AsyncStorage.setItem(KEY, id);
    return id;
  } catch {
    return uuid();
  }
}

export function describeDeviceName(): string {
  switch (Platform.OS) {
    case 'ios':     return 'iOS 设备';
    case 'android': return 'Android 设备';
    case 'web':     return 'Web 浏览器';
    default:        return '未知设备';
  }
}
