import fs from 'fs-extra';
import { execa } from 'execa';
import { TS_CONFIG_DECLARATION_FILE } from '../common/constants.js';

export function getTsDeclarationProject(): string | undefined {
  if (fs.existsSync(TS_CONFIG_DECLARATION_FILE)) {
    return TS_CONFIG_DECLARATION_FILE;
  }
}

export async function genTypeDeclaration(project: string) {
  await execa('tsc', ['-p', project]);
}
