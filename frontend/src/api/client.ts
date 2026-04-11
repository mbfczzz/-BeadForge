import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'beadforge_token';

/**
 * Axios 实例 - 统一请求封装
 */
const client = axios.create({
  baseURL: 'http://10.0.2.2:8080/api', // Android 模拟器访问本机
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

// 响应拦截: 统一提取 data / 处理错误
client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || '网络请求失败';
    return Promise.reject(new Error(message));
  },
);

export { TOKEN_KEY };
export default client;
