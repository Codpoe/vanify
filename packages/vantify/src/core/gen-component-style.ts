import path from 'upath';
import fs from 'fs-extra';
import { STYLE_EXTS, TEMP_SRC_DIR } from '../common/constants.js';
import { ResolvedConfig } from '../common/types.js';
import { getDepsMap } from './gen-deps-map.js';

function getStyleExt(component: string): string | undefined {
  for (const ext of STYLE_EXTS) {
    const filePath = path.join(TEMP_SRC_DIR, component, `index${ext}`);
    if (fs.existsSync(filePath)) {
      return ext;
    }
  }
}

function getStyleContent(
  type: 'index' | 'css',
  deps: string[],
  originStyleExt?: string
): string {
  let code = deps
    .map(
      dep => `import '../../${dep}/style${type === 'index' ? '' : '/css'}';\n`
    )
    .join('');

  if (originStyleExt) {
    code += `import '../index${type === 'index' ? originStyleExt : '.css'}';\n`;
  }

  return code;
}

export async function genComponentStyle(config: ResolvedConfig) {
  await Promise.all(
    config.components.map(async component => {
      const depsMap = await getDepsMap();
      const deps = depsMap[component];
      const originStyleExt = getStyleExt(component);
      const styleDir = path.join(TEMP_SRC_DIR, component, 'style');

      // <component>/style/index.ts
      await fs.outputFile(
        path.join(styleDir, 'index.ts'),
        getStyleContent('index', deps, originStyleExt)
      );

      // <component>/style/css.ts
      await fs.outputFile(
        path.join(styleDir, 'css.ts'),
        getStyleContent('css', deps, originStyleExt)
      );
    })
  );
}
