import { ZodError, ZodIssue } from 'zod';
import { IErrorMessages } from '../interfaces/error';

const handleZodError = (error: ZodError) => {
  const errors: IErrorMessages[] = error.issues.map((issue: ZodIssue) => {
    return {
      path: issue?.path[1] as string,
      message: issue?.message,
    };
  });

  const statusCode = 400;
  return {
    statusCode,
    message: 'Validation Error',
    errorMessages: errors,
  };
};

export default handleZodError;
