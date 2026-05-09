import mongoose, { Schema } from "mongoose";
import { UserDocument } from "../types/userType";

const usersSchema = new Schema<UserDocument>(
{
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },

  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
    required: true,
  },

  passwordHash: {
    type: String,
    required: true,
    select: false,
  },

  isActive: {
    type: Boolean,
    default: true,
  },

},

{ timestamps: true }
);


export const userModel = mongoose.model<UserType>("User", usersSchema);