import { cac } from 'cac';
import colors from 'picocolors';
import { build } from './commands/build.js';
// import { changelog } from './commands/changelog.js';
import { clean } from './commands/clean.js';
import { commitLint } from './commands/commit-lint.js';
import { lint } from './commands/lint.js';
import { release } from './commands/release.js';
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
    '-c, --config',
    'The path to a jest config file specifying how to find and execute tests'
  )
  .option(
    '--coverage',
    'Indicates that test coverage information should be collected and reported in the output'
  )
  .option('--debug', 'Print debugging info about your jest config')
  .option(
    '-o, --onlyChanged',
    'Attempts to identify which tests to run based on which files have changed in the current repository'
  )
  .option('-i, --runInBand', 'Run all tests serially in the current process')
  .option('-u, --update-snapshot', 'Use this flag to re-record snapshots')
  .option(
    '--watch',
    'Watch files for changes and rerun tests related to changed files'
  )
  .allowUnknownOptions()
  .action(test);

cli.command('build', 'Build components in production mode').action(build);

cli.command('lint', 'Run eslint').action(lint);

cli
  .command('commit-lint <gitParams>', 'Lint commit message')
  .action(commitLint);

// cli
//   .command('changelog', 'Generate changelog')
//   .option(
//     '-o, --out-file <outFile>',
//     'Specify a file to write the changelog to'
//   )
//   .action(changelog);

cli
  .command(
    'release [increment]',
    `Release "major", "minor", "patch", or "pre*" version; or specify version [default: "patch"]`
  )
  .option(
    '--preRelease [preReleaseId]',
    'The "prerelease identifier" to use as a prefix for the "prerelease" part of a semver. Like the "beta" in 1.2.0-beta.8'
  )
  .option('--no-changelog', 'Whether to generate changelog file')
  .option(
    '--ci',
    'No prompts, no user interaction; activated automatically in CI environments'
  )
  .option(
    '-d, --dry-run',
    'Do not touch or write anything, but show the commands'
  )
  .allowUnknownOptions()
  .action(release);

try {
  cli.parse(process.argv, { run: false });
  await cli.runMatchedCommand();
} catch (err) {
  logger.error(err);
  process.exit(1);
}
