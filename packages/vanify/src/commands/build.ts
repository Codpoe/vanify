import { Listr } from 'listr2';
import fs from 'fs-extra';
import path from 'upath';
import colors from 'picocolors';
import { resolveConfig } from '../common/config.js';
import { ResolvedConfig } from '../common/types.js';
import { isScript, isStyle, setNodeEnv, startClock } from '../common/utils.js';
import {
  CLI_VERSION,
  COMPILE_EXCLUDE_DIRS,
  ES_DIR,
  LIB_DIR,
  TEMP_SRC_DIR,
} from '../common/constants.js';
import { logger } from '../common/logger.js';
import { genDepsMap } from '../core/gen-deps-map.js';
import {
  genTypeDeclaration,
  getTsDeclarationProject,
} from '../core/gen-type-declaration.js';
import { compileScript } from '../core/compile-script.js';
import { compileStyle } from '../core/compile-style.js';
import { compileBundle } from '../core/compile-bundle.js';
import { genComponentStyle } from '../core/gen-component-style.js';
import { genPackageEntry } from '../core/gen-package-entry.js';
import { genPackageStyle } from '../core/gen-package-style.js';
import { clean } from './clean.js';

async function compileFile(config: ResolvedConfig, filePath: string) {
  if (isScript(filePath)) {
    return Promise.all([
      compileScript(config, filePath, 'es6'),
      compileScript(config, filePath, 'commonjs'),
    ]);
  }

  if (isStyle(filePath)) {
    return compileStyle(config, filePath);
  }

  const relativePath = path.relative(TEMP_SRC_DIR, filePath);
  const outputEsPath = path.join(ES_DIR, relativePath);
  const outputLibPath = path.join(LIB_DIR, relativePath);

  return Promise.all([
    fs.copy(filePath, outputEsPath),
    fs.copy(filePath, outputLibPath),
  ]);
}

async function compileDir(config: ResolvedConfig, dir: string) {
  const files = await fs.readdir(dir);

  await Promise.all(
    files.map(fileName => {
      const filePath = path.join(dir, fileName);
      if (fs.lstatSync(filePath).isDirectory()) {
        if (COMPILE_EXCLUDE_DIRS.includes(fileName)) {
          return;
        }
        return compileDir(config, filePath);
      }
      return compileFile(config, filePath);
    })
  );
}

const tasks = new Listr<{
  config: ResolvedConfig;
}>([
  {
    title: 'Prepare (generate package entry and style entry)',
    task: async ({ config }) => {
      // clean all dist files
      await clean();
      // copy src files to temp directory for generating some additional files
      await fs.copy(config.srcDir, TEMP_SRC_DIR);

      await genDepsMap(config);
      await genComponentStyle(config);
      await genPackageEntry(config, {
        outputPath: path.join(TEMP_SRC_DIR, 'index.ts'),
      });
      await genPackageStyle(config, {
        pathResolver: filePath => `./${path.relative(config.srcDir, filePath)}`,
        outputPath: path.join(TEMP_SRC_DIR, `index.${config.css.lang}`),
      });
    },
  },
  {
    title: 'Build type declarations',
    task: async (_ctx, task) => {
      const tsProject = getTsDeclarationProject();
      if (!tsProject) {
        return task.skip('`tsconfig.declaration.json is not found`');
      }

      await genTypeDeclaration(tsProject);
    },
  },
  {
    title: 'Build components',
    task: (_ctx, task) =>
      task.newListr(
        [
          {
            title: 'Build ESModule and CommonJS output',
            task: async ctx => {
              await compileDir(ctx.config, TEMP_SRC_DIR);
            },
          },
          {
            title: 'Build bundle output',
            task: async ctx => {
              await compileBundle(ctx.config);
            },
          },
        ],
        { concurrent: true }
      ),
  },
]);

export async function build() {
  setNodeEnv('production');

  logger.log(colors.cyan(`vanify v${CLI_VERSION}`) + ' start build...\n');

  const config = await resolveConfig();
  const duration = startClock();

  await tasks.run({ config });
  await fs.remove(TEMP_SRC_DIR);

  logger.log(`\n🎉 Build successfully in ${duration()}\n`);
}
