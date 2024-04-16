import originalDayjs, { Dayjs as OriginalDayjs } from "dayjs";
import localeData from "dayjs/plugin/localeData";
originalDayjs.extend(localeData);

export class Dayjs {
  private instance: OriginalDayjs;
  private defaultFormat = "DD/MM/YYYY HH:mm";

  constructor(date: originalDayjs.ConfigType) {
    if (typeof date === "string" && !date.endsWith("Z")) {
      date += "Z"; // adding "Z" at the end of the date lets dayjs know that this date should be treated as UTC date and format date in the LOCAL timezone
    }

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

  startOf(unit: originalDayjs.OpUnitType): originalDayjs.Dayjs {
    return this.instance.startOf(unit);
  }

  endOf(unit: originalDayjs.OpUnitType): originalDayjs.Dayjs {
    return this.instance.endOf(unit);
  }

  add(
    value: number,
    unit?: originalDayjs.ManipulateType | undefined
  ): OriginalDayjs {
    return this.instance.add(value, unit);
  }

  get startOfMonth() {
    return this.startOf("month");
  }

  get endOfMonth() {
    return this.endOf("month");
  }
}

export const dayjs = (date: originalDayjs.ConfigType) => new Dayjs(date);
