export class AccountRequestNotFoundError extends Error {
  constructor(message = 'Account request not found') {
    super(message);
    this.name = 'AccountRequestNotFoundError';
  }
}

export class TokenExpiredError extends Error {
  constructor(message = 'Token has expired') {
    super(message);
    this.name = 'TokenExpiredError';
  }
}

export class InvalidTokenError extends Error {
  constructor(message = 'Invalid token') {
    super(message);
    this.name = 'InvalidTokenError';
  }
}
