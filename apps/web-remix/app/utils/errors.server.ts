export class ValidationError<T> extends Error {
  constructor(
    public readonly fieldErrors: {
      [P in allKeys<T>]: string;
    }
  ) {
    super();
  }
}

export class UnknownAPIError extends Error {
  constructor() {
    super("Unknown API error");
  }
}

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
  }
}

type allKeys<T> = T extends any ? keyof T : never;
