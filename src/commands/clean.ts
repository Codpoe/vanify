import fs from 'fs-extra';
import {
  DIST_DIR,
  ES_DIR,
  LIB_DIR,
  SITE_DIST_DIR,
} from '../common/constants.js';

export async function clean() {
  await Promise.all([
    fs.remove(ES_DIR),
    fs.remove(LIB_DIR),
    fs.remove(DIST_DIR),
    fs.remove(SITE_DIST_DIR),
  ]);
}
