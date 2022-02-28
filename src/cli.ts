import { cac } from 'cac';
import { build } from './commands/build.js';
import { clean } from './commands/clean.js';
import { lint } from './commands/lint.js';
import { test } from './commands/test.js';
import { CLI_VERSION } from './common/constants.js';
import { logger } from './common/logger.js';

const cli = cac('vantify');

cli.version(CLI_VERSION);
cli.help();

cli.command('clean', 'Clean all dist files').action(clean);

cli
  .command('test', 'Run jest')
  .option(
    '--clearCache',
    'Clears the configured Jest cache directory and then exits'
  )
  .option(
    '--coverage',
    'Indicates that test coverage information should be collected and reported in the output'
  )
  .option('--debug', 'Print debugging info about your jest config')
  .option(
    '--watch',
    'Watch files for changes and rerun tests related to changed files'
  )
  .allowUnknownOptions()
  .action(test);

cli.command('build', 'Build components in production mode').action(build);

cli.command('lint', 'Run eslint').action(lint);

try {
  cli.parse(process.argv, { run: false });
  await cli.runMatchedCommand();
} catch (err) {
  logger.error(err);
  process.exit(1);
}
