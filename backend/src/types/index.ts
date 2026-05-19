// src/types/index.ts
// interfaces för alla datamodeller

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Recipe {
  id: number;
  title: string;
  ingredients?: string[];
  steps?: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}



export interface RegisterBody {
  username: string;
  email: string;
  password: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: UserResponse;
}

export interface JwtPayload {
  sub: string;
  email: string;
  username: string;
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
}
