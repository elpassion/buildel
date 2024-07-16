import type { z } from 'zod';

import type { SecretKey, SecretKeyList } from '~/api/secrets/secrets.contracts';

export type ISecretKey = z.TypeOf<typeof SecretKey>;

export type ISecretKeyList = z.TypeOf<typeof SecretKeyList>;
