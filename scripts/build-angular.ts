import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const webDir = path.join(__dirname, '../apps/web');
const distDir = path.join(__dirname, '../apps/web/dist');

console.log('📦 Building Angular Production Distribution using Angular CLI...');

try {
  // Execute Angular CLI AOT build
  execSync('npx ng build --configuration development', {
    cwd: webDir,
    stdio: 'inherit'
  });

  // Check where Angular CLI built the browser assets
  const buildBrowserDir = path.join(webDir, 'dist/web/browser');
  const buildDirectDir = path.join(webDir, 'dist/web');
  const sourceBuildDir = fs.existsSync(buildBrowserDir) ? buildBrowserDir : buildDirectDir;

  if (fs.existsSync(sourceBuildDir) && sourceBuildDir !== distDir) {
    fs.cpSync(sourceBuildDir, distDir, { recursive: true });
  }

  console.log('✅ Official Angular Distribution created successfully in apps/web/dist!\n');
} catch (error) {
  console.error('❌ Angular CLI Build Failed:', error);
  process.exit(1);
}
