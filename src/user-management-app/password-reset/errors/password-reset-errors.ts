export class PasswordResetNotFoundError extends Error {
  constructor(message = 'Password reset not found') {
    super(message);
    this.name = 'PasswordResetNotFoundError';
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

export class UserNotFoundError extends Error {
  constructor(message = 'User was not found') {
    super(message);
    this.name = 'UserNotFoundError';
  }
}

export class PasswordResetEmailFailedError extends Error {
  constructor(message = 'Password Reset Email Failed') {
    super(message);
    this.name = 'PasswordResetEmailFailedError';
  }
}
