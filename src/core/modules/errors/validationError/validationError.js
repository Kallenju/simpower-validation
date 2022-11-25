class ValidationError extends TypeError {
  constructor(message) {
    super(message);
    const validationError = this;

    validationError.name = 'ValidationError';
  }
}

export { ValidationError };
