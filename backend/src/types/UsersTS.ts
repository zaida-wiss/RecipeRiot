// src/types/index.ts

import { MongoUnexpectedServerResponseError } from "mongodb";

//Internal Datamodel -- SSOT (Single Sourse of Truth)
export interface UserModel {
  id: number;
  username: string;
  email: string;
  role: "user" | "admin";
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

// API representation - everything but the sensitive
export type UserResponse = Omit<UserModel, "passwordHash">


// Body type for POST / users
// Clients send username and email when registering
export type CreateUserBody = Pick<UserModel, "email"> & {
  password: string;
}






