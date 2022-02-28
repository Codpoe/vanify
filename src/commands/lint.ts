import { execa } from 'execa';
import { Listr } from 'listr2';
import { resolveConfig } from '../common/config.js';
import { SCRIPT_EXTS } from '../common/constants.js';
import { logger } from '../common/logger.js';

export async function lint() {
  const config = await resolveConfig();

  try {
    await new Listr([
      {
        title: 'Run eslint',
        task: async () => {
          await execa(
            'eslint',
            [config.srcDir, '--fix', '--color', '--ext', SCRIPT_EXTS.join(',')],
            { preferLocal: true }
          );
        },
      },
    ]).run();
  } catch (err: any) {
    logger.error(err.stderr || err.stdout);
    process.exit(1);
  }
}
