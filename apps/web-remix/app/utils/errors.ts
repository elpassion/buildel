export class ValidationError<T> extends Error {
  constructor(
    public readonly fieldErrors: {
      [P in allKeys<T>]: string;
    },
  ) {
    super();
  }
}

export class UnknownAPIError extends Error {
  constructor() {
    super('Unknown API error');
  }
}

export class UnauthorizedError extends Error {
  constructor() {
    super('Unauthorized');
  }
}

export class BillingError extends Error {
  constructor(msg: string) {
    super(msg);
  }
}

export class NotFoundError extends Error {
  constructor() {
    super('Not found');
  }
}

type allKeys<T> = T extends any ? keyof T : never;
