import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { pool } from './pool';

export async function runMigrations(): Promise<void> {
  const dir = path.resolve(process.cwd(), 'src/database/migrations');
  const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort();

  for (const file of files) {
    const sql = await readFile(path.join(dir, file), 'utf8');
    await pool.query(sql);
  }
}

if (require.main === module) {
  runMigrations()
    .then(async () => {
      console.log('Migrations aplicadas com sucesso');
      await pool.end();
    })
    .catch((err) => {
      console.error('Falha ao aplicar migrations', err);
      process.exit(1);
    });
}