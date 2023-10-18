import originalDayjs, { Dayjs as OriginalDayjs } from "dayjs";

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
}

export const dayjs = (date: originalDayjs.ConfigType) => new Dayjs(date);
