import { Test, TestingModule } from '@nestjs/testing';
import { AllExceptionsFilter } from './all-exceptions-filter';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ArgumentsHost } from '@nestjs/common';

describe('AllExceptionsFilter', () => {
    let filter: AllExceptionsFilter;

    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    const mockGetResponse = jest.fn().mockReturnValue({ status: mockStatus });
    const mockGetRequest = jest.fn().mockReturnValue({ url: '/test', method: 'GET' });

    const mockArgumentsHost = {
        switchToHttp: () => ({
            getResponse: mockGetResponse,
            getRequest: mockGetRequest,
        }),
    } as unknown as ArgumentsHost;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [AllExceptionsFilter],
        }).compile();

        filter = module.get<AllExceptionsFilter>(AllExceptionsFilter);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(filter).toBeDefined();
    });

    it('should handle HttpException correctly', () => {
        const error = new HttpException('Forbidden', HttpStatus.FORBIDDEN);

        filter.catch(error, mockArgumentsHost);

        expect(mockStatus).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
        expect(mockJson).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
                error: expect.objectContaining({
                    messages: ['Forbidden'],
                    code: 'FORBIDDEN',
                }),
            }),
        );
    });

    it('should handle standard Error correctly', () => {
        const error = new Error('Generic error');

        filter.catch(error, mockArgumentsHost);

        expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
                error: expect.objectContaining({
                    messages: ['Generic error'],
                    code: 'INTERNAL_ERROR',
                }),
            }),
        );
    });

    it('should handle HttpException with object response', () => {
        const errorResponse = { message: ['Validation failed'] };
        const error = new HttpException(errorResponse, HttpStatus.BAD_REQUEST);

        filter.catch(error, mockArgumentsHost);

        expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
        expect(mockJson).toHaveBeenCalledWith(
            expect.objectContaining({
                error: expect.objectContaining({
                    messages: ['Validation failed'],
                    code: 'BAD_REQUEST',
                }),
            }),
        );
    });

    it('should handle unknown exception types', () => {
        filter.catch('unknown error', mockArgumentsHost);

        expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(mockJson).toHaveBeenCalledWith(
            expect.objectContaining({
                error: expect.objectContaining({
                    messages: ['Internal server error'],
                    code: 'INTERNAL_ERROR',
                }),
            }),
        );
    });
});
