import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const webDir = path.join(__dirname, '../apps/web');
const distDir = path.join(__dirname, '../apps/web/dist');

console.log('📦 Cleaning and building Angular Production Distribution...');

try {
  // Execute Angular CLI build
  execSync('npx ng build', {
    cwd: webDir,
    stdio: 'inherit'
  });

  const buildBrowserDir = path.join(webDir, 'dist/web/browser');
  const buildDirectDir = path.join(webDir, 'dist/web');
  const sourceBuildDir = fs.existsSync(buildBrowserDir) ? buildBrowserDir : buildDirectDir;

  if (fs.existsSync(sourceBuildDir)) {
    // Copy compiled Angular browser assets
    const files = fs.readdirSync(sourceBuildDir);
    for (const file of files) {
      const srcFile = path.join(sourceBuildDir, file);
      const destFile = path.join(distDir, file);
      if (srcFile !== distDir) {
        fs.cpSync(srcFile, destFile, { recursive: true });
      }
    }
  }

  console.log('✅ Clean Angular Distribution created in apps/web/dist!\n');
} catch (error) {
  console.error('❌ Angular CLI Build Failed:', error);
  process.exit(1);
}
