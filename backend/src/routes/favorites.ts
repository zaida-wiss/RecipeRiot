// src/routes/favorites.ts
import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getFavorites,
  addFavorite,
  removeFavorite,
} from '../controllers/favoritesController.js';

const router = Router();

// Alla favorit-routes kräver inloggning
router.use(authenticate);

router.get('/', getFavorites);
router.post('/:recipeId', addFavorite);
router.delete('/:recipeId', removeFavorite);

export default router;