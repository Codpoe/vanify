import path from 'upath';
import fs from 'fs-extra';
import { Listr } from 'listr2';
import conventionalChangelog from 'conventional-changelog';
import { CHANGELOG_FILE, ROOT } from '../common/constants.js';

export interface ChangelogOptions {
  outFile?: string;
}

export async function changelog(options: ChangelogOptions) {
  const outFile = options.outFile
    ? path.resolve(ROOT, options.outFile)
    : CHANGELOG_FILE;

  await new Listr([
    {
      title: 'Generate changelog',
      task: async (_ctx, task) => {
        return new Promise((resolve, reject) => {
          conventionalChangelog({
            preset: 'angular',
            releaseCount: 2,
          })
            .pipe(fs.createWriteStream(outFile))
            .on('close', () => {
              task.title = `Changelog generated at ${outFile.replace(
                ROOT,
                ''
              )}`;
              resolve(outFile);
            })
            .on('error', err => {
              reject(err);
            });
        });
      },
    },
  ]).run();
}
