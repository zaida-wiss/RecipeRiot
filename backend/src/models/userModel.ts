import mongoose, { Schema} from "mongoose";
import { UserModelTypes } from "../types/userType"

const usersSchema = new Schema<UserModelTypes>(
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


export const userModel = mongoose.model<UserModelTypes>("User", usersSchema);