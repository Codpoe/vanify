import path from 'upath';
import fs from 'fs-extra';
import { ResolvedConfig } from '../common/types.js';
import { ROOT, TEMP_SRC_DIR } from '../common/constants.js';
import { getPackageEntryFile } from '../common/utils.js';
import { getDepsMap } from './gen-deps-map.js';

export async function genPackageEntry(config: ResolvedConfig) {
  const packageEntryFile = getPackageEntryFile(TEMP_SRC_DIR);

  // package entry exists (user custom package entry)
  if (packageEntryFile) {
    return;
  }

  const depsMap = await getDepsMap();
  const pkgJsonFile = path.join(ROOT, 'package.json');

  let code = depsMap.flattened
    .map(
      component =>
        `export ${
          config.namedExport ? '*' : '{ default }'
        } from './${component}';\n`
    )
    .join('');

  let version: string | undefined;

  if (fs.existsSync(pkgJsonFile)) {
    ({ version } = await fs.readJson(pkgJsonFile, 'utf-8'));
  }

  if (version) {
    code += `\nexport const version = '${version}';\n`;
  }

  await fs.outputFile(path.join(TEMP_SRC_DIR, 'index.ts'), code);
}
