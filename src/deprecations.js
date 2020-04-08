import { deprecationNotice } from './utility/validation/deprecation';

import { createMetaCacheEntryName } from './cache';

// eslint-disable-next-line import/prefer-default-export
export const createCacheEntryName = deprecationNotice(createMetaCacheEntryName);
