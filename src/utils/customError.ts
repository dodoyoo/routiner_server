export class ValidationError extends Error {
  message: string;
  errorType: string;
  statusCode: number;

  constructor(message: string, errorType: string, statusCode: number) {
    super();
    this.message = message;
    this.errorType = errorType;
    this.statusCode = statusCode;
  }
}
export class InternalServerError extends ValidationError {
  constructor() {
    super('INTERNAL_SERVER_ERROR', 'INTERNAL_SERVER_ERROR', 500);
  }
}

export class PropertyRequiredError extends ValidationError {
  message: string;

  constructor(message: string) {
    super(message, 'NO_PROPERTY', 400);
    this.message = message;
  }
}
export class DuplicatePropertyError extends ValidationError {
  message: string;

  constructor(message: string) {
    super(message, 'DUPLICATE', 400);
    this.message = message;
  }
}

export class NotFoundDataError extends ValidationError {
  message: string;

  constructor(message: string) {
    super(message, 'NOT_FOUND', 404);
    this.message = message;
  }
}

export class InvalidPropertyError extends ValidationError {
  message: string;

  constructor(message: string) {
    super(message, 'INVALID', 400);
    this.message = message;
  }
}

export class UnauthorizedAccessError extends ValidationError {
  constructor() {
    super('UNAUTHORIZED_ACCESS', 'UNAUTHORIZED_ACCESS', 401);
  }
}

export class fetchError extends ValidationError {
  message: string;

  constructor(message: string) {
    super(message, 'FETCHERROR', 500);
    this.message = message;
  }
}
