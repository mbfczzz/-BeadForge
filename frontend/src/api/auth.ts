import client from './client';

export interface LoginParams {
  username: string;
  password: string;
}

export interface RegisterParams {
  username: string;
  password: string;
  nickname?: string;
  email?: string;
}

export interface UserInfo {
  id: number;
  username: string;
  nickname: string;
  avatar: string | null;
  email: string | null;
  phone: string | null;
}

export interface AuthResponse {
  code: number;
  message: string;
  data: {
    token: string;
    user: UserInfo;
  };
}

export const authApi = {
  login: (params: LoginParams) => client.post<any, AuthResponse>('/auth/login', params),
  register: (params: RegisterParams) => client.post<any, AuthResponse>('/auth/register', params),
};
