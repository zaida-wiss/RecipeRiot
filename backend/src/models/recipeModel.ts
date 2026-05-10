// src/models/Recipe.ts
import mongoose, { Schema, Document } from 'mongoose';

// TypeScript-interface för ett receptdokument som Mongoose returnerar.
export interface IRecipe extends Document {
  title: string;
  createdBy: string;
  ingredients?: string[];
  steps?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Schemat beskriver fält, defaults och databasvalidering för recept.
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
  },
  {
    // timestamps skapar och uppdaterar createdAt/updatedAt automatiskt.
    timestamps: true,
  }
);

// Modellen används i recipesController för CRUD mot MongoDB.
export const Recipe = mongoose.model<IRecipe>('Recipe', RecipeSchema);
