import releaseIt, { ReleaseItOptions } from 'release-it';
import {
  CHANGELOG_FILE,
  RELEASE_IT_PLUGIN_FILE,
  ROOT,
} from '../common/constants.js';
import { getPkgJson, kebabCaseObject } from '../common/utils.js';

export interface ReleaseOptions {
  [key: string]: any;
  increment?: string;
  preRelease?: boolean | string;
  preReleaseId?: string;
  changelog?: boolean;
  ci?: boolean;
  dryRun?: boolean;
  onlyVersion?: boolean;
  releaseVersion?: boolean;
}

interface ParsedOptions extends ReleaseItOptions {
  changelog: boolean;
}

function parseOptions(options: ReleaseOptions): ParsedOptions {
  const parsed = kebabCaseObject(options, [
    'dryRun',
    'onlyVersion',
    'releaseVersion',
  ]) as ParsedOptions;

  const pkgJson = getPkgJson();

  // Prefer to using user config.
  // If it is not defined and current version is normal semver,
  // use 'beta' by default.
  if (
    !parsed.preReleaseId &&
    typeof parsed.preRelease !== 'string' &&
    !pkgJson?.version.includes('-')
  ) {
    parsed.preReleaseId = 'beta';
  }

  return parsed;
}

export async function release(
  increment?: string,
  options: ReleaseOptions = {}
) {
  const parsed = parseOptions(options);

  await releaseIt({
    ...parsed,
    increment,
    configDir: ROOT,
    plugins: {
      [RELEASE_IT_PLUGIN_FILE]: {},
      ...(parsed.changelog && {
        '@release-it/conventional-changelog': {
          infile: CHANGELOG_FILE,
          header: '# Changelog',
          preset: 'angular',
          ignoreRecommendedBump: true,
        },
      }),
    },
    git: {
      commitMessage: 'release: ${version}',
      tagName: 'v${version}',
      ...parsed.git,
    },
  });
}
