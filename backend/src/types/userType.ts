//Internal Datamodel -- SSOT (Single Source of Truth)
interface UserType {
  id: string;
  username: string;
  email: string;
  role: "user" | "admin";
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

// API representation - everything but the sensitive
type UserResponseType = Omit<UserType, "passwordHash">;


// Body type for POST / users
// Clients send username, email and password when registering
type CreateUserBodyType = Pick<UserType, "username" | "email"> & {
  password: string;
};

//Body types for PATCH/users/:id
//All fields are optional, we do not allow updating of id or hash
type UpdateUserBodyType = Partial<Pick<UserType, "username" | "email" | "isActive">>;



export {
  UserType,
  UserResponseType,
  CreateUserBodyType,
  UpdateUserBodyType,
};



