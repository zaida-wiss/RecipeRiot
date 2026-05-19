import { AuthUser } from './index';

declare global {
  namespace Express {
    interface Request {
      // Auth-middleware sätter req.user efter att JWT är verifierad.
      // Den är optional eftersom alla routes inte är skyddade.
      user?: AuthUser;
    }
  }
}

export {};
