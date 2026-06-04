import type { Gender, Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      gender: Gender;
      avatarUrl?: string | null;
      loginAt?: number; // epoch ms of the login that minted this session
    } & DefaultSession["user"];
  }
  interface User {
    role?: Role;
    gender?: Gender;
    avatarUrl?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
    gender?: Gender;
    avatarUrl?: string | null;
    loginAt?: number;
  }
}
