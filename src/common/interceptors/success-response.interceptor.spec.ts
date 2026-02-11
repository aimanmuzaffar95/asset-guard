import { Test, TestingModule } from '@nestjs/testing';
import { SuccessResponseInterceptor } from './success-response.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

describe('SuccessResponseInterceptor', () => {
  let interceptor: SuccessResponseInterceptor;

  const mockRequest = { url: '/test', method: 'GET' };
  const mockResponse = { statusCode: 200 };
  const mockExecutionContext = {
    switchToHttp: () => ({
      getRequest: (): any => mockRequest,
      getResponse: (): any => mockResponse,
    }),
  } as unknown as ExecutionContext;

  const mockCallHandler: CallHandler = {
    handle: () => of({ test: 'data' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SuccessResponseInterceptor],
    }).compile();

    interceptor = module.get<SuccessResponseInterceptor>(
      SuccessResponseInterceptor,
    );
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should wrap response in success structure', (done) => {
    interceptor
      .intercept(mockExecutionContext, mockCallHandler)
      .subscribe((result) => {
        expect(result).toEqual({
          success: true,
          data: { test: 'data' },
          meta: expect.objectContaining({
            statusCode: 200,
            path: '/test',
            method: 'GET',
            timestamp: expect.any(String) as unknown,
          }) as unknown,
        });
        done();
      });
  });
});
