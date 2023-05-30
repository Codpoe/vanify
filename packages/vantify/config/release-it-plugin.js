import { Plugin } from 'release-it';

export default class VantifyReleaseItPlugin extends Plugin {
  async beforeRelease() {
    const { execSync } = require('child_process');
    execSync('vantify build', { stdio: 'inherit' });
  }
}
