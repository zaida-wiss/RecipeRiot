// src/controllers/usersController.ts
import { Request, Response } from 'express';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// GET /api/v1/users
export const getAllUsers = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/users/:id
export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new NotFoundError('Användaren hittades inte');
      res.json(user);

  } catch (error) {
    next(error);
  }
};

// POST /api/v1/users (Registrering)
export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password, role } = req.body;

    // Kontrollera om e-postadressen redan är upptagen
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'E-postadressen är redan registrerad' });
    }

    // HÄR HASCHAS LÖSENORDET: Kryptera lösenordet innan det skickas till databasen
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Skapa användaren med det krypterade lösenordet
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role,
    });

    // Tack vare 'toJSON'-transformeringen i User.ts kommer lösenordet inte att skickas tillbaka i svaret
    return res.status(201).json(user);
  } catch (error) {
    return res.status(500).json({ message: 'Något gick fel vid registreringen' });
  }
};

// PUT /api/v1/users/:id
export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Om användaren uppdaterar sitt lösenord via PUT, hasha det också
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!user) {
  res.status(404).json({ message: 'Användaren hittades inte' });
  return;
    }
  res.json(user);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/users/:id
export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
    res.status(404).json({ message: 'Användaren hittades inte' });
    return;
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/users/login
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 1. Leta efter användaren i databasen
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Felaktig e-postadress eller lösenord' });
    }

    // 2. Använd comparePassword-metoden vi skapat i User.ts för att jämföra med hashen
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Felaktig e-postadress eller lösenord' });
    }

    // 3. Om lösenordet stämmer, generera ett JWT-token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' } // Token är giltig i 1 dag
    );

    // 4. Skicka tillbaka token och användarinfo till klienten
    return res.json({
      message: 'Inloggning lyckades',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Något gick fel vid inloggningen' });
  }
};
