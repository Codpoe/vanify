import { Plugin } from 'release-it';

export default class VanifyReleaseItPlugin extends Plugin {
  async beforeRelease() {
    const { execSync } = require('child_process');
    execSync('vanify build', { stdio: 'inherit' });
  }
}
