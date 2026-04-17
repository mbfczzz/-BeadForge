import type { LoginParams, RegisterParams, UserInfo } from '../api/auth';
import type { UserStats } from '../api/user';

export const MOCK_AUTH_USER_KEY = 'beadforge_mock_user';
export const MOCK_AUTH_PASSWORD_KEY = 'beadforge_mock_password';
export const MOCK_AUTH_STATS_KEY = 'beadforge_mock_stats';

export const TEST_LOGIN_CREDENTIALS = {
  username: 'demo',
  password: 'demo123',
};

export const TEST_LOGIN_USER: UserInfo = {
  id: 1001,
  username: TEST_LOGIN_CREDENTIALS.username,
  nickname: '测试用户',
  avatar: null,
  email: null,
  phone: '13800138000',
};

export const TEST_LOGIN_STATS: UserStats = {
  designCount: 6,
  likeCount: 28,
  followerCount: 42,
  followingCount: 18,
};

export const isMockToken = (token: string | null | undefined) => Boolean(token?.startsWith('mock-'));

export const createMockToken = (username: string) => `mock-${username}`;

export function buildMockUser(params: RegisterParams): UserInfo {
  return {
    id: Date.now(),
    username: params.username.trim(),
    nickname: params.nickname?.trim() || '新用户',
    avatar: null,
    email: params.email?.trim() || null,
    phone: null,
  };
}

export function getDefaultMockUser(): UserInfo {
  return TEST_LOGIN_USER;
}

export function getDefaultMockStats(): UserStats {
  return TEST_LOGIN_STATS;
}

export function validateMockLogin(params: LoginParams, user: UserInfo, password: string) {
  return params.username.trim() === user.username && params.password === password;
}
