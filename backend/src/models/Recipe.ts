// src/models/Recipe.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IRecipe extends Document {
  title: string;
  createdBy: string;
  ingredients?: string[];
  steps?: string[];
  originalRef?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RecipeSchema = new Schema<IRecipe>(
  {
    title: {
      type: String,
      required: [true, 'Titel är obligatorisk'],
      trim: true,
    },
    createdBy: {
      type: String,
      required: [true, 'createdBy är obligatorisk'],
      trim: true,
    },
    ingredients: {
      type: [String],
      default: [],
    },
    steps: {
      type: [String],
      default: [],
    },
    originalRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe', // referens till ett annat recept
    },
  },
  {
    timestamps: true,
  }
);

export const Recipe = mongoose.model<IRecipe>('Recipe', RecipeSchema);