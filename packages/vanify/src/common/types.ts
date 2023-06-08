import { UserConfig as ViteUserConfig, HtmlTagDescriptor } from 'vite';
import { Options as SwcOptions } from '@swc/core';
import { BundleAsyncOptions } from 'lightningcss';

export type CSS_LANG = 'css' | 'less' | 'scss';

export interface SiteNavItem {
  link: string;
  text?: string;
  icon?: string;
}

export interface SiteSidebarItem {
  link: string;
  text?: string;
}

export interface SiteConfig {
  title?: string;
  description?: string;
  logo?: string;
  htmlTags?: HtmlTagDescriptor[];
  nav?: SiteNavItem[];
  sidebar?: SiteSidebarItem[];
  defaultLocale?: string;
  localeText?: string;
  locales?: Record<string, Omit<SiteConfig, 'locales' | 'defaultLocale'>>;
}

export interface UserConfig {
  /**
   * Library name
   */
  name?: string;
  /**
   * Whether to export components through Named Export.
   *
   * When `true`, all module and type definitions within the component are exported through `export * from 'xxx'`.
   *
   * When `false`, the component is exported through `export default from 'xxx'`.
   *
   * @default true
   */
  namedExport?: boolean;
  /**
   * The Directory where the components are placed
   * @default 'src'
   */
  srcDir?: string;
  /**
   * The Directory where the docs are placed
   * @default 'docs'
   */
  docsDir?: string;
  componentExcludeDir?: string[];
  /**
   * CSS config
   */
  css?: {
    /**
     * CSS lang (css, less, scss)
     * @default 'css'
     */
    lang?: CSS_LANG;
    /**
     * CSS base file, which can be used to introduce CSS base variables and styles.
     */
    base?: string;
  };
  /**
   * site config
   */
  site?: SiteConfig;
  /**
   * vite config
   */
  vite?: ViteUserConfig;
  /**
   * swc options
   */
  swc?: SwcOptions;
  /**
   * lightningcss bundle options
   */
  lightningcss?: BundleAsyncOptions<any>;
}

export interface ResolvedConfig extends UserConfig {
  namedExport: boolean;
  srcDir: string;
  docsDir: string;
  css: {
    lang: CSS_LANG;
    base?: string;
  };
  components: string[];
}
