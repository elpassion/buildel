import { z } from "zod";
import { Pipeline } from "../contracts";

export type IPipeline = z.infer<typeof Pipeline>;
