import { RequestHandler } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import { AppError } from "./errorHandler";

// Det här schemat används för routes som har en URL-parameter som heter id.
// Exempel: GET /api/v1/users/:id eller DELETE /api/v1/recipes/:id.
const objectIdParamsSchema = z.object({
  // MongoDB använder ObjectId. Om formatet är fel kan Mongoose annars kasta CastError.
  id: z.string().refine((id) => mongoose.isValidObjectId(id), {
    message: "Ogiltigt id-format.",
  }),
});


const validateObjectIdParam: RequestHandler = (req, _res, next) => {
  // req.params innehåller värden från route-parametrar, till exempel { id: "..." }.
  // safeParse returnerar ett resultatobjekt i stället för att kasta ett exception.
  const result = objectIdParamsSchema.safeParse(req.params);

  if (!result.success) {
    // Vi skickar valideringsfelet vidare till central errorHandler med status 400.
    return next(new AppError(result.error.issues[0].message, 400));
  }

  // Efter validering ersätter vi req.params med den godkända datan från Zod.
  req.params = result.data;
  // next() släpper vidare requesten till nästa middleware eller controller.
  return next();
};

export { validateObjectIdParam };
