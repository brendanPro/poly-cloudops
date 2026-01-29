// bootstrap/bootstrap.js
import { context } from './context.js';
import { insertUserSql } from './steps/insertUserSql.js'; 

async function run() {
  console.log('🚀 STARTING BOOTSTRAP (PURE SQL MODE)');

  // 1. Création utilisateur + Bypass Setup
  await insertUserSql();

  // .... suites des étapes à implémenter

  console.log('\n✅ BOOTSTRAP COMPLETE');
}

run().catch(err => {
  console.error('\n❌ BOOTSTRAP FAILED:', err.message);
  process.exit(1);
});