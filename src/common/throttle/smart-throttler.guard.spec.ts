import { SmartThrottlerGuard } from './smart-throttler.guard';
import type { Request } from 'express';
import type {
  ThrottlerModuleOptions,
  ThrottlerStorage,
} from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';

class TestSmartThrottlerGuard extends SmartThrottlerGuard {
  public getTrackerForTest(req: Request): Promise<string> {
    return this.getTracker(req);
  }
}

describe('SmartThrottlerGuard', () => {
  let guard: TestSmartThrottlerGuard;

  beforeEach(() => {
    const options: ThrottlerModuleOptions = {
      throttlers: [{ ttl: 60_000, limit: 120 }],
    };
    const storage: ThrottlerStorage = {
      increment: jest.fn().mockResolvedValue({
        totalHits: 1,
        timeToExpire: 60_000,
        isBlocked: false,
        timeToBlockExpire: 0,
      }),
    };

    guard = new TestSmartThrottlerGuard(options, storage, new Reflector());
  });

  it('should use ip tracker when authorization header is missing', async () => {
    const tracker = await guard.getTrackerForTest({
      headers: {},
      ip: '127.0.0.1',
      socket: { remoteAddress: '127.0.0.1' },
    } as Request);

    expect(tracker).toBe('ip:127.0.0.1');
  });

  it('should use deterministic token tracker for valid bearer header', async () => {
    const token = 'header.payload.signature';
    const trackerA = await guard.getTrackerForTest({
      headers: { authorization: `Bearer ${token}` },
      ip: '127.0.0.1',
      socket: { remoteAddress: '127.0.0.1' },
    } as Request);
    const trackerB = await guard.getTrackerForTest({
      headers: { authorization: `Bearer ${token}` },
      ip: '127.0.0.1',
      socket: { remoteAddress: '127.0.0.1' },
    } as Request);

    expect(trackerA).toMatch(/^token:[a-f0-9]{24}$/);
    expect(trackerA).toBe(trackerB);
  });

  it('should fall back to ip tracker when authorization header format is invalid', async () => {
    const tracker = await guard.getTrackerForTest({
      headers: { authorization: 'InvalidTokenValue' },
      ip: '10.0.0.8',
      socket: { remoteAddress: '10.0.0.8' },
    } as Request);

    expect(tracker).toBe('ip:10.0.0.8');
  });
});
