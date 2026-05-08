//Internal Datamodel -- SSOT (Single Source of Truth)
export interface UserModelTypes {
  username: string;
  email: string;
  role: "user" | "admin";
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

// API representation - everything but the sensitive
export type UserResponseTS = Omit<UserModelTypes, "passwordHash">;


// Body type for POST / users
// Clients send username, email and password when registering
export type CreateUserBodyTS = Pick<UserModelTypes, "username" | "email"> & {
  password: string;
};

//Body types for PATCH/users/:id
//All fields are optional, we do not allow updating of id or hash
export type UpdateUserBody = Partial<Pick<UserModelTypes, "username" | "email" | "isActive">>;







