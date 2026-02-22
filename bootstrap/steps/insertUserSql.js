import pkg from 'pg';
import bcrypt from 'bcryptjs'; 
const { Client } = pkg;

export async function insertUserSql() {
  const client = new Client({
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
  });

  try {
    await client.connect();
  
    const plainPassword = process.env.N8N_ADMIN_PASSWORD || 'DefaultLocalPass123!';
    const adminEmail = process.env.N8N_ADMIN_EMAIL || 'admin@local.test';

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(plainPassword, saltRounds);

    const updateOwnerSql = `
      UPDATE "user" 
      SET email = $1, 
          password = $2,
          "roleSlug" = 'global:owner',
          "updatedAt" = NOW()
      WHERE "roleSlug" = 'global:owner' OR email IS NULL OR email = '';
    `;
    
    await client.query(updateOwnerSql, [adminEmail, passwordHash]);

    const settingsToUpdate = [
      { key: 'userManagement', value: '{"showSetupOnFirstLoad":false}' },
      { key: 'owner_setup_completed', value: 'true' }
    ];

    for (const setting of settingsToUpdate) {
      await client.query(`
        INSERT INTO settings (key, value)
        VALUES ($1, $2)
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
      `, [setting.key, setting.value]);
    }

  } catch (err) {
    console.error(`[ERROR] SQL Local failed:`, err.message);
    throw err;
  } finally {
    await client.end();
  }
}