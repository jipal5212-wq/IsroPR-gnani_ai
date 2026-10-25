import jwt from 'jsonwebtoken';
import { ENV } from '../config.js';
import { getDb } from '../db/db.js';

export const ADMIN_COOKIE_NAME = 'space_admin_session';

export function requireAdmin(req, res, next) {
  const token = req.cookies?.[ADMIN_COOKIE_NAME] || 
                (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null);

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Admin authentication required' });
  }

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    const db = getDb();
    const admin = db.prepare('SELECT id, email, created_at FROM admins WHERE id = ?').get(decoded.id);

    if (!admin) {
      return res.status(401).json({ error: 'Unauthorized: Admin account no longer exists' });
    }

    req.admin = admin;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired session' });
  }
}

export function signAdminToken(admin) {
  return jwt.sign(
    { id: admin.id, email: admin.email },
    ENV.JWT_SECRET,
    { expiresIn: `${ENV.ADMIN_SESSION_HOURS}h` }
  );
}
