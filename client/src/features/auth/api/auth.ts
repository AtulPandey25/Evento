import { apiClient } from '@/lib/api-client';
import type { User, LoginCredentials, RegisterData } from '@/types';

interface LoginResponse {
  accessToken: string;
  user: User;
}

interface RegisterResponse {
  message: string;
  user: User;
}

export async function loginUser(
  credentials: LoginCredentials,
): Promise<LoginResponse> {
  const result = await apiClient.post<{ access_token: string; user: User }>(
    '/auth/login',
    credentials,
  );

  const data = result as unknown as { access_token: string; user: User };

  return {
    accessToken: data.access_token,
    user: data.user,
  };
}

export async function registerUser(
  data: RegisterData,
): Promise<RegisterResponse> {
  const result = await apiClient.post<RegisterResponse>('/auth/register', data);
  return result as unknown as RegisterResponse;
}

export async function getProfile(): Promise<User> {
  const user = await apiClient.get<User>('/auth/profile');
  return user as unknown as User;
}
