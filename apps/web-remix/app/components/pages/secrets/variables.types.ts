import type { SecretKey, SecretKeyList } from "~/api/secrets/secrets.contracts";
import type { z } from "zod";

export type ISecretKey = z.TypeOf<typeof SecretKey>;

export type ISecretKeyList = z.TypeOf<typeof SecretKeyList>;
