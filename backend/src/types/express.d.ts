import type { AuthUser } from './index.js';

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
