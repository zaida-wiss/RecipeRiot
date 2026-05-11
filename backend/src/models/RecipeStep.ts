// src/models/RecipeStep.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IRecipeStep extends Document {
  stepNumber: number;
  instruction: string;
}

const RecipeStepSchema = new Schema<IRecipeStep>({
  stepNumber: {
    type: Number,
    required: [true, 'Stegnummer är obligatoriskt'],
  },
  instruction: {
    type: String,
    required: [true, 'Instruktion är obligatorisk'],
    trim: true,
  },
});

export const RecipeStep = mongoose.model<IRecipeStep>('RecipeStep', RecipeStepSchema);