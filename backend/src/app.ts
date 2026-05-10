// Deklaration
import express from "express";
import cors from "cors";
import morgan from "morgan";

import errorHandler from "./middleware/errorHandler";
import requestConsoleLogger from "./middleware/requestConsoleLogger";

import recipesRouter from "./routes/recipesRouter";
import usersRouter from "./routes/usersRouter";

const app = express();


// Global middleware körs för alla requests innan de når routes.
app.use(cors());
// Gör JSON-body tillgänglig som req.body i controllers och validation middleware.
app.use(express.json());
app.use(morgan('dev'));
app.use(requestConsoleLogger);

// Health-kontroll: Bekräftar att servern lever och kan ta emot requests
app.get('/health', (_req: express.Request, res: express.Response) => {
  res.json({ status: 'ok' });
});

// Samlar API-versionering och skickar vidare till respektive router.
app.use('/api/v1/recipes', recipesRouter);
app.use('/api/v1/users', usersRouter);

// 404 - om ingen route matchar
app.use((_req: express.Request, res: express.Response) => {
  res.status(404).json({
    error: {
      message: "Sidan finns inte",
      status: 404,
    },
  });
});

// Central felhantering måste ligga sist, efter routes och 404-hantering.
app.use(errorHandler);

export default app;
