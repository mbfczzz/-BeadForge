import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from '../config/env';

const TOKEN_KEY = 'beadforge_token';

let onUnauthorized: (() => void) | null = null;
export function setOnUnauthorized(cb: () => void) {
  onUnauthorized = cb;
}

const client = axios.create({
  baseURL: getApiUrl(),
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

// 响应拦截: 提取 data / 业务错误码 / 401 自动登出 / 网络错误
client.interceptors.response.use(
  (response) => {
    const body = response.data;

    // 后端 BusinessException 返回 HTTP 200 但 code !== 200
    if (body && typeof body.code === 'number' && body.code !== 200 && body.code !== 0) {
      // 业务错误 — 转换为友好提示
      const msg = body.message || '操作失败，请重试';
      return Promise.reject(new Error(msg));
    }

    return body;
  },
  (error) => {
    // axios 超时（ECONNABORTED）也走"无 response"分支，但语义不同 ——
    // 单独识别可以让 AI 生图、图片上传这种长任务报"超时"而不是误导成"断网"
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('请求超时，请稍后重试'));
    }
    if (!error.response) {
      return Promise.reject(new Error('网络连接失败，请检查网络'));
    }

    const status = error.response.status;

    if (status === 401) {
      onUnauthorized?.();
      return Promise.reject(new Error('登录已过期，请重新登录'));
    }

    // 提取后端返回的业务消息
    const body = error.response.data;
    let message: string;

    if (body?.message) {
      message = body.message;
    } else if (status === 400) {
      message = '请求参数有误';
    } else if (status === 403) {
      message = '没有访问权限';
    } else if (status === 404) {
      message = '请求的资源不存在';
    } else if (status === 500) {
      message = '服务器开小差了，请稍后重试';
    } else if (status === 502 || status === 503) {
      message = '服务暂时不可用，请稍后重试';
    } else {
      message = '请求失败，请稍后重试';
    }

    return Promise.reject(new Error(message));
  },
);

export { TOKEN_KEY };
export default client;
