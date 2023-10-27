import { z } from "zod";
import { SecretKey, SecretKeyList } from "./contracts";

export type ISecretKey = z.TypeOf<typeof SecretKey>;

export type ISecretKeyList = z.TypeOf<typeof SecretKeyList>;
