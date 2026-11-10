import { getDb } from '../server/db/db.js';

const db = getDb();
db.prepare('UPDATE stories SET play_count = 0').run();
db.prepare('UPDATE settings SET value = ? WHERE key = ?').run('1', 'total_site_visits');

console.log('✅ Real Stories Play Count:');
console.log(db.prepare('SELECT id, title, play_count FROM stories').all());

console.log('✅ Real Visits:');
console.log(db.prepare('SELECT key, value FROM settings WHERE key = ?').get('total_site_visits'));

