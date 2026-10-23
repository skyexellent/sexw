'use strict';
const crypto = require('crypto');

/* ---------- телефоны ---------- */
function normalizePhone(input) {
  let d = String(input || '').replace(/\D/g, '');
  if (d.startsWith('8') && d.length === 11) d = '7' + d.slice(1);
  if (d.length === 10) d = '7' + d; // без кода страны
  return d; // '7XXXXXXXXXX' или ''
}
function isValidPhone(input) {
  return normalizePhone(input).length === 11 && normalizePhone(input).startsWith('7');
}
function formatPhone(input) {
  const d = normalizePhone(input);
  if (d.length !== 11) return '+' + d;
  return `+7 (${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7, 9)}-${d.slice(9, 11)}`;
}

/* ---------- email ---------- */
function normalizeEmail(input) {
  return String(input || '').trim().toLowerCase();
}
function isValidEmail(input) {
  const e = normalizeEmail(input);
  return e.length >= 6 && e.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
}

/* ---------- карта / счёт ---------- */
function normalizeCard(input) {
  return String(input || '').replace(/[^\dA-Za-zА-Яа-я]/g, '');
}
function maskCard(card) {
  const c = String(card || '');
  if (c.length < 8) return c;
  return `${c.slice(0, 4)} •••• •••• ${c.slice(-4)}`;
}
function formatCard(card) {
  const clean = String(card || '').replace(/\D/g, '');
  const out = [];
  for (let i = 0; i < clean.length; i += 4) out.push(clean.slice(i, i + 4));
  return out.join(' ');
}

/* ---------- токены и коды ---------- */
function randomToken(bytes) {
  return crypto.randomBytes(bytes || 32).toString('hex');
}
function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}
function makeCode() {
  return String(1000 + crypto.randomInt(0, 9000));
}
function safeEqual(a, b) {
  const ha = sha256(a);
  const hb = sha256(b);
  return ha.length === hb.length && crypto.timingSafeEqual(Buffer.from(ha), Buffer.from(hb));
}

/* ---------- прочее ---------- */
function isRole(v) {
  return v === 'client' || v === 'carrier' || v === 'workshop';
}
function uid(prefix) {
  return `${prefix}_${Date.now().toString(36)}${crypto.randomBytes(4).toString('hex')}`;
}
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

module.exports = {
  normalizePhone, isValidPhone, formatPhone,
  normalizeEmail, isValidEmail,
  normalizeCard, maskCard, formatCard,
  randomToken, sha256, makeCode, safeEqual,
  isRole, uid, clamp
};
