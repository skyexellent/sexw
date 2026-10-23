'use strict';
/*
 * КУРОВОЗ — локальный сервер для разработки и тестов.
 * Логика API общая с боевым Vercel-окружением (lib/handler.js).
 * Хранилище: JSON-файл (по умолчанию) или Postgres, если задан POSTGRES_URL.
 */
require('./lib/env').load();

const http = require('http');
const fs = require('fs');
const path = require('path');
const store = require('./lib/store');
const { apiHandler } = require('./lib/handler');
const sms = require('./lib/sms');
const email = require('./lib/email');

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
const INDEX_FILE = path.join(__dirname, 'index.html');

const server = http.createServer(async (req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch (e) {
    res.writeHead(400); res.end('Bad Request');
    return;
  }
  try {
    if (pathname.startsWith('/api/')) {
      await store.withRequest(() => apiHandler(req, res));
      return;
    }
    if (pathname === '/' || pathname === '/index.html') {
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store'
      });
      fs.createReadStream(INDEX_FILE).pipe(res);
      return;
    }
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Не найдено');
  } catch (err) {
    console.error('[server]', err);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'Внутренняя ошибка сервера' }));
    }
  }
});

server.listen(PORT, HOST, () => {
  const pgMode = !!(process.env.POSTGRES_URL || process.env.DATABASE_URL);
  console.log('');
  console.log('  КУРОВОЗ запущен (локальный режим)');
  console.log(`  → http://localhost:${PORT}`);
  console.log('');
  console.log(`  Хранилище: ${pgMode ? 'Postgres' : 'JSON-файл (data/db.json)'}`);
  console.log(`  SMS:  ${sms.enabled() ? (sms.isConsole() ? 'консольный режим (коды в логе)' : 'sms.ru') : 'НЕ НАСТРОЕН'}`);
  console.log(`  Почта: ${email.enabled() ? (email.isConsole() ? 'консольный режим (коды в логе)' : 'SMTP') : 'не настроена'}`);
  if (process.env.SMS_RU_TEST === '1') console.log('  ВНИМАНИЕ: SMS_RU_TEST=1 — sms.ru не отправляет сообщения по-настоящему');
  console.log('');
});
