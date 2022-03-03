declare module 'release-it' {
  /**
   * ReleaseIt options.
   * @see https://github.com/release-it/release-it/blob/832528d113/config/release-it.json
   */
  export interface ReleaseItOptions {
    [key: string]: any;
    plugins?: Record<string, any>;
    hooks?: Record<string, any>;
    git?: any;
    npm?: any;
    github?: any;
    gitlab?: any;
    ci?: boolean;
    'disable-metrics'?: boolean;
    'dry-run'?: boolean;
    increment?: string;
    'only-version'?: boolean;
    'release-version'?: boolean;
    preReleaseId?: string;
  }

  interface ReleaseIt {
    (options: ReleaseItOptions): void;
    Plugin: any;
  }

  const releaseIt: ReleaseIt;

  export default releaseIt;
}
