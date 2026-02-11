import { lowerCaseTransformer } from './lower-case.transformation';
import { TransformFnParams } from 'class-transformer';

describe('lowerCaseTransformer', () => {
    it('should transform string to lowercase and trim it', () => {
        const params = { value: '  TESTING  ' } as TransformFnParams;
        const result = lowerCaseTransformer(params);
        expect(result).toBe('testing');
    });

    it('should return value as is if not a string', () => {
        const params = { value: 123 } as TransformFnParams;
        const result = lowerCaseTransformer(params);
        expect(result).toBe(123);
    });

    it('should return null if value is null', () => {
        const params = { value: null } as TransformFnParams;
        const result = lowerCaseTransformer(params);
        expect(result).toBeNull();
    });
});
