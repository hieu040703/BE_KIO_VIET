import { JwtPayload } from "./interfaces";

declare global {
  interface User extends JwtPayload {}

  namespace Express {
    interface Request {
      user?: User;
      cookies: {
        access_token?: string;
        refresh_token?: string;
        [key: string]: any;
      };
    }
  }
}

export {};
