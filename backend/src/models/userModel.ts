import mongoose, { Document, Model, Schema} from "mongoose";

const usersSchema = new mongoose.Schema(
{
  id: {
    type: Number,
    required: true,
    unique: true,
    trim: true,
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
    type: Boolean,
    required: true,
  }

  createdAt: {
    type: Date,
  },

  isActive: {
    type: Boolean,
    default: true,
  },

},

{ timestamps: true }
);