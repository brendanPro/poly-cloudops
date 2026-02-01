import { insertUserSql } from './steps/insertUserSql.js'; 

async function run() {
  console.log('STARTING BOOTSTRAP (PURE SQL MODE)');
  console.log('\nBOOTSTRAP COMPLETE');
}
run().catch(err => {
  console.error('\nBOOTSTRAP FAILED:', err.message);
  process.exit(1);
});