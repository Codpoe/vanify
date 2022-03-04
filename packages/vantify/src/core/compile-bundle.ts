import { build, InlineConfig, LibraryFormats } from 'vite';
import { DIST_DIR, TEMP_SRC_DIR } from '../common/constants.js';
import { ResolvedConfig } from '../common/types.js';
import { getDirEntryFile, getPkgJson } from '../common/utils.js';

interface GetViteConfigOptions {
  config: ResolvedConfig;
  formats: LibraryFormats[];
  minify: boolean;
  pkgJson?: Record<string, any>;
}

function getViteConfig({
  config,
  formats,
  minify,
  pkgJson,
}: GetViteConfigOptions): InlineConfig {
  const fileName = (format: string) =>
    `${config.name}.${format}.${minify ? 'min.js' : 'js'}`;

  const external = ['react'].concat(
    formats.includes('umd') ? [] : Object.keys(pkgJson?.dependencies || [])
  );

  return {
    ...config.vite,
    logLevel: 'silent',
    build: {
      lib: {
        name: config.name,
        entry: getDirEntryFile(TEMP_SRC_DIR)!,
        formats,
        fileName,
        ...config.vite?.build?.lib,
      },
      outDir: DIST_DIR,
      emptyOutDir: false,
      minify: minify ? 'terser' : false,
      rollupOptions: {
        external,
        output: {
          globals: {
            react: 'React',
          },
        },
        ...config.vite?.build?.rollupOptions,
      },
    },
  };
}

export async function compileBundle(config: ResolvedConfig) {
  const pkgJson = getPkgJson();

  const configs: InlineConfig[] = [
    getViteConfig({ config, pkgJson, formats: ['es', 'cjs'], minify: false }),
    getViteConfig({ config, pkgJson, formats: ['es', 'cjs'], minify: true }),
    getViteConfig({ config, pkgJson, formats: ['umd'], minify: false }),
    getViteConfig({ config, pkgJson, formats: ['umd'], minify: true }),
  ];

  await Promise.all(configs.map(build));
}
