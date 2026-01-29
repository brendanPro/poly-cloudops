import pkg from 'pg';
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
    console.log(`[SQL] Mise à jour de l'utilisateur initial et bypass du setup...`);

    // 1. UPDATE de l'utilisateur créé par défaut par n8n
    // n8n crée un utilisateur avec un ID aléatoire et un email vide au boot.
    // On lui donne vos accès (email + password haché) et on s'assure qu'il est Owner.
    const updateOwnerSql = `
      UPDATE "user" 
      SET email = $1, 
          password = $2,
          "roleSlug" = 'global:owner',
          "updatedAt" = NOW()
      WHERE "roleSlug" = 'global:owner' OR email IS NULL OR email = '';
    `;
    
    // Hash correspondant à votre mot de passe admin
    const passwordHash = '$2a$10$MvKxTl.hglqxomQeI5cQROiMUlKACxVkOuf1QkNaYlZ9GOvs9n4mu';
    
    await client.query(updateOwnerSql, [
      process.env.N8N_ADMIN_EMAIL, 
      passwordHash
    ]);

    // 2. Désactivation de l'écran de setup dans 'settings'
    // On injecte les deux clés pour être certain que n8n ne redirige pas vers /setup
    
    // Désactive l'objet de gestion utilisateur
    const settingsUserMgmt = `
      INSERT INTO settings (key, value)
      VALUES ('userManagement', '{"showSetupOnFirstLoad":false}')
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
    `;
    await client.query(settingsUserMgmt);

    // Marque explicitement le setup comme complété
    const settingsSetupDone = `
      INSERT INTO settings (key, value)
      VALUES ('owner_setup_completed', 'true')
      ON CONFLICT (key) DO UPDATE SET value = 'true';
    `;
    await client.query(settingsSetupDone);

    console.log(`[OK] SQL: L'utilisateur existant est configuré et le setup est forcé à 'false'.`);
  } catch (err) {
    console.error(`[ERROR] SQL failed:`, err.message);
    throw err;
  } finally {
    await client.end();
  }
}