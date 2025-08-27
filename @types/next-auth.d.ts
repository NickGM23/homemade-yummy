import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';
import { UserRole } from './user';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      fullName: string;
      email: string;
      image?: string;
    };
  }

  interface User extends DefaultUser {
    id: string;
    fullName: string;
    role: UserRole;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
  }
}
