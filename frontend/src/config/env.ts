import { Platform } from 'react-native';

/**
 * 环境配置
 *
 * - local:  本地开发（npx expo start），局域网 IP
 * - test:   测试环境（APK 包），106.14.165.141:6006
 * - prod:   生产环境（Docker Web），同端口相对路径
 *
 * 判断逻辑：
 * - __DEV__ = true  → local（本地调试）
 * - __DEV__ = false + web → prod（Docker 部署）
 * - __DEV__ = false + native → test（APK 包）
 */

const API_URLS = {
  local: 'http://172.16.2.89:8080/api',
  test:  'http://106.14.165.141:6006/api',
  prod:  '/api',
};

export function getApiUrl(): string {
  if (__DEV__) return API_URLS.local;
  if (Platform.OS === 'web') return API_URLS.prod;
  return API_URLS.test;
}

export function getEnvName(): string {
  if (__DEV__) return 'local';
  if (Platform.OS === 'web') return 'prod';
  return 'test';
}
