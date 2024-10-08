export class MonetaryValue {
  constructor(
    private readonly value: number,
    private readonly currency = 'USD',
  ) {}

  static format(
    value: number,
    currency = 'USD',
    args?: Intl.NumberFormatOptions,
  ): string {
    return new MonetaryValue(value, currency).format(args);
  }

  public format(args?: Intl.NumberFormatOptions): string {
    return Intl.NumberFormat('en-US', {
      currency: this.currency,
      style: 'currency',
      ...args,
    }).format(this.value);
  }
}
