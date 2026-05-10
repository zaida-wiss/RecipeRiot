// src/controllers/usersController.ts
import { NextFunction, Request, Response } from "express";
import { User } from "../models/userModel";


//Hämtar och returnerar alla users.
const getAllUsers = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try{
    const users = await User.find();
    return res.json(users);
  } catch (error) {
    return next(error);
  }
};

//Hämtar en användare baserat på id från URL-parametern.
const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        error: {
           message: "Användaren hittades inte",
          status: 404,
         },
    });
  }

    return res.json(user);
  } catch (error) {
    return next(error);
  }
};

//Skapar en ny användare från data i request body.
const createUser = (req: Request, res: Response) => {
  const { username, email, password }: CreateUserBodyTypes = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "username, email och password krävs" });
  }

  const newUser: UserModelTypes = {
    id: users.length + 1,
    username,
    email,
    role: "user",
    passwordHash: `hashed-${password}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  };

  users.push(newUser);

  return res.status(201).json(toUserResponse(newUser));
};

// //Uppdaterar hela användar-objektet.
// const updateUserObject = (req: Request, res: Response) => {
//   const id = Number(req.params.id);
//   const index = users.findIndex((item) => item.id === id);

//   if (index === -1) {
//     return res.status(404).json({ message: "Användaren hittades inte" });
//   }

//   const { username, email, password }: CreateUserBodyTypes = req.body;

//   if (!username || !email || !password) {
//     return res.status(400).json({ message: "username, email och password krävs" });
//   }

//   const updatedUser: UserModelTypes = {
//     id,
//     username,
//     email,
//     role: users[index].role,
//     passwordHash: `hashed-${password}`,
//     createdAt: users[index].createdAt,
//     updatedAt: new Date(),
//     isActive: users[index].isActive,
//   };

//   users[index] = updatedUser;

//   return res.json(toUserResponse(updatedUser));
// };

// //Uppdaterar en eller flera användar-fält.
// const updateUserField = (req: Request, res: Response) => {
//   const id = Number(req.params.id);
//   const user = users.find((item) => item.id === id);

//   if (!user) {
//     return res.status(404).json({ message: "Användaren hittades inte" });
//   }

//   const { username, email, isActive }: UpdateUserBodyTypes = req.body;

//   if (username === undefined && email === undefined && isActive === undefined) {
//     return res.status(400).json({ message: "Skicka minst ett fält att uppdatera" });
//   }

//   if (username !== undefined) user.username = username;
//   if (email !== undefined) user.email = email;
//   if (isActive !== undefined) user.isActive = isActive;

//   user.updatedAt = new Date();

//   return res.json(toUserResponse(user));
// };

// //Tar bort en användare.
// const deleteUser = (req: Request, res: Response) => {
//   const id = Number(req.params.id);
//   const index = users.findIndex((item) => item.id === id);

//   if (index === -1) {
//     return res.status(404).json({ message: "Användaren hittades inte" });
//   }

//   users.splice(index, 1);

//   return res.status(204).send();
// };


export {
  getAllUsers,
  getUserById,
  createUser,
  // updateUserObject,
  // updateUserField,
  // deleteUser
};