import originalDayjs from 'dayjs';
import type { Dayjs as OriginalDayjs } from 'dayjs';
import localeData from 'dayjs/plugin/localeData';
import relativeTime from 'dayjs/plugin/relativeTime';

originalDayjs.extend(relativeTime);
originalDayjs.extend(localeData);

export class Dayjs {
  private instance: OriginalDayjs;
  private defaultFormat = 'DD/MM/YYYY HH:mm';

  constructor(date?: originalDayjs.ConfigType) {
    // if (typeof date === 'string' && !date.endsWith('Z')) {
    //   date += 'Z'; // adding "Z" at the end of the date lets dayjs know that this date should be treated as UTC date and format date in the LOCAL timezone
    // }

    this.instance = originalDayjs(date);
  }

  format(template?: string): string {
    return this.instance.format(template ?? this.defaultFormat);
  }

  month(): number {
    return this.instance.month();
  }

  toISOString(): string {
    return this.instance.toISOString();
  }

  toDate() {
    return this.instance.toDate();
  }

  startOf(unit: originalDayjs.OpUnitType): originalDayjs.Dayjs {
    return this.instance.startOf(unit);
  }

  endOf(unit: originalDayjs.OpUnitType): originalDayjs.Dayjs {
    return this.instance.endOf(unit);
  }

  add(
    value: number,
    unit?: originalDayjs.ManipulateType | undefined,
  ): OriginalDayjs {
    return this.instance.add(value, unit);
  }

  addMonth(value: number) {
    return this.add(value, 'month');
  }

  subtract(
    value: number,
    unit?: originalDayjs.ManipulateType | undefined,
  ): OriginalDayjs {
    return this.instance.subtract(value, unit);
  }

  subtractMonth(value: number) {
    return this.subtract(value, 'month');
  }

  from(date: originalDayjs.ConfigType) {
    return this.instance.from(date);
  }

  to(date: originalDayjs.ConfigType) {
    return this.instance.to(date);
  }

  get startOfMonth() {
    return this.startOf('month');
  }

  get endOfMonth() {
    return this.endOf('month');
  }
}

export const dayjs = (date?: originalDayjs.ConfigType) => new Dayjs(date);
