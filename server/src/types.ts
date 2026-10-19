import { Request } from 'express';
import { Role } from '@prisma/client';

export interface AuthUser {
  id: string;
  login: string;
  role: Role;
  fullName: string;
  phone: string;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}
