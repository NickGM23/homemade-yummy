import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';
import { UserRole } from './user';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      fullName: string;
      // Відсутній у користувачів, що зареєструвались по телефону без email.
      email: string | null;
      phone: string | null;
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
    phone?: string | null;
    fullName: string;
    role: UserRole;
  }
}
