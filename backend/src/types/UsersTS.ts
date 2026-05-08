//Internal Datamodel -- SSOT (Single Sourse of Truth)
export interface UserModelTS {
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
export type UserResponseTS = Omit<UserModelTS, "passwordHash">


// Body type for POST / users
// Clients send username and email when registering
export type CreateUserBodyTS = Pick<UserModelTS, "username" | "email"> & {
  password: string;
}

//Body types for PATCH/users/:id
//All fields are optional, we do not allow updating of id or hash
export type UpdateUserBody = Partial<Pick<UserModelTS, "email" | "role">>;







