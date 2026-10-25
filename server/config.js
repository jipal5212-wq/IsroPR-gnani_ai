import path from 'node:path';
import fs from 'node:fs';
import dotenv from 'dotenv';

dotenv.config();

export const ENV = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATA_DIR: path.resolve(process.cwd(), process.env.DATA_DIR || './data'),
  PUBLIC_BASE_URL: process.env.PUBLIC_BASE_URL || 'http://localhost:3000',

  GNANI_API_KEY: process.env.GNANI_API_KEY || process.env.GNANI_KEY || '',
  GNANI_BASE_URL: process.env.GNANI_BASE_URL || 'https://api.vachana.ai',

  LLM_PROVIDER: process.env.LLM_PROVIDER || 'openai-compatible',
  LLM_API_KEY: process.env.LLM_API_KEY || process.env.OPENAI_API_KEY || '',
  LLM_MODEL: process.env.LLM_MODEL || 'gpt-4o-mini',
  LLM_BASE_URL: process.env.LLM_BASE_URL || 'https://api.openai.com/v1',

  JWT_SECRET: process.env.JWT_SECRET || 'space-bharat-default-secret-change-in-production',
  ADMIN_SESSION_HOURS: parseInt(process.env.ADMIN_SESSION_HOURS || '8', 10),

  CHAT_MAX_AUDIO_SEC: parseInt(process.env.CHAT_MAX_AUDIO_SEC || '30', 10),
  CHAT_RETENTION_DAYS: parseInt(process.env.CHAT_RETENTION_DAYS || '30', 10),
  FFMPEG_PATH: process.env.FFMPEG_PATH || 'ffmpeg',
};

// Ensure data directories exist
export const DIRS = {
  DATA: ENV.DATA_DIR,
  DB_FILE: path.join(ENV.DATA_DIR, 'spacebharat.db'),
  AUDIO: path.join(ENV.DATA_DIR, 'audio'),
  AUDIO_STORIES: path.join(ENV.DATA_DIR, 'audio', 'stories'),
  AUDIO_CHAT: path.join(ENV.DATA_DIR, 'audio', 'chat'),
  UPLOADS: path.join(ENV.DATA_DIR, 'uploads'),
  COVERS: path.join(ENV.DATA_DIR, 'covers')
};

for (const dir of Object.values(DIRS)) {
  if (dir !== DIRS.DB_FILE && !fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Master Language Definitions (All Gnani-supported Indian languages enabled)
export const ALL_LANGUAGES = [
  { code: 'en-IN', name: 'English', nativeName: 'English', defaultVoice: 'Shivani', chatInput: true, listening: true },
  { code: 'hi-IN', name: 'Hindi', nativeName: 'हिन्दी', defaultVoice: 'Shivani', chatInput: true, listening: true },
  { code: 'ta-IN', name: 'Tamil', nativeName: 'தமிழ்', defaultVoice: 'Shivani', chatInput: true, listening: true },
  { code: 'te-IN', name: 'Telugu', nativeName: 'తెలుగు', defaultVoice: 'Shivani', chatInput: true, listening: true },
  { code: 'bn-IN', name: 'Bengali', nativeName: 'বাংলা', defaultVoice: 'Shivani', chatInput: true, listening: true },
  { code: 'kn-IN', name: 'Kannada', nativeName: 'ಕನ್ನಡ', defaultVoice: 'Shivani', chatInput: true, listening: true },
  { code: 'ml-IN', name: 'Malayalam', nativeName: 'മലയാളം', defaultVoice: 'Shivani', chatInput: true, listening: true },
  { code: 'mr-IN', name: 'Marathi', nativeName: 'मराठी', defaultVoice: 'Shivani', chatInput: true, listening: true },
  { code: 'gu-IN', name: 'Gujarati', nativeName: 'ગુજરાતી', defaultVoice: 'Shivani', chatInput: true, listening: true },
  { code: 'pa-IN', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', defaultVoice: 'Shivani', chatInput: true, listening: true },
  { code: 'hi-en', name: 'Hinglish', nativeName: 'Hinglish', defaultVoice: 'Shivani', chatInput: true, listening: true }
];

export const CATEGORIES = [
  { id: 'isro', name: 'ISRO Missions', description: 'Active & upcoming missions led by ISRO' },
  { id: 'startup', name: 'Space Startups', description: 'Indian commercial space ecosystem' },
  { id: 'legacy', name: 'ISRO Legacy', description: 'Historic milestones and pioneers' },
  { id: 'explainer', name: 'Explainers', description: 'Demystifying rocket science & orbital mechanics' }
];
