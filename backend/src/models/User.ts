// src/models/User.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
    // Vi lagrar aldrig password i klartext.
  // Därför heter fältet passwordHash.
  passwordHash: string;
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
      // unique skapar ett unikt index i MongoDB.
      // Det hjälper mot dubbla konton med samma email.
      unique: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, "PasswordHash är obligatoriskt"],
      // select: false betyder att passwordHash inte kommer med automatiskt
      // när vi hämtar en User. Vid login måste vi aktivt välja det med:
      // .select('+passwordHash')
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>('User', UserSchema);
