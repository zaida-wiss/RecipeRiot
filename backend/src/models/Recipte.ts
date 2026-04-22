import { Schema, model } from 'mongoose';

const recipeSchema = new Schema(
  {
    //Titeln är obligatorisk för att receptkort ska kunna visas
    title: {
      type: String,
      required: true,
      trim: true
    },

    //Vem som skapade receptet
    createdBy: {
      type: String,
      required: true,
      trim: true,
    },

    //Ingredienser och steg defaultar till tomma arrayer
    ingredients: {
      type: [String],
      default: []
    },
    steps: {
      type: [String],
        default: []
    },
  },
  {
    //Lägger till createdAt och updatedAt automatiskt
    timestamps: true,
  }
);

export const RecipeModel = model('Recipe', recipeSchema);