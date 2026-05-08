// src/routes/users.ts
import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
  res.json([]);
});

module.exports = router;
