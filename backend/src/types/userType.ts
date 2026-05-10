//Internal Datamodel -- SSOT (Single Source of Truth)
// UserType beskriver hur en komplett användare ser ut i applikationens egen typvärld.
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

// UserDocument beskriver det som sparas i MongoDB, där Mongoose själv hanterar _id.
interface UserDocument {
  username: string;
  email: string;
  role: "user" | "admin";
  passwordHash: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// API representation - everything but the sensitive
// Response-typen tar bort passwordHash så klienten inte ska få känslig data.
type UserResponseType = Omit<UserType, "passwordHash">;


// Body type for POST / users
// Clients send username, email and password when registering
// Klienten skickar password, men modellen sparar passwordHash.
type CreateUserBodyType = Pick<UserType, "username" | "email"> & {
  password: string;
};

//Body types for PATCH/users/:id
//All fields are optional, we do not allow updating of id or hash
// PATCH får bara uppdatera ett urval av säkra fält.
type UpdateUserBodyType = Partial<Pick<UserType, "username" | "email" | "isActive">>;



export {
  UserType,
  UserDocument,
  UserResponseType,
  CreateUserBodyType,
  UpdateUserBodyType,
};


