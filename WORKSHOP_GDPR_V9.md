# Workshop vecka 9: GDPR i backend

Målet med den här workshopen är att du själv ska kunna implementera GDPR-stöd i backend steg för steg. Vi fokuserar på:

- strukturerad loggning med `pino` och `pino-http`
- soft delete
- export av användarens data
- hard delete av användarens konto och data

Du är redan på rätt väg när du tänker på GDPR som mer än bara "radera konto". GDPR handlar också om att användaren ska kunna förstå, få ut och kontrollera sin data.

## Steg 1: Fundera på vilken data som är personlig

Ledande frågor:

- Vilka modeller i projektet innehåller personuppgifter?
- Är `email` en personuppgift?
- Är recept personuppgifter om de är kopplade till `createdBy`?
- Ska lösenordshash exporteras till användaren?

Bra tanke: användarens `email`, `username`, `role`, `createdAt` och egna recept hör till användarens data. Däremot ska `passwordHash` inte exporteras, även om det tekniskt ligger på användaren.

Varför är detta viktigt?

Om vi exporterar för mycket, till exempel `passwordHash`, läcker vi känslig säkerhetsdata. Om vi exporterar för lite, uppfyller vi inte användarens rätt till dataportabilitet.

## Steg 2: Installera rätt logger

Det ni vill ha med från vecka 9 är `pino` och `pino-http`.

När ni är redo att ändra projektet senare kan ni installera:

```bash
npm install pino pino-http
```

Kodexempel att skriva av senare i `backend/src/middleware/logger.ts`:

```ts
import pinoHttp from 'pino-http';

const logger = pinoHttp({
  redact: {
    paths: [
      'req.headers.authorization',
      'req.body.password',
      'req.body.passwordHash',
    ],
    censor: '[REDACTED]',
  },
});

export default logger;
```

Varför ska du göra så?

`pino-http` loggar varje request i ett strukturerat JSON-format. Det gör loggarna lättare att söka i, och `redact` gör att känsliga saker som tokens och lösenord inte hamnar i loggarna.

Vad skulle hända annars?

Om man använder vanlig `console.log(req.body)` riskerar man att logga lösenord, tokens eller personuppgifter. Det är dåligt både för säkerhet och GDPR.

Finns det fler bra lösningar?

Ja. `winston` är också vanligt. Men `pino` är snabbt, enkelt och passar bra i Express-appar.

## Steg 3: Skapa soft delete på User

Ledande frågor:

- Vad är skillnaden mellan soft delete och hard delete?
- Varför kan soft delete vara bra innan man raderar allt permanent?
- Vilka fält behöver en användare ha för att räknas som "raderad" utan att dokumentet tas bort?

En vanlig lösning är att lägga till fält på `User`:

```ts
isDeleted: boolean;
deletedAt?: Date;
```

Kodexempel att skriva av senare i `backend/src/models/User.ts`:

```ts
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

Och i schemat:

```ts
isDeleted: {
  type: Boolean,
  default: false,
},
deletedAt: {
  type: Date,
  default: null,
},
```

Varför är detta viktigt?

Soft delete betyder att kontot markeras som raderat, men finns kvar i databasen. Det kan vara användbart om man behöver återställa ett konto, felsöka eller följa affärsregler.

Vad skulle hända annars?

Om man bara gör hard delete direkt finns ingen väg tillbaka. Det kan vara okej i vissa GDPR-flöden, men då måste man vara säker på att all relaterad data hanteras rätt.

Finns det fler bra lösningar?

Ja. Man kan också anonymisera användaren i stället för att soft delete:a, till exempel byta email till `deleted-user-123@example.local`. Det kan vara bättre om recept ska ligga kvar publikt men inte längre vara kopplade till en identifierbar person.

## Steg 4: Stoppa inloggning för soft delete-konton

Ledande fråga:

- Om en användare är soft delete:ad, ska den kunna logga in?

Nej. I login-controllern bör du söka efter användare som inte är raderade.

Kodexempel att skriva av senare i `authController.ts`:

```ts
const user = await User.findOne({
  isDeleted: false,
  $or: [
    { email: identifier },
    { username: identifier },
  ],
}).select('+passwordHash');
```

Varför är detta viktigt?

Om ett konto är markerat som raderat men ändå kan logga in, blir soft delete bara en etikett utan faktisk effekt.

Öva extra på detta: varje gång du inför `isDeleted`, fråga dig själv vilka queries som också behöver filtrera bort raderade dokument.

## Steg 5: Endpoint för att ladda ner sin data

Ledande frågor:

- Varför ska endpointen använda `req.user.id` i stället för `req.params.id`?
- Vilken data ska exporteras?
- Vilken data ska absolut inte exporteras?

Förslag på endpoint:

```http
GET /api/v1/gdpr/export
```

Den ska kräva inloggning med `authenticate`.

Kodexempel att skriva av senare i en ny controller, till exempel `gdprController.ts`:

```ts
import { Request, Response } from 'express';
import { User } from '../models/User.js';
import { Recipe } from '../models/Recipe.js';
import { NotFoundError, UnauthorizedError } from '../errors/AppError.js';

export const exportMyData = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) {
    throw new UnauthorizedError('Autentisering krävs');
  }

  const user = await User.findOne({
    _id: req.user.id,
    isDeleted: false,
  });

  if (!user) {
    throw new NotFoundError('Användaren hittades inte');
  }

  const recipes = await Recipe.find({
    createdBy: req.user.id,
  });

  res.setHeader(
    'Content-Disposition',
    'attachment; filename="my-data.json"'
  );

  res.json({
    exportedAt: new Date().toISOString(),
    user: {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    recipes,
  });
};
```

Varför ska du göra så?

Detta ger användaren en tydlig kopia av sin data. Du använder `req.user.id`, vilket betyder att användaren bara kan exportera sin egen data.

Vad skulle hända annars?

Om du använder `/users/:id/export` utan rätt kontroll kan en användare försöka exportera någon annans data genom att byta id i URL:en.

Finns det fler bra lösningar?

Ja. Man kan exportera som CSV, zip-fil eller skicka exporten via mail. JSON är enklast och passar bra för API:er.

## Steg 6: Endpoint för soft delete

Förslag på endpoint:

```http
DELETE /api/v1/gdpr/me
```

Detta kan först göra soft delete:

```ts
import { Request, Response } from 'express';
import { User } from '../models/User.js';
import { UnauthorizedError, NotFoundError } from '../errors/AppError.js';

export const softDeleteMe = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) {
    throw new UnauthorizedError('Autentisering krävs');
  }

  const user = await User.findOneAndUpdate(
    { _id: req.user.id, isDeleted: false },
    {
      isDeleted: true,
      deletedAt: new Date(),
    },
    { new: true }
  );

  if (!user) {
    throw new NotFoundError('Användaren hittades inte');
  }

  res.status(204).send();
};
```

Varför är detta viktigt?

Soft delete är ett försiktigt första steg. Du ändrar status på kontot utan att tappa historiken direkt.

Öva extra på detta: försök själv förklara varför `{ _id: req.user.id, isDeleted: false }` är bättre än bara `{ _id: req.user.id }`.

## Steg 7: Endpoint för hard delete

Ledande frågor:

- Ska hard delete ta bort bara användaren?
- Vad händer med användarens recept?
- Ska användaren behöva vara inloggad?

Förslag på endpoint:

```http
DELETE /api/v1/gdpr/me/hard
```

Kodexempel:

```ts
import { Request, Response } from 'express';
import { User } from '../models/User.js';
import { Recipe } from '../models/Recipe.js';
import { UnauthorizedError } from '../errors/AppError.js';

export const hardDeleteMe = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) {
    throw new UnauthorizedError('Autentisering krävs');
  }

  await Recipe.deleteMany({ createdBy: req.user.id });
  await User.findByIdAndDelete(req.user.id);

  res.status(204).send();
};
```

Varför ska du göra så?

Hard delete betyder att kontot faktiskt tas bort ur databasen. Om recepten är kopplade till användaren via `createdBy`, behöver du bestämma om de också ska bort eller anonymiseras.

Vad skulle hända annars?

Om du bara tar bort användaren men lämnar recepten kvar med `createdBy`, får du föräldralös data. Då pekar recepten på en användare som inte längre finns.

Finns det fler bra lösningar?

Ja. I stället för `Recipe.deleteMany` kan man anonymisera recepten:

```ts
await Recipe.updateMany(
  { createdBy: req.user.id },
  { createdBy: 'deleted-user' }
);
```

Det är bättre om appen vill behålla offentliga recept men ta bort kopplingen till personen.

## Steg 8: Skapa GDPR-routes

Ledande fråga:

- Var ska `authenticate` placeras?

Den ska ligga före controller-funktionen, så att `req.user` finns.

Kodexempel:

```ts
import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  exportMyData,
  softDeleteMe,
  hardDeleteMe,
} from '../controllers/gdprController.js';

const router = Router();

router.get('/export', authenticate, exportMyData);
router.delete('/me', authenticate, softDeleteMe);
router.delete('/me/hard', authenticate, hardDeleteMe);

export default router;
```

Sedan kopplas routern in i `app.ts`:

```ts
app.use('/api/v1/gdpr', gdprRouter);
```

Varför är detta viktigt?

GDPR-rutter blir tydliga och separata från vanliga admin-rutter. Det gör det lättare att förstå att dessa endpoints handlar om användarens egna rättigheter.

## Steg 9: Tester du bör skriva

Bra tester för GDPR:

- Inloggad användare kan exportera sin egen data.
- Exporten innehåller inte `passwordHash`.
- Oinloggad användare får `401`.
- Soft delete sätter `isDeleted: true` och `deletedAt`.
- Soft delete:ad användare kan inte logga in.
- Hard delete tar bort användaren.
- Hard delete tar bort eller anonymiserar användarens recept.

Kodexempel på testidé:

```ts
test('export ska inte innehålla passwordHash', async () => {
  const res = await request(app)
    .get('/api/v1/gdpr/export')
    .set('Authorization', `Bearer ${token}`);

  expect(res.status).toBe(200);
  expect(res.body.user.passwordHash).toBeUndefined();
});
```

Varför är tester viktiga här?

GDPR-funktioner är säkerhets- och integritetsnära. Små misstag kan läcka data eller radera fel data.

## Sammanfattning

Det du gör rätt här är att du tänker på GDPR som flera backend-flöden:

- logga säkert
- visa/exportera användarens data
- markera konto som raderat
- radera konto permanent
- skydda allt med auth

Det centrala att öva mer på är kopplingen mellan auth och databasfrågor. Fråga alltid:

- Vem är inloggad?
- Vilken data äger den användaren?
- Kan någon byta id i URL:en?
- Läcker vi känsliga fält?
- Vad händer med relaterad data?

När du kan svara på de frågorna innan du skriver koden, då tänker du som en backend-utvecklare med säkerhet och GDPR i ryggraden.
