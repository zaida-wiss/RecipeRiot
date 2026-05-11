// src/models/Tag.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ITag extends Document {
  name: string;
}

const TagSchema = new Schema<ITag>({
  name: {
    type: String,
    required: [true, 'Namn är obligatoriskt'],
    trim: true,
  },
});

export const Tag = mongoose.model<ITag>('Tag', TagSchema);