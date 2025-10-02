import { Response } from 'express';
import { ValidationError, InternalServerError } from './customError';

type ErrorWithMessage = {
  message: string;
  errorType: string;
  statusCode: number;
};

const checkErrorMessage = (error: unknown): error is ErrorWithMessage => {
  return (
    error instanceof ValidationError &&
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'errorType' in error &&
    typeof (error as { message: unknown }).message === 'string'
  );
};

const otherErrorMessage = (error: unknown): ErrorWithMessage => {
  console.error(error);
  return new InternalServerError();
};

const getErrorMessage = (maybeError: unknown): ErrorWithMessage => {
  if (checkErrorMessage(maybeError)) {
    console.error(maybeError);
    return maybeError;
  } else {
    return otherErrorMessage(maybeError);
  }
};

export const reportErrorMessage = async (error: unknown, res: Response) => {
  const err = getErrorMessage(error);

  const { message, statusCode, errorType } = err;
  return res.status(err.statusCode).json({
    message,
    errorType,
    statusCode,
  });
};
