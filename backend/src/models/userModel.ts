import mongoose, { Schema} from "mongoose";
import { UserModelTypes } from "../types/usersTypes"

const usersSchema = new Schema<UserModelTypes>(
{
  id: {
    type: Number,
    required: true,
    unique: true,
  },

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
  },

  isActive: {
    type: Boolean,
    default: true,
  },

},

{ timestamps: true }
);


export const userModel = mongoose.model<UserModelTypes>("User", usersSchema);