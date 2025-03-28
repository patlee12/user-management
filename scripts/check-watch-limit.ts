import { readFileSync, existsSync } from 'fs';
import prompts from 'prompts';
import { execSync } from 'child_process';
import { exit } from 'process';
import os from 'os';

const required = 524288;

async function main() {
  const platform = os.platform();

  if (platform === 'linux') {
    const path = '/proc/sys/fs/inotify/max_user_watches';

    if (!existsSync(path)) {
      console.warn('⚠️ Cannot find inotify limit file. Skipping check.');
      return;
    }

    const current = parseInt(readFileSync(path, 'utf-8'), 10);

    if (current >= required) {
      console.log(`✅ [inotify] Watch limit is OK (${current})`);
      return;
    }

    console.warn(`
🚨 [inotify] Your system watch limit is too low: ${current}
This may cause crashes in Turbopack, Webpack, Rollup, and AdminJS.

🛠 Required: ${required}
`);

    const { shouldFix } = await prompts({
      type: 'confirm',
      name: 'shouldFix',
      message: 'Do you want to automatically fix it now? (requires sudo)',
      initial: true,
    });

    if (shouldFix) {
      try {
        console.log('🔧 Applying fix with sudo...');
        execSync(
          `echo fs.inotify.max_user_watches=${required} | sudo tee -a /etc/sysctl.conf`,
          { stdio: 'inherit' },
        );
        execSync('sudo sysctl -p', { stdio: 'inherit' });

        console.log('\n✅ Watch limit updated!');
        console.log('♻️ Restarting dev process...\n');

        execSync('yarn dev', { stdio: 'inherit' });
        exit(0);
      } catch (err) {
        console.error('❌ Failed to apply fix:', err);
        exit(1);
      }
    } else {
      console.log(`
⚠️ Skipping fix. You may encounter build issues.
Run the following manually later:

    echo fs.inotify.max_user_watches=${required} | sudo tee -a /etc/sysctl.conf
    sudo sysctl -p
`);
    }
  } else if (platform === 'darwin') {
    console.log(`✅ [macOS] No inotify watch limit issues expected.`);
  } else if (platform === 'win32') {
    console.log(`✅ [Windows] inotify limits do not apply.`);
  } else {
    console.log(`⚠️ Unknown platform: ${platform}. Skipping inotify check.`);
  }
}

main();
