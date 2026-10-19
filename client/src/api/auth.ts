import { request } from './client';
import { AuthResponse, RegisterPayload } from '../types';

export function registerUser(payload: RegisterPayload): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/register', {
    method: 'POST',
    data: payload,
  });
}

export function loginUser(login: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    data: { login, password },
  });
}
