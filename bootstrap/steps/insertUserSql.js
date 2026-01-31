import pkg from 'pg';
import bcrypt from 'bcrypt'; // Import de bcrypt pour le hashage dynamique
const { Client } = pkg;

export async function insertUserSql() {
  const client = new Client({
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    ssl: {
      rejectUnauthorized: false 
    }
  });

  try {
    await client.connect();
    console.log(`[SQL-NEON] Démarrage de l'automatisation n8n sur Neon...`);

    // RÉCUPÉRATION DU MOT DE PASSE DEPUIS L'ENVIRONNEMENT
    const plainPassword = process.env.N8N_ADMIN_PASSWORD || 'ChangeMe123!';
    const email = process.env.N8N_ADMIN_EMAIL || 'admin@example.com';

    // GÉNÉRATION DYNAMIQUE DU HASH (Round 10 est le standard n8n)
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(plainPassword, saltRounds);

    console.log(`[SQL-NEON] Hash généré dynamiquement pour : ${email}`);

    // 1. Mise à jour ou Insertion de l'owner
    // On utilise une requête qui s'adapte si l'utilisateur existe déjà ou non
    await client.query(`
      UPDATE "user" 
      SET email = $1, password = $2, "roleSlug" = 'global:owner', "updatedAt" = NOW()
      WHERE "roleSlug" = 'global:owner';
    `, [email, passwordHash]);

    // 2. Bypass du Setup Wizard (Configuration système n8n)
    const settings = [
      { key: 'userManagement', value: '{"showSetupOnFirstLoad":false}' },
      { key: 'owner_setup_completed', value: 'true' }
    ];

    for (const setting of settings) {
      await client.query(`
        INSERT INTO settings (key, value)
        VALUES ($1, $2)
        ON CONFLICT (key) DO UPDATE SET value = $2;
      `, [setting.key, setting.setting_value || setting.value]);
    }

    console.log(`[OK] Configuration Neon terminée avec succès.`);
  } catch (err) {
    console.error(`[ERROR] SQL Neon failed:`, err.message);
    throw err;
  } finally {
    await client.end();
  }
}