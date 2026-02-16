import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { createHash } from 'crypto';
import type { Request } from 'express';

@Injectable()
export class SmartThrottlerGuard extends ThrottlerGuard {
  protected getTracker(req: Request): Promise<string> {
    const authHeader = req.headers?.authorization;
    const token = this.extractBearerToken(authHeader);

    if (token) {
      return Promise.resolve(`token:${this.hashToken(token)}`);
    }

    return Promise.resolve(`ip:${this.getIp(req)}`);
  }

  private extractBearerToken(
    authHeader: string | string[] | undefined,
  ): string | null {
    if (!authHeader || Array.isArray(authHeader)) {
      return null;
    }

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) {
      return null;
    }

    return token;
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex').slice(0, 24);
  }

  private getIp(req: Request): string {
    return req.ip || req.socket?.remoteAddress || 'unknown';
  }
}
