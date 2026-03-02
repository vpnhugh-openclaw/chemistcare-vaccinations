import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

function run(cmd) {
  return execSync(cmd, { stdio: 'pipe', encoding: 'utf8' }).trim();
}

try {
  // Ensure Supabase local stack is running (requires Docker Desktop + Supabase CLI)
  run('supabase start');

  const statusEnv = run('supabase status -o env');
  const lines = statusEnv.split(/\r?\n/).filter(Boolean);
  const map = Object.fromEntries(
    lines
      .filter((l) => l.includes('='))
      .map((l) => {
        const i = l.indexOf('=');
        return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
      }),
  );

  if (!map.API_URL || !map.ANON_KEY) {
    throw new Error('Could not read API_URL / ANON_KEY from `supabase status -o env`.');
  }

  const envLocal = [
    `VITE_SUPABASE_URL=\"${map.API_URL}\"`,
    `VITE_SUPABASE_PUBLISHABLE_KEY=\"${map.ANON_KEY}\"`,
    `VITE_SUPABASE_PROJECT_ID=\"local\"`,
  ].join('\n') + '\n';

  writeFileSync(join(process.cwd(), '.env.local'), envLocal, 'utf8');

  console.log('✅ Local Supabase bootstrapped.');
  console.log('✅ Wrote .env.local for offline/local mode.');
  console.log('Next: npm run local:dev');
} catch (error) {
  console.error('❌ Failed to bootstrap local mode.');
  console.error(String(error?.message || error));
  console.error('\nPrerequisites:');
  console.error('1) Docker Desktop running');
  console.error('2) Supabase CLI installed (https://supabase.com/docs/guides/cli)');
  process.exit(1);
}
