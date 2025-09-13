export class X10Error extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'X10Error';
  }
}

export class RateLimitException extends X10Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitException';
  }
}

export class NotAuthorizedException extends X10Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotAuthorizedException';
  }
}

export class ValidationError extends X10Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends X10Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class SigningError extends X10Error {
  constructor(message: string) {
    super(message);
    this.name = 'SigningError';
  }
}