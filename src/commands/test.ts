import jest from 'jest';
import { Config } from '@jest/types';
import { setNodeEnv } from '../common/utils.js';
import { ROOT } from '../common/constants.js';
import { logger } from '../common/logger.js';

export async function test(options: Config.Argv) {
  setNodeEnv('test');

  try {
    const { results } = await jest.runCLI(
      {
        // make jest tests faster
        // see: https://ivantanev.com/make-jest-faster/
        rootDir: ROOT,
        maxWorkers: options.watch ? '50%' : '25%',
        ...options,
      },
      [ROOT]
    );

    if (!results.success && !options.watch) {
      process.exit(1);
    }
  } catch (err: any) {
    logger.error(err);

    if (!options.watch) {
      process.exit(1);
    }
  }
}
