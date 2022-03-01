const releaseIt = require('release-it');

class VantifyReleaseItPlugin extends releaseIt.Plugin {
  async beforeRelease() {
    const { execSync } = require('child_process');
    execSync('vantify build', { stdio: 'inherit' });
  }
}

module.exports = VantifyReleaseItPlugin;
