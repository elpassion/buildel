export class Logger {
  public static debug(message: string) {
    if (!this.includes(["debug"])) return;

    console.debug(message);
  }

  public static warn(message: string) {
    if (!this.includes(["debug", "warn"])) return;

    console.warn(message);
  }

  public static info(message: string) {
    if (!this.includes(["debug", "warn", "info"])) return;

    console.info(message);
  }

  public static error(message: string) {
    console.error(message);
  }

  private static includes(logLevels: string[]) {
    return logLevels.includes(process.env.LOG_LEVEL || "info");
  }
}
