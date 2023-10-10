import { z } from "zod";
import { ApiKey, ApiKeyList } from "./contracts";

export type IApiKey = z.TypeOf<typeof ApiKey>;

export type IApiKeyList = z.TypeOf<typeof ApiKeyList>;
