import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'beadforge_token';

/**
 * 登出回调 - 由 AuthStore 注入，避免循环依赖
 */
let onUnauthorized: (() => void) | null = null;

export function setOnUnauthorized(cb: () => void) {
  onUnauthorized = cb;
}

const client = axios.create({
  baseURL: 'http://172.16.2.89:8080/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// 请求拦截: 自动附加 token
client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截: 提取 data / 401 自动登出 / 错误处理
client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (!error.response) {
      return Promise.reject(new Error('网络连接失败，请检查网络'));
    }
    const status = error.response.status;
    if (status === 401) {
      onUnauthorized?.();
      return Promise.reject(new Error('登录已过期，请重新登录'));
    }
    const message = error.response.data?.message || '请求失败，请稍后重试';
    return Promise.reject(new Error(message));
  },
);

export { TOKEN_KEY };
export default client;
