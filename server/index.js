import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ENV, DIRS } from './config.js';
import { getDb, getSetting } from './db/db.js';
import adminRoutes from './routes/admin.js';
import publicRoutes from './routes/public.js';
import chatRoutes from './routes/chat.js';
import { startJobWorker } from './services/jobs.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webDir = path.resolve(__dirname, '../web');

const app = express();

// Security Headers with Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'blob:'],
      mediaSrc: ["'self'", 'blob:'],
      connectSrc: ["'self'"],
    }
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Parsers
app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Media File Serving (Audio and Covers)
app.use('/media/audio', express.static(DIRS.AUDIO, {
  maxAge: '30d',
  immutable: true
}));

app.use('/media/covers', express.static(DIRS.COVERS, {
  maxAge: '7d'
}));

// API Routes
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api', publicRoutes);

// Static Web Frontend
app.use(express.static(webDir));

// Fallback for SPA/HTML routes if needed
app.get('/story/:id', (req, res) => {
  res.sendFile(path.join(webDir, 'story.html'));
});

// Periodic Daily Cleanup (Section 5.2: Retention)
function runRetentionCleanup() {
  try {
    const db = getDb();
    const retentionDays = getSetting('chat_retention_days', 30);
    const result = db.prepare(`
      DELETE FROM chat_sessions 
      WHERE last_seen_at < datetime('now', '-' || ? || ' days')
    `).run(retentionDays);
    if (result.changes > 0) {
      console.log(`🧹 Cleaned up ${result.changes} expired chat sessions (> ${retentionDays} days)`);
    }
  } catch (err) {
    console.error('Retention cleanup error:', err);
  }
}

// Run cleanup once every 24 hours
const cleanupInterval = setInterval(runRetentionCleanup, 24 * 60 * 60 * 1000);
if (cleanupInterval.unref) {
  cleanupInterval.unref();
}
runRetentionCleanup();

// Start background audio job worker
startJobWorker();

// Only listen if executed directly
const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isDirectRun) {
  app.listen(ENV.PORT, () => {
    console.log(`
🛰️  ======================================================
    IsroPR — Official ISRO PR & Outreach Platform
    Server running on: ${ENV.PUBLIC_BASE_URL} (Port ${ENV.PORT})
    Environment: ${ENV.NODE_ENV}
======================================================`);
  });
}

export default app;
