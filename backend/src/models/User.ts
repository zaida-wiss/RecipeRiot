// src/models/User.ts
import mongoose, { Schema, Document } from 'mongoose';
import type { UserRole } from "../types/index.js";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  favorites: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, 'Username är obligatorisk'],
      trim: true,
      minlength: [4, "Username måste ha minst 4 tecken"],
      maxlength: [50, "Username får inte överstiga 50 tecken"],
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Email är obligatorisk'],
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, "PasswordHash är obligatoriskt"],
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      required: true,
    },
    favorites: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Recipe',
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>('User', UserSchema);