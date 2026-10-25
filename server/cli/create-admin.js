import bcrypt from 'bcryptjs';
import readline from 'node:readline';
import { getDb } from '../db/db.js';

function parseArgs() {
  const args = process.argv.slice(2);
  const result = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--email' && args[i + 1]) {
      result.email = args[i + 1];
      i++;
    } else if (args[i] === '--password' && args[i + 1]) {
      result.password = args[i + 1];
      i++;
    }
  }
  return result;
}

function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log('🚀 IsroPR — Create Admin Account');
  console.log('--------------------------------------');

  const args = parseArgs();
  let email = args.email;
  let password = args.password;

  if (!email) {
    email = await prompt('Enter Admin Email: ');
  }

  if (!email || !email.includes('@')) {
    console.error('❌ Error: A valid email address is required.');
    process.exit(1);
  }

  if (!password) {
    password = await prompt('Enter Admin Password: ');
  }

  if (!password || password.length < 6) {
    console.error('❌ Error: Password must be at least 6 characters long.');
    process.exit(1);
  }

  const db = getDb();

  // Check if admin already exists
  const existing = db.prepare('SELECT id, email FROM admins WHERE email = ?').get(email);
  if (existing) {
    console.log(`⚠️  Admin with email ${email} already exists. Updating password...`);
    const passwordHash = await bcrypt.hash(password, 12);
    db.prepare('UPDATE admins SET password_hash = ? WHERE id = ?').run(passwordHash, existing.id);
    console.log(`✅ Admin password updated successfully for ${email}!`);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const insert = db.prepare('INSERT INTO admins (email, password_hash) VALUES (?, ?)');
  const info = insert.run(email, passwordHash);

  // Log in admin_log
  db.prepare('INSERT INTO admin_log (admin_email, action, target) VALUES (?, ?, ?)')
    .run(email, 'admin_created', `Admin ID ${info.lastInsertRowid}`);

  console.log(`✅ Admin account created successfully!`);
  console.log(`   ID: ${info.lastInsertRowid}`);
  console.log(`   Email: ${email}`);
  console.log(`   Hash: bcrypt (cost 12)`);
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
