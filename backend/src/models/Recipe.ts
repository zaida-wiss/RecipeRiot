// src/models/Recipe.ts
import mongoose, { Schema, Document } from 'mongoose';

interface IIngredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface IRecipe extends Document {
  title: string;
  createdBy: string;
  imageUrl?: string;        // ← tillagd
  ingredients: IIngredient[];
  steps: string[];
  originalRef?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const IngredientSchema = new Schema<IIngredient>(
  {
    name: {
      type: String,
      required: [true, "Ingrediens är obligatorisk"],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, "Antal är obligatoriskt"],
    },
    unit: {
      type: String,
      required: [true, "Enhet är obligatoriskt"],
      trim: true,
    }
  }
);

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
    imageUrl: {                // ← tillagd
      type: String,
      default: '',
    },
    ingredients: {
      type: [IngredientSchema],
      default: [],
    },
    steps: {
      type: [String],
      default: [],
    },
    originalRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe',
    },
  },
  {
    timestamps: true,
  }
);

export const Recipe = mongoose.model<IRecipe>('Recipe', RecipeSchema);