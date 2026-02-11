import { TransformFnParams } from 'class-transformer';

export const lowerCaseTransformer = ({ value }: TransformFnParams): any =>
  typeof value === 'string' ? value.toLowerCase().trim() : value;
