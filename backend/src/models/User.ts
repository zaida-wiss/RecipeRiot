// src/models/User.ts
import mongoose, { Schema, Document } from 'mongoose';
<<<<<<< HEAD
import type { UserRole } from "../types/index.js";
=======
import bcrypt from 'bcryptjs';
>>>>>>> 80ebae6 (lagt till autentisering, bcryp och JWT)

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
<<<<<<< HEAD
    // Vi lagrar aldrig password i klartext.
  // Därför heter fältet passwordHash.
  passwordHash: string;
  role: UserRole;
=======
  password?: string;
  role: 'user' | 'kock' | 'admin';
>>>>>>> 80ebae6 (lagt till autentisering, bcryp och JWT)
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, 'Username är obligatorisk'],
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: [true, 'Email är obligatorisk'],
      trim: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Lösenord är obligatoriskt'],
    },
    role: {
      type: String,
      enum: ['user', 'kock', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  const user = this as any;
  if (!user.password) return false;
  return bcrypt.compare(candidatePassword, user.password);
};

// Mongoose-tranformation till JSON
UserSchema.set('toJSON', {
  transform: function(_doc, ret: Record<string, any>) {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

export const User = mongoose.model<IUser>('User', UserSchema);
