'use strict';
/* Геокодирование адресов через OpenStreetMap Nominatim (бесплатно, без ключа).
   Требования Nominatim: свой User-Agent и не более 1 запроса в секунду — соблюдаем оба. */

const store = require('./store');

let queue = Promise.resolve();
let lastCall = 0;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function geocode(address) {
  const q = String(address || '').trim();
  if (q.length < 5) return null;

  const db = store.get();
  if (db.geoCache[q]) return db.geoCache[q];

  // последовательный вызов с паузой ≥1 c
  queue = queue.then(async () => {
    const wait = 1100 - (Date.now() - lastCall);
    if (wait > 0) await sleep(wait);
    lastCall = Date.now();
  });
  await queue;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const url = 'https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=ru&q=' + encodeURIComponent(q);
    const res = await fetch(url, {
      headers: { 'User-Agent': 'KurovozLogistics/1.0 (dispatch app)' },
      signal: ctrl.signal
    });
    const data = await res.json();
    const hit = Array.isArray(data) && data[0];
    const result = hit ? { lat: Number(hit.lat), lng: Number(hit.lon) } : null;
    db.geoCache[q] = result;
    store.save();
    return result;
  } catch (err) {
    console.error('[geo]', q, err.message);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function haversineKm(a, b) {
  if (!a || !b) return null;
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const la1 = a.lat * Math.PI / 180, la2 = b.lat * Math.PI / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

module.exports = { geocode, haversineKm };
