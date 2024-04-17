import { dayjs } from "~/utils/Dayjs";

export const DEFAULT_START_DATE = dayjs(new Date()).startOfMonth.toISOString();
export const DEFAULT_END_DATE = dayjs(new Date()).endOfMonth.toISOString();
