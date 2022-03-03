import path from 'upath';
import fs from 'fs-extra';
import { STYLE_EXTS } from '../common/constants.js';
import { ResolvedConfig } from '../common/types.js';
import { getDepsMap } from './gen-deps-map.js';

function getPackageStyleFile(srcDir: string): string | undefined {
  for (const ext of STYLE_EXTS) {
    const filePath = path.join(srcDir, `index${ext}`);
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }
}

export async function genPackageStyle(config: ResolvedConfig) {
  const packageStyleFile = getPackageStyleFile(config.srcDir);

  if (packageStyleFile) {
    return;
  }

  const depsMap = await getDepsMap();
  // const code = depsMap.flattened.map(component =>)
}
