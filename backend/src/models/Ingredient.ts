// src/models/Ingredient.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IIngredient extends Document {
  name: string;
  quantity: number;
  unit: string;
}

const IngredientSchema = new Schema<IIngredient>({
  name: {
    type: String,
    required: [true, 'Namn är obligatoriskt'],
    trim: true,
  },
  quantity: {
    type: Number,
    required: [true, 'Mängd är obligatorisk'],
  },
  unit: {
    type: String,
    required: [true, 'Enhet är obligatorisk'],
    trim: true,
  },
});

export const Ingredient = mongoose.model<IIngredient>('Ingredient', IngredientSchema);