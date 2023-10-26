import { z } from "zod";
import { APIKey } from "./contracts";

export type IAPIKey = z.TypeOf<typeof APIKey>;
