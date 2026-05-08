const mongoose = require ("mongoose");

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