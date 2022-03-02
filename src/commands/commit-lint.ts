import fs from 'fs-extra';
import { Listr } from 'listr2';
import _lint from '@commitlint/lint';
import _format from '@commitlint/format';
import { logger } from '../common/logger.js';

const lint: typeof _lint = (_lint as any).default;
const format: typeof _format = (_format as any).default;

type LintParams = Parameters<typeof lint>;

const lintRules: LintParams[1] = {
  'type-empty': [2, 'never'],
  'type-case': [2, 'always', 'lower-case'],
  'type-enum': [
    2,
    'always',
    [
      'feat',
      'fix',
      'perf',
      'test',
      'docs',
      'types',
      'chore',
      'build',
      'ci',
      'revert',
      'release',
      'refactor',
      'breaking change',
    ],
  ],
  'subject-empty': [2, 'never'],
  'subject-full-stop': [2, 'never', '.'],
  'header-max-length': [2, 'always', 72],
  'body-leading-blank': [1, 'always'],
  'footer-leading-blank': [1, 'always'],
};

const lintOptions: LintParams[2] = {
  parserOpts: {
    headerPattern: /^(\w*)(?:\((.*)\))?!?: (.*)$/,
  },
};

export async function commitLint(gitParams: string) {
  await new Listr([
    {
      title: 'Lint commit message',
      task: async () => {
        const message = await (await fs.readFile(gitParams, 'utf-8')).trim();

        const result = await lint(message, lintRules, lintOptions);
        const output = format(
          { results: [result] },
          { color: true, helpUrl: '' }
        );

        if (output) {
          logger.log(output);
        }

        if (!result.valid) {
          process.exit(1);
        }
      },
    },
  ]).run();
}
