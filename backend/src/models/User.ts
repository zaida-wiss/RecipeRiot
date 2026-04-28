import mongoose, { Schema, Document } from 'mongoose';

//Data som ska in i databasen
export interface IUser extends Document {
  username: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

//Nedanför finns reglerna för vad som ska in i databasen
const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
module.exports = { User };
