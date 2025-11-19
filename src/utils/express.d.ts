import { JwtUserPayload } from './jwt';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DB_CONNECTION: 'mysql' | 'mariadb';
      DB_PORT: number;
      SECRET_KEY: string;
    }
  }
  namespace Express {
    interface Request {
      user?: JwtUserPayload;
      userId: string;
    }
  }
}

export {};
