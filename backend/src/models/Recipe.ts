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
  imageUrl?: string;
  ingredients: IIngredient[];
  steps: string[];
  originalRef?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

const IngredientSchema = new Schema<IIngredient>({
  name: { type: String, required: [true, "Ingrediens är obligatorisk"], trim: true },
  quantity: { type: Number, required: [true, "Antal är obligatoriskt"] },
  unit: { type: String, required: [true, "Enhet är obligatoriskt"], trim: true }
});

const RecipeSchema = new Schema<IRecipe>(
  {
    title: { type: String, required: [true, 'Titel är obligatorisk'], trim: true },
    createdBy: { type: String, required: [true, 'createdBy är obligatorisk'], trim: true },
    imageUrl: { type: String, default: '' },
    ingredients: { type: [IngredientSchema], default: [] },
    steps: { type: [String], default: [] },
    originalRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Recipe = mongoose.model<IRecipe>('Recipe', RecipeSchema);
