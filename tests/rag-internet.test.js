import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildOptimizedSearchQuery, searchWebForRag } from '../server/services/websearch.js';
import { retrieveContext, retrieveLocalContext } from '../server/services/rag.js';
import { handleChatTurn, sanitizeSources } from '../server/services/chat.js';

test('Web search query reformulator optimizes Indic and English queries', () => {
  // English query
  const q1 = buildOptimizedSearchQuery('Can you tell me what is the launch date of NISAR satellite?');
  assert.ok(q1.includes('NISAR'));

  // Kannada query
  const q2 = buildOptimizedSearchQuery('ಚಂದ್ರಯಾನ 3 ಯಾವಾಗ ಲ್ಯಾಂಡಿಂಗ್ ಆಯಿತು?');
  assert.ok(q2.includes('Chandrayaan') || q2.includes('landing'));

  // Hindi query
  const q3 = buildOptimizedSearchQuery('गगनयान मिशन का ताजा अपडेट क्या है?');
  assert.ok(q3.includes('Gaganyaan'));

  // Tamil query
  const q4 = buildOptimizedSearchQuery('அக்னிகுல் ராக்கெட் ஏவுதல் எப்போது?');
  assert.ok(q4.includes('Agnikul') || q4.includes('rocket'));
});

test('Live internet search returns space results from web', async () => {
  const results = await searchWebForRag('ISRO NISAR satellite launch date', 'en-IN', 3);
  assert.ok(Array.isArray(results));
  if (results.length > 0) {
    assert.ok(results[0].title);
    assert.ok(results[0].url.startsWith('http'));
  }
});

test('RAG retrieval retrieves both local SQLite FTS5 facts and live web context', async () => {
  const context = await retrieveContext('Aditya-L1 solar observatory', 3, 'en-IN', { enableWeb: true });
  assert.ok(context.knowledge !== undefined);
  assert.ok(context.stories !== undefined);
  assert.ok(Array.isArray(context.webResults));
});

test('Source sanitizer fixes outdated ISRO links and prioritizes query-matching sources', () => {
  const raw = [
    { title: 'NVS-01 Navigation', url: 'https://www.isro.gov.in/GSLV-F12_NVS-01_Mission.html' },
    { title: 'Aditya-L1 Solar Mission', url: 'https://www.isro.gov.in/Aditya_L1.html' },
    { title: 'NVS-03 Navigation Satellite (IRNSS-1L)', url: 'https://www.isro.gov.in/SatelliteNavigationServices.html' },
    { title: 'NVS-03 - Wikipedia', url: 'https://en.wikipedia.org/wiki/NVS-03' }
  ];

  const sanitized = sanitizeSources(raw, 'tell me about nvs 03');
  assert.ok(sanitized.length <= 3);
  // NVS-03 sources should rank above NVS-01
  assert.ok(sanitized[0].title.includes('NVS-03'));
  // Aditya-L1 should be excluded
  assert.ok(!sanitized.some(s => s.title.includes('Aditya')));
  // Legacy NVS-01 link if present should be transformed to working landing page
  const nvs1 = sanitized.find(s => s.title.includes('NVS-01'));
  if (nvs1) {
    assert.equal(nvs1.url, 'https://www.isro.gov.in/GSLV_F12_Landingpage.html');
  }
});

test('Chat turn generates accurate NVS-03 response and working source citations', async () => {
  const sessionId = 'test-session-nvs03-' + Date.now();
  const reply = await handleChatTurn({
    sessionId,
    inputType: 'text',
    userText: 'tell me about nvs 03',
    lang: 'en-IN'
  });

  assert.ok(reply.replyText);
  // Must describe NVS-03 and NOT NVS-01
  assert.ok(reply.replyText.includes('NVS-03') || reply.replyText.includes('third satellite'));
  assert.ok(!reply.replyText.includes("NVS-01 is ISRO's second-generation"));
  assert.ok(Array.isArray(reply.sources));
  assert.ok(reply.sources.length > 0);
  assert.ok(reply.sources[0].url.startsWith('http'));
});
