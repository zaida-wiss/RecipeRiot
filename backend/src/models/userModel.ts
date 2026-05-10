import mongoose, { Schema } from "mongoose";
import { UserDocument } from "../types/userType";

// Mongoose-schema beskriver hur user-dokument sparas och valideras i MongoDB.
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
      // select: false gör att lösenordshashen inte följer med i vanliga queries.
      select: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Modellen är det controllers använder för att läsa och skriva users i databasen.
export const User = mongoose.model<UserDocument>("User", usersSchema);
