import { z } from "zod";
import { ApiKey, ApiKeyList, SecretKey, SecretKeyList } from "./contracts";

export type ISecretKey = z.TypeOf<typeof SecretKey>;

export type ISecretKeyList = z.TypeOf<typeof SecretKeyList>;

export type IApiKey = z.TypeOf<typeof ApiKey>;

export type IApiKeyList = z.TypeOf<typeof ApiKeyList>;
