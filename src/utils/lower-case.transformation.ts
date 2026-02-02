import { TransformFnParams } from "class-transformer";

export const lowerCaseTransformer = ({ value }: TransformFnParams) =>
  typeof value === 'string' ? value.toLowerCase().trim() : value;

