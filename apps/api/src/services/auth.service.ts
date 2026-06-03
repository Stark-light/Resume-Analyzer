import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { config } from '../config';
import type { AuthUser } from '@resume-analyzer/shared';

interface TokenPayload {
  userId: string;
  email: string;
}

export class AuthService {
  async register(email: string, password: string, name: string): Promise<{ user: AuthUser; token: string }> {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error('Email already registered');

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, name, passwordHash },
    });

    const token = this.signToken({ userId: user.id, email: user.email });
    return {
      user: { id: user.id, email: user.email, name: user.name },
      token,
    };
  }

  async login(email: string, password: string): Promise<{ user: AuthUser; token: string }> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('Invalid credentials');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new Error('Invalid credentials');

    const token = this.signToken({ userId: user.id, email: user.email });
    return {
      user: { id: user.id, email: user.email, name: user.name },
      token,
    };
  }

  verifyToken(token: string): TokenPayload {
    return jwt.verify(token, config.jwt.secret) as TokenPayload;
  }

  private signToken(payload: TokenPayload): string {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
    });
  }
}

export const authService = new AuthService();