// src/controllers/usersController.ts
import { NextFunction, Request, Response } from "express";
import { User } from "../models/userModel";
import type { CreateUserBodyType, UpdateUserBodyType } from "../types/userType";


//helpers
const hasRequiredUserFields = (
  username: unknown,
  email: unknown,
  password: unknown
) => Boolean(username && email && password);

const hasUserFieldToUpdate = (
  username: unknown,
  email: unknown,
  isActive: unknown
) => {
  return username !== undefined || email !== undefined || isActive !== undefined;
};


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
const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try{
    const { username, email, password } = req.body as CreateUserBodyType;

    if (!hasRequiredUserFields(username, email, password)) {
      return res.status(400).json({
        error: {
          message: "username, email och password krävs",
          status: 400,
        },
      });
    }

    const newUser = await User.create({
      username,
      email,
      passwordHash: `hashed-${password}`,
    });

    return res.status(201).json(newUser);
  } catch (error) {
    return next(error);
  }
};

// //Uppdaterar hela användar-objektet.
const updateUserObject = async (
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
          message: "Användaren hittades inte.",
          status: 404,
        },
      });
    }

    const { username, email, password } = req.body as CreateUserBodyType;

    if (!hasRequiredUserFields(username, email, password)) {
      return res.status(400).json({
        error: {
          message: "username, email och lösenord krävs.",
          status: 400,
        },
      });
    }

    user.username = username;
    user.email = email;
    user.passwordHash = `hashed-${password}`;

    const updatedUser = await user.save();

    return res.json(updatedUser);
  } catch (error) {
    return next(error);
  }
};



// //Uppdaterar en eller flera användar-fält.
const updateUserField = async (
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
          message: "Användaren hittades inte.",
          status: 404,
        },
      });
    }

    const { username, email, isActive } = req.body as UpdateUserBodyType;

    if (!hasUserFieldToUpdate(username, email, isActive)) {
      return res.status(400).json({
        error: {
          message: "Uppdatera användarnamn, email eller aktivitetsläge.",
          status: 400,
        }
      });
    }

    if (username !== undefined) {
      user.username = username;
    }

    if (email !== undefined) {
      user.email = email;
    }

    if (isActive !== undefined) {
      user.isActive = isActive;
    }

    const updatedUser = await user.save();

    return res.json(updatedUser);
  } catch (error) {
    return next(error);
  }
};


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
  updateUserObject,
  updateUserField,
  // deleteUser
};
