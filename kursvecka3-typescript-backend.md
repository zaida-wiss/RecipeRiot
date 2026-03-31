# Backendutveckling i Node.js, databaser och säkerhet – Kursvecka 3

## Studiematerial: TypeScript i backendkod

### Introduktion
TypeScript i en Express-applikation fungerar på samma sätt som i React – men tillämpningarna är annorlunda. Istället för att typa props och komponenttillstånd ska vi typa request-objekt, response-objekt, middleware-funktioner, datamodeller och API-kontrakt. Det är en ny kontext, men samma verktyg.

TypeScript är extra viktigt på backend eftersom typfel kan leda till subtila buggar och säkerhetsproblem. Backend-servern hanterar ofta flera typer av data från olika källor – request bodies, databasobjekt, externa API-svar – som alla behöver hanteras korrekt och konsekvent.

---

## Konfigurera TypeScript i ett Node.js/Express-projekt
### Installation av nödvändiga paket
```bash
npm install --save-dev typescript tsx
npm install --save-dev @types/node @types/express
npm install express
```

### tsconfig.json – TypeScript-konfigurationen
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Scripts i package.json
```json
"scripts": {
  "dev": "tsx watch src/server.ts",
  "build": "tsc",
  "start": "node dist/server.js",
  "typecheck": "tsc --noEmit"
}
```

### Projektstruktur med TypeScript
```
mitt-api/
  src/
    routes/
      books.ts
      users.ts
    controllers/
      booksController.ts
    middleware/
      auth.ts
      validate.ts
    models/
      Book.ts
    types/
      index.ts
    app.ts
    server.ts
  dist/
  .env
  .gitignore
  package.json
  tsconfig.json
```

---

## Typa Express – Request, Response och NextFunction
Express Request-typen är generisk och tar fyra valfria typparametrar: params, resBody, reqBody och query. Vi kan hoppa över dem vi inte behöver med `unknown`.

```ts
import { Request, Response } from 'express';
interface CreateBookBody { title: string; author: string; year: number; }
interface BookParams { id: string; }
interface BooksQuery { genre?: string; page?: string; limit?: string; }
const createBook = (req: Request<{}, {}, CreateBookBody>, res: Response): void => {
  const { title, author, year } = req.body;
  res.status(201).json({ title, author, year });
};
const getBook = (req: Request<BookParams>, res: Response): void => {
  const id = req.params.id;
  res.json({ id });
};
const getBooks = (req: Request<{}, {}, {}, BooksQuery>, res: Response): void => {
  const { genre, page, limit } = req.query;
  res.json({ genre, page, limit });
};
```

### Response-typen och typade svar
```ts
interface Book { id: number; title: string; author: string; year: number; }
interface ApiResponse<T> { data: T; message?: string; }
interface ErrorResponse { message: string; code?: string; }
const getBookById = (
  req: Request<BookParams>,
  res: Response<ApiResponse<Book> | ErrorResponse>
): void => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ message: 'Ogiltigt ID-format' });
    return;
  }
  const book: Book = { id, title: 'Clean Code', author: 'Martin', year: 2008 };
  res.json({ data: book });
};
```

### NextFunction och asynkrona handlers
```ts
import { Request, Response, NextFunction } from 'express';
const asyncHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await someAsyncOperation();
    res.json({ data });
  } catch (error) {
    next(error);
  }
};
```

---

## Interfaces för datamodeller och API-kontrakt
Skilj på datamodell (intern representation) och API-representation (vad klienten ser).
```ts
export interface UserModel {
  id: number;
  email: string;
  passwordHash: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}
export interface UserResponse {
  id: number;
  email: string;
  role: 'user' | 'admin';
  createdAt: Date;
}
export interface CreateUserBody { email: string; password: string; }
export interface LoginBody { email: string; password: string; }
export interface AuthResponse { token: string; user: UserResponse; }
```

---

## Typa controllers separat från routes
```ts
// src/controllers/usersController.ts
import { Request, Response, NextFunction } from 'express';
import { CreateUserBody, UserResponse } from '../types';
export const createUser = async (
  req: Request<{}, {}, CreateUserBody>,
  res: Response<UserResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;
    const newUser: UserResponse = { id: 1, email, role: 'user', createdAt: new Date() };
    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
};
// src/routes/users.ts
import { Router } from 'express';
import { createUser } from '../controllers/usersController';
const router = Router();
router.post('/', createUser);
export default router;
```

---

## Typa middleware-funktioner och utöka Request-typen
Utöka Express Request-typ med egna fält via declaration merging i en .d.ts-fil:
```ts
// src/types/express.d.ts
import { UserModel } from './index';
declare global {
  namespace Express {
    interface Request {
      user?: Pick<UserModel, 'id' | 'email' | 'role'>;
    }
  }
}
```

---

## Generics i backendkod
Generiska API-svarsformat och hjälpfunktioner:
```ts
export interface SuccessResponse<T> { success: true; data: T; message?: string; }
export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number; };
}
export interface ErrorResponse { success: false; message: string; code?: string; }
export const createSuccess = <T>(data: T, message?: string): SuccessResponse<T> => ({ success: true, data, ...(message && { message }) });
export const createPaginated = <T>(data: T[], page: number, limit: number, total: number): PaginatedResponse<T> => ({ success: true, data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
```

---

## Utility types i praktiken
- `Partial<T>`: gör alla fält valfria
- `Pick<T, K>`: välj ut specifika fält
- `Omit<T, K>`: ta bort specifika fält
- `Required<T>`: gör alla fält obligatoriska
- `Record<K, V>`: nyckel-värde-mappningar

Exempel:
```ts
type UpdateBookBody = Partial<Omit<Book, 'id'>>;
type UserPublic = Pick<UserModel, 'id' | 'email' | 'role'>;
type UserWithoutPassword = Omit<UserModel, 'passwordHash'>;
type CreateUserBody = Pick<UserModel, 'email'> & { password: string };
type CompletedBook = Required<BookDraft>;
const rolePermissions: Record<UserRole, string[]> = { ... };
```

---

## Typade felklasser och felhantering
```ts
// src/errors/AppError.ts
export class AppError extends Error {
  constructor(message: string, public readonly statusCode: number, public readonly code?: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
export class NotFoundError extends AppError {
  constructor(resource: string) { super(`${resource} hittades inte`, 404, 'NOT_FOUND'); }
}
export class ValidationError extends AppError {
  constructor(message: string) { super(message, 400, 'VALIDATION_ERROR'); }
}
// ...
```

Felhanteringsmiddleware:
```ts
// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
export const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, message: err.message, code: err.code });
    return;
  }
  console.error('Okänt fel:', err);
  res.status(500).json({ success: false, message: 'Ett internt serverfel uppstod' });
};
```

---

## Sätta ihop det hela – ett fullständigt typat mini-API
Se hela exempel i materialet för en komplett struktur med types, controllers och routes.

---

## Checkpoint: Förberedelse inför kursvecka 3
- typescript och tsx installerade som devDependencies
- @types/node och @types/express installerade
- tsconfig.json skapad och konfigurerad med strict: true
- npm run dev fungerar och startar er TypeScript-server
- Ni har börjat skapa interfaces för era datamodeller i en separat types-fil

Reflektera: Var stötte ni på de mest intressanta TypeScript-felen när ni migrerade koden? Vilka typer av buggar hittade TypeScript som hade varit svåra att hitta annars? Hur väljer ni vad som ska vara en interface vs vad som ska vara ett type alias?

---

## Sammanfattning
- TypeScript i backend: typa HTTP-handlers, middleware och API-kontrakt
- Konfigurera TypeScript med strict-läge och rätt scripts
- Använd generics och utility types för återanvändbara och robusta typer
- Skilj på datamodell och API-representation
- Typade felklasser och centraliserad felhantering

---

## Resurser för fördjupning
- [TypeScript officiella handbok](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript utility types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
- [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped)
- [TypeScript Express Tutorial – wanago.io](https://wanago.io/series/typescript-express-tutorial/)
- [How to extend the Express Request object in TypeScript](https://bobbyhadz.com/blog/typescript-extend-express-request-object)
- YouTube: "TypeScript Express REST API" av Ben Awad
- YouTube: "No BS TS" av Jack Herrington
