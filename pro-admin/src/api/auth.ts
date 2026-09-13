import { apiClient } from "./client";

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  is_active: boolean;
  created_at?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface TokenResponse {
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  user?: User;
  mfa_required?: boolean;
  mfa_token?: string;
}

// Backend LoginRequest schema uses email+password as JSON (NOT form-data)
export async function login(data: LoginRequest): Promise<TokenResponse> {
  const res = await apiClient.post<TokenResponse>("/api/v1/auth/login", {
    email: data.email,
    password: data.password,
  });
  return res.data;
}

export async function register(data: RegisterRequest): Promise<User> {
  const res = await apiClient.post<User>("/api/v1/auth/register", data);
  return res.data;
}

export async function challengeMfa(mfaToken: string, code: string): Promise<TokenResponse> {
  const res = await apiClient.post<TokenResponse>("/api/v1/auth/admin/mfa/challenge", {
    mfa_token: mfaToken,
    code: code
  });
  return res.data;
}