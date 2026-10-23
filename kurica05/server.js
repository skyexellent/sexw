'use strict';
/*
 * Диспетчер хранилища:
 *  — задан POSTGRES_URL (или DATABASE_URL) → Postgres (боевой режим, Vercel);
 *  — иначе → JSON-файл в DATA_DIR (локальная разработка и тесты).
 */
require('./env').load();

if (process.env.POSTGRES_URL || process.env.DATABASE_URL) {
  module.exports = require('./store-pg');
} else {
  module.exports = require('./store-json');
}
