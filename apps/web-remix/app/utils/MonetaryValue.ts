export class MonetaryValue {
  constructor(
    private readonly value: number,
    private readonly currency = 'USD',
  ) {}

  static format(value: number, currency = 'USD'): string {
    return new MonetaryValue(value, currency).format();
  }

  public format(): string {
    return Intl.NumberFormat('en-US', {
      currency: this.currency,
      style: 'currency',
    }).format(this.value);
  }
}
