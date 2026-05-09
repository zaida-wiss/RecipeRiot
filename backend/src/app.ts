// Deklaration
import express from "express";
import cors from "cors";
import morgan from "morgan";

import recipesRouter from "./routes/recipesRouter";
import usersRouter from "./routes/usersRouter";

import requestConsoleLogger from "./middleware/requestConsoleLogger";

const app = express();


// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(requestConsoleLogger);

// Health-kontroll: Bekräftar att servern lever och kan ta emot requests
app.get('/health', (_req: express.Request, res: express.Response) => {
  res.json({ status: 'ok' });
});

// Routes
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

// 500 - central felhantering
app.use((
  error: Error,
  _req: express.Request,
  res: express.Response,
  _next:express.NextFunction
) => {
  console.error(error);

  res.status(500).json({
    error: {
    message: "Något gick fel på servern",
    status: 500,
    },
  });
});

export default app;