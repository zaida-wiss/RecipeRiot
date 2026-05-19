import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';

//Interface för att berätta för TypeScript vad som ligger inuti vår JWT-token
interface TokenPayload {
    id: string;
    role: 'user' | 'kock' | 'admin';
}

//Middleware för Autentisering. Säkrar att användaren har skickat med en giltig JWT token.
export const protect =(req: Request, res: Response, next: NextFunction): void => {
    let token: string | undefined;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    //Om inget token skickades med stoppar vi anropet direkt (401 Unauthorized)
    if(!token) {
        res.status(401).json({ message: 'Ej behörig, token saknas' });
        return;
    }

    try {
        //Verifiera token mot vår dolda nyckel i .env.
        //Utropstecknet berättar för TS att vi garanterar att den finns i .env
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;

        //Spara användarens ID och roll direkt på request-objektet (req.user)
        req.user = {
            id: decoded.id,
            role: decoded.role,
        };

        return next();
    } catch (error) {
        //Om token är ogiltig eller utgången stoppar vi anropet säkert här
        res.status(401).json({message: 'Ogiltig eller utgången token'});
        return;
    }
};

//Middleware för Aktorisering. Implementerar "Deny by default". Endast specifika roller släpps förbi.
export const authorize = (...roles: ('user' | 'kock' | 'admin')[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        //Om användaren inte är inloggad alls, eller om deras roll inte finns med i listan av tillåtna roller
        if(!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({message: 'Du har inte rätt behörighet för denna åtgärd' });
            return;
        }

        return next();
    };
};
