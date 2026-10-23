'use strict';
/*
 * КУРОВОЗ — общий обработчик API.
 * Используется и локальным сервером (server.js), и Vercel-функцией (api/[[...path]].js).
 * Все запросы выполняются внутри store.withRequest() — для Postgres это транзакция
 * с сериализацией, для JSON-режима — просто вызов.
 */
require('./env').load();

const store = require('./store');
const sms = require('./sms');
const email = require('./email');
const geo = require('./geo');
const U = require('./util');

const SESSION_COOKIE = 'kurovoz_session';
const SESSION_TTL = Number(process.env.SESSION_TTL_DAYS || 30) * 24 * 3600 * 1000;
const CODE_TTL = Number(process.env.SMS_CODE_TTL || 300) * 1000;
const CODE_MAX_ATTEMPTS = 5;
const NODE_NAME = process.env.NODE_NAME || 'КУРОВОЗ';

/* ============================================================
   ВСПОМОГАТЕЛЬНОЕ
   ============================================================ */
function json(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(body);
}
function fail(res, status, error, extra) {
  json(res, status, Object.assign({ error }, extra || {}));
}
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > 256 * 1024) {
        reject(new Error('too_large'));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => {
      if (!chunks.length) return resolve({});
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); }
      catch (e) { reject(new Error('bad_json')); }
    });
    req.on('error', reject);
  });
}
function parseCookies(req) {
  const out = {};
  const raw = req.headers.cookie || '';
  raw.split(';').forEach((p) => {
    const i = p.indexOf('=');
    if (i > 0) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
  });
  return out;
}
function setSessionCookie(res, token) {
  const maxAge = Math.floor(SESSION_TTL / 1000);
  res.setHeader('Set-Cookie',
    `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`);
}
function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}
function sessionTokenFrom(req) {
  const bearer = req.headers.authorization || '';
  if (bearer.startsWith('Bearer ')) return bearer.slice(7).trim();
  return parseCookies(req)[SESSION_COOKIE] || null;
}
function currentUser(req) {
  const token = sessionTokenFrom(req);
  if (!token) return null;
  const db = store.get();
  const hash = U.sha256(token);
  const sess = db.sessions.find((s) => s.tokenHash === hash && s.expiresAt > Date.now());
  if (!sess) return null;
  return db.users.find((u) => u.id === sess.userId) || null;
}
function publicUser(u) {
  if (!u) return null;
  return {
    id: u.id,
    name: u.name,
    phone: u.phone ? U.formatPhone(u.phone) : '',
    phoneRaw: u.phone || '',
    email: u.email || '',
    bank: u.bank || '',
    card: u.card || '',
    cardMasked: U.maskCard(u.card),
    recipient: u.recipient || '',
    role: u.role,
    address: u.address || ''
  };
}
function notify(userId, text, orderId) {
  if (!userId) return;
  const db = store.get();
  db.notifications.unshift({
    id: U.uid('n'),
    userId,
    text,
    orderId: orderId || null,
    ts: Date.now(),
    read: false
  });
  if (db.notifications.length > 500) db.notifications.length = 500;
  store.save();
}

/* ---------- лимиты на отправку кодов (защита баланса sms.ru) ---------- */
function codeRateOk(channel, target, ip) {
  const db = store.get();
  const now = Date.now();
  const perTarget = db.codes.filter((c) => c.channel === channel && c.target === target);
  const last = perTarget[perTarget.length - 1];
  if (last && now - last.sentAt < 60 * 1000) {
    return { ok: false, retryAfter: Math.ceil((60 * 1000 - (now - last.sentAt)) / 1000) };
  }
  const dayAgo = now - 24 * 3600 * 1000;
  if (perTarget.filter((c) => c.sentAt > dayAgo).length >= 5) {
    return { ok: false, retryAfter: 3600, daily: true };
  }
  const perIp = db.codes.filter((c) => c.ip === ip && c.sentAt > now - 3600 * 1000);
  if (perIp.length >= 20) {
    return { ok: false, retryAfter: 600, ip: true };
  }
  return { ok: true };
}

/* ============================================================
   ПРОЕКЦИЯ ЗАКАЗОВ
   ============================================================ */
function positionFor(orderId) {
  const db = store.get();
  return db.positions.find((p) => p.orderId === orderId) || null;
}
function etaMinutes(order) {
  const pos = positionFor(order.id);
  if (!pos) return null;
  if (order.state === 'done' || order.state === 'arrived') return 0;
  const target = (order.state === 'to_pickup')
    ? { lat: order.pickupLat, lng: order.pickupLng }
    : { lat: order.workshopLat, lng: order.workshopLng };
  if (!target.lat || !target.lng) return null;
  const km = geo.haversineKm({ lat: pos.lat, lng: pos.lng }, target);
  if (km == null) return null;
  const speedKmh = (pos.speed && pos.speed > 3 && pos.speed < 150) ? pos.speed : 40;
  return Math.max(1, Math.round(km / speedKmh * 60));
}
function orderView(order, viewer) {
  const db = store.get();
  const client = db.users.find((u) => u.id === order.clientId);
  const carrier = db.users.find((u) => u.id === order.carrierId);
  const workshop = db.users.find((u) => u.id === order.workshopId);
  const meRole = viewer.id === order.clientId ? 'client'
    : viewer.id === order.carrierId ? 'carrier'
    : viewer.id === order.workshopId ? 'workshop' : null;
  const pos = positionFor(order.id);
  return {
    id: order.id,
    qty: order.qty,
    pricePer: order.pricePer,
    total: order.qty * order.pricePer,
    pickup: order.pickup,
    pickupLat: order.pickupLat,
    pickupLng: order.pickupLng,
    workshopAddress: order.workshopAddress,
    workshopLat: order.workshopLat,
    workshopLng: order.workshopLng,
    state: order.state,
    workshopStatus: order.workshopStatus,
    comment: order.comment || '',
    createdAt: order.createdAt,
    acceptedAt: order.acceptedAt || null,
    deliveredAt: order.deliveredAt || null,
    client: publicUser(client),
    carrier: publicUser(carrier),
    workshop: publicUser(workshop),
    position: pos ? { lat: pos.lat, lng: pos.lng, ts: pos.ts } : null,
    etaMin: etaMinutes(order),
    myRole: meRole
  };
}
function ordersFor(user) {
  const db = store.get();
  return db.orders
    .filter((o) => o.clientId === user.id || o.carrierId === user.id ||
      (user.role === 'carrier' && o.state === 'awaiting_carrier' && o.workshopStatus !== 'declined' && !(o.skippedBy || []).includes(user.id)) ||
      o.workshopId === user.id)
    .sort((a, b) => b.createdAt - a.createdAt)
    .map((o) => orderView(o, user));
}

/* ============================================================
   РОУТЕР API
   ============================================================ */
async function handleApi(req, res, pathname, query) {
  const db = store.get();
  const method = req.method;
  const me = currentUser(req);

  /* ---------- meta ---------- */
  if (pathname === '/api/meta' && method === 'GET') {
    return json(res, 200, {
      appName: NODE_NAME,
      smsEnabled: sms.enabled(),
      smsConsole: sms.isConsole(),
      emailEnabled: email.enabled(),
      emailConsole: email.isConsole(),
      smsTest: process.env.SMS_RU_TEST === '1'
    });
  }

  /* ---------- отправка кода ---------- */
  if (pathname === '/api/auth/code' && method === 'POST') {
    let body;
    try { body = await parseBody(req); } catch (e) { return fail(res, 400, 'Некорректный запрос'); }
    const channel = body.channel === 'email' ? 'email' : 'sms';
    const ip = req.socket.remoteAddress || 'unknown';

    let target, ok;
    if (channel === 'sms') {
      if (!sms.enabled()) return fail(res, 400, 'SMS-канал не настроен (нет SMS_RU_API_KEY)');
      target = U.normalizePhone(body.phone);
      ok = U.isValidPhone(target);
      if (!ok) return fail(res, 400, 'Введите корректный номер: +7 и 10 цифр');
    } else {
      if (!email.enabled()) return fail(res, 400, 'Email-канал не настроен. Заполните SMTP_* в .env');
      target = U.normalizeEmail(body.email);
      ok = U.isValidEmail(target);
      if (!ok) return fail(res, 400, 'Введите корректный e-mail');
    }

    const rate = codeRateOk(channel, target, ip);
    if (!rate.ok) {
      const msg = rate.daily
        ? `Слишком много запросов кода на этот контакт за сутки. Повторите через ${Math.ceil(rate.retryAfter / 60)} мин`
        : rate.ip
          ? `Слишком много запросов с этого адреса. Повторите через ${Math.ceil(rate.retryAfter / 60)} мин`
          : `Код можно запросить повторно через ${rate.retryAfter} с`;
      return fail(res, 429, msg, { retryAfter: rate.retryAfter });
    }

    const code = U.makeCode();
    const text = `${NODE_NAME}: код подтверждения ${code}. Никому не сообщайте код.`;

    let sent;
    if (channel === 'sms') sent = await sms.sendSms(target, text);
    else sent = await email.sendMail(target, `Код подтверждения ${NODE_NAME}`, text);

    if (!sent.ok) return fail(res, 502, sent.error || 'Не удалось отправить код');

    db.codes.push({
      id: U.uid('c'),
      channel,
      target,
      hash: U.sha256(code),
      sentAt: Date.now(),
      expiresAt: Date.now() + CODE_TTL,
      attempts: 0,
      ip
    });
    // храним только последние 500 записей
    if (db.codes.length > 500) db.codes = db.codes.slice(-500);
    store.save();

    return json(res, 200, {
      ok: true,
      ttl: Math.floor(CODE_TTL / 1000),
      // devCode возвращается только в консольных режимах — для боевого sms.ru его нет
      devCode: sent.devCode || undefined
    });
  }

  /* ---------- проверка кода (+ регистрация) ---------- */
  if (pathname === '/api/auth/verify' && method === 'POST') {
    let body;
    try { body = await parseBody(req); } catch (e) { return fail(res, 400, 'Некорректный запрос'); }
    const channel = body.channel === 'email' ? 'email' : 'sms';
    const target = channel === 'sms' ? U.normalizePhone(body.phone) : U.normalizeEmail(body.email);
    const code = String(body.code || '').replace(/\D/g, '');

    const rec = [...db.codes].reverse().find((c) =>
      c.channel === channel && c.target === target && c.expiresAt > Date.now());
    if (!rec) return fail(res, 400, 'Код истёк или не запрашивался. Запросите новый');
    if (rec.attempts >= CODE_MAX_ATTEMPTS) return fail(res, 400, 'Слишком много попыток. Запросите новый код');
    rec.attempts += 1;
    store.save();
    if (U.sha256(code) !== rec.hash) {
      return fail(res, 400, 'Неверный код', { attemptsLeft: CODE_MAX_ATTEMPTS - rec.attempts });
    }

    let user = db.users.find((u) => (channel === 'sms' ? u.phone === target : u.email === target));
    const isNew = !user;

    if (isNew) {
      const p = body.profile || {};
      const name = String(p.name || '').trim();
      const bank = String(p.bank || '').trim();
      const card = U.normalizeCard(p.card);
      const recipient = String(p.recipient || '').trim();
      const role = p.role;
      const address = String(p.address || '').trim();
      // профиль ещё не заполнен — код НЕ сжигаем, просим заполнить и повторить запрос
      if (!name && !bank && !card && !role) {
        return json(res, 422, { error: 'Заполните профиль', needProfile: true });
      }
      if (!name || name.length < 2) return fail(res, 422, 'Укажите имя', { needProfile: true });
      if (!bank) return fail(res, 422, 'Укажите банк', { needProfile: true });
      if (card.length < 8) return fail(res, 422, 'Укажите номер карты или счёта', { needProfile: true });
      if (!recipient) return fail(res, 422, 'Укажите получателя платежа', { needProfile: true });
      if (!U.isRole(role)) return fail(res, 422, 'Выберите роль', { needProfile: true });
      if (role === 'workshop' && !address) return fail(res, 422, 'Для цеха укажите адрес', { needProfile: true });

      user = {
        id: U.uid('u'),
        name,
        bank,
        card,
        recipient,
        role,
        address,
        phone: channel === 'sms' ? target : '',
        email: channel === 'email' ? target : '',
        createdAt: Date.now()
      };
      db.users.push(user);
    }

    // код использован успешно — удаляем
    db.codes = db.codes.filter((c) => c.id !== rec.id);

    const token = U.randomToken(32);
    db.sessions.push({
      tokenHash: U.sha256(token),
      userId: user.id,
      createdAt: Date.now(),
      expiresAt: Date.now() + SESSION_TTL
    });
    if (db.sessions.length > 2000) db.sessions = db.sessions.slice(-2000);
    store.save();
    setSessionCookie(res, token);

    return json(res, 200, { ok: true, isNew, user: publicUser(user), token });
  }

  /* ---------- выход ---------- */
  if (pathname === '/api/auth/logout' && method === 'POST') {
    const token = sessionTokenFrom(req);
    if (token) {
      db.sessions = db.sessions.filter((s) => s.tokenHash !== U.sha256(token));
      store.save();
    }
    clearSessionCookie(res);
    return json(res, 200, { ok: true });
  }

  /* ---------- профиль ---------- */
  if (pathname === '/api/me' && method === 'GET') {
    if (!me) return fail(res, 401, 'Не авторизован');
    return json(res, 200, { user: publicUser(me) });
  }
  if (pathname === '/api/me' && method === 'PUT') {
    if (!me) return fail(res, 401, 'Не авторизован');
    let body;
    try { body = await parseBody(req); } catch (e) { return fail(res, 400, 'Некорректный запрос'); }
    const name = String(body.name != null ? body.name : me.name).trim();
    const bank = String(body.bank != null ? body.bank : me.bank).trim();
    const card = U.normalizeCard(body.card != null ? body.card : me.card);
    const recipient = String(body.recipient != null ? body.recipient : me.recipient).trim();
    const address = String(body.address != null ? body.address : me.address || '').trim();
    const role = body.role != null ? body.role : me.role;
    if (name.length < 2) return fail(res, 422, 'Укажите имя');
    if (!bank) return fail(res, 422, 'Укажите банк');
    if (card.length < 8) return fail(res, 422, 'Укажите номер карты или счёта');
    if (!recipient) return fail(res, 422, 'Укажите получателя платежа');
    if (!U.isRole(role)) return fail(res, 422, 'Некорректная роль');
    if (role === 'workshop' && !address) return fail(res, 422, 'Для цеха нужен адрес');
    Object.assign(me, { name, bank, card, recipient, address, role });
    if (body.email !== undefined && U.isValidEmail(body.email)) me.email = U.normalizeEmail(body.email);
    if (body.phone !== undefined && U.isValidPhone(body.phone)) me.phone = U.normalizePhone(body.phone);
    store.save();
    return json(res, 200, { ok: true, user: publicUser(me) });
  }

  /* ---------- цеха для выбора в заказе ---------- */
  if (pathname === '/api/workshops' && method === 'GET') {
    const list = db.users
      .filter((u) => u.role === 'workshop')
      .map((u) => ({ id: u.id, name: u.name, address: u.address || '', phone: U.formatPhone(u.phone || ''), email: u.email || '' }));
    return json(res, 200, { workshops: list });
  }

  /* ---------- заказы ---------- */
  if (pathname === '/api/orders' && method === 'GET') {
    if (!me) return fail(res, 401, 'Не авторизован');
    return json(res, 200, { orders: ordersFor(me) });
  }

  if (pathname === '/api/orders' && method === 'POST') {
    if (!me) return fail(res, 401, 'Не авторизован');
    if (me.role !== 'client') return fail(res, 403, 'Заказы создают клиенты');
    let body;
    try { body = await parseBody(req); } catch (e) { return fail(res, 400, 'Некорректный запрос'); }

    const qty = Math.floor(Number(body.qty));
    const pricePer = Math.floor(Number(body.pricePer));
    const pickup = String(body.pickup || '').trim();
    const comment = String(body.comment || '').trim().slice(0, 500);
    if (!qty || qty < 1 || qty > 100000) return fail(res, 422, 'Укажите количество куриц');
    if (!pricePer || pricePer < 1 || pricePer > 100000) return fail(res, 422, 'Укажите цену за 1 курицу');
    if (pickup.length < 5) return fail(res, 422, 'Укажите адрес получения');

    const workshop = db.users.find((u) => u.id === body.workshopId && u.role === 'workshop');
    const workshopAddress = workshop ? (workshop.address || '') : String(body.workshopAddress || '').trim();
    if (!workshop && workshopAddress.length < 5) {
      return fail(res, 422, 'Выберите цех или укажите адрес чистки');
    }

    // геокодирование адресов (не блокируем заказ, если геокодер недоступен)
    let pickupGeo = null;
    if (body.pickupLat && body.pickupLng) {
      pickupGeo = { lat: Number(body.pickupLat), lng: Number(body.pickupLng) };
    } else {
      pickupGeo = await geo.geocode(pickup);
    }
    let workshopGeo = null;
    if (workshop && workshop.address) {
      workshopGeo = await geo.geocode(workshop.address);
    } else if (workshopAddress) {
      workshopGeo = await geo.geocode(workshopAddress);
    }

    const order = {
      id: 'A-' + (1000 + db.orders.length + 1 + Math.floor(Math.random() * 900)),
      qty,
      pricePer,
      pickup,
      pickupLat: pickupGeo ? pickupGeo.lat : null,
      pickupLng: pickupGeo ? pickupGeo.lng : null,
      workshopId: workshop ? workshop.id : null,
      workshopAddress: workshopAddress || (workshop ? workshop.address : ''),
      workshopLat: workshopGeo ? workshopGeo.lat : null,
      workshopLng: workshopGeo ? workshopGeo.lng : null,
      clientId: me.id,
      carrierId: null,
      state: 'awaiting_carrier',
      workshopStatus: 'pending',
      comment,
      createdAt: Date.now(),
      acceptedAt: null,
      deliveredAt: null,
      skippedBy: []
    };
    db.orders.push(order);
    store.save();

    // уведомления реальным людям
    db.users.filter((u) => u.role === 'carrier').forEach((u) => {
      notify(u.id, `Новый заказ ${order.id}: ${order.qty} ${chickenWord(order.qty)}, ${pricePer} ₽ за курицу, итого ${order.qty * pricePer} ₽.`, order.id);
    });
    if (workshop) {
      notify(workshop.id, `Заказ ${order.id}: клиент ${me.name} ожидает ${order.qty} ${chickenWord(order.qty)}. Погрузка: ${pickup}.`, order.id);
    }

    return json(res, 200, { ok: true, order: orderView(order, me) });
  }

  /* ---------- действия по заказу ---------- */
  const m = pathname.match(/^\/api\/orders\/([A-Za-z0-9-]+)\/(accept|decline|status|workshop|position|messages|cancel)$/);
  if (m) {
    if (!me) return fail(res, 401, 'Не авторизован');
    const order = db.orders.find((o) => o.id === m[1]);
    if (!order) return fail(res, 404, 'Заказ не найден');
    const action = m[2];

    if (action === 'accept' && method === 'POST') {
      if (me.role !== 'carrier') return fail(res, 403, 'Заказы принимают перевозчики');
      if (order.state !== 'awaiting_carrier') return fail(res, 409, 'Заказ уже занят другим перевозчиком');
      if ((order.skippedBy || []).includes(me.id)) return fail(res, 409, 'Вы уже пропустили этот заказ');
      order.carrierId = me.id;
      order.state = 'to_pickup';
      order.acceptedAt = Date.now();
      store.save();
      notify(order.clientId, `Перевозчик ${me.name} (${U.formatPhone(me.phone)}) принял заказ ${order.id}.`, order.id);
      if (order.workshopId) notify(order.workshopId, `Заказ ${order.id} принят перевозчиком ${me.name} (${U.formatPhone(me.phone)}).`, order.id);
      store.save();
      return json(res, 200, { ok: true, order: orderView(order, me) });
    }

    if (action === 'decline' && method === 'POST') {
      if (me.role !== 'carrier') return fail(res, 403, 'Доступно только перевозчикам');
      if (order.state !== 'awaiting_carrier') return fail(res, 409, 'Заказ уже в работе');
      order.skippedBy = order.skippedBy || [];
      if (!order.skippedBy.includes(me.id)) order.skippedBy.push(me.id);
      store.save();
      return json(res, 200, { ok: true });
    }

    if (action === 'status' && method === 'POST') {
      if (me.id !== order.carrierId) return fail(res, 403, 'Статус меняет перевозчик этого заказа');
      let body;
      try { body = await parseBody(req); } catch (e) { return fail(res, 400, 'Некорректный запрос'); }
      const next = String(body.state || '');
      const allowed = ['to_pickup', 'in_transit', 'arrived'];
      if (!allowed.includes(next)) return fail(res, 422, 'Некорректный статус');
      order.state = next;
      store.save();
      const label = next === 'to_pickup' ? 'едет на погрузку'
        : next === 'in_transit' ? `загрузился и везёт ${order.qty} ${chickenWord(order.qty)} в цех`
          : 'прибыл в цех';
      notify(order.clientId, `Заказ ${order.id}: перевозчик ${label}.`, order.id);
      if (order.workshopId) notify(order.workshopId, `Заказ ${order.id}: перевозчик ${label}.`, order.id);
      store.save();
      return json(res, 200, { ok: true, order: orderView(order, me) });
    }

    if (action === 'workshop' && method === 'POST') {
      if (me.id !== order.workshopId && !(me.role === 'workshop' && !order.workshopId)) {
        return fail(res, 403, 'Решение принимает цех этого заказа');
      }
      let body;
      try { body = await parseBody(req); } catch (e) { return fail(res, 400, 'Некорректный запрос'); }
      if (body.decision !== 'accept' && body.decision !== 'decline') return fail(res, 422, 'Некорректное решение');
      if (body.decision === 'accept') {
        order.workshopId = me.id;
        order.workshopStatus = 'accepted';
        if (order.state === 'arrived') {
          order.state = 'done';
          order.deliveredAt = Date.now();
        }
      } else {
        order.workshopStatus = 'declined';
      }
      store.save();
      const txt = body.decision === 'accept'
        ? `Цех принял заказ ${order.id}: ${order.qty} ${chickenWord(order.qty)}.`
        : `Цех отклонил заказ ${order.id}. Свяжитесь с цехом для согласования.`;
      notify(order.clientId, txt, order.id);
      if (order.carrierId) notify(order.carrierId, txt, order.id);
      store.save();
      return json(res, 200, { ok: true, order: orderView(order, me) });
    }

    if (action === 'cancel' && method === 'POST') {
      if (me.id !== order.clientId) return fail(res, 403, 'Отменить заказ может только клиент');
      if (order.state === 'done') return fail(res, 409, 'Заказ уже завершён');
      order.state = 'cancelled';
      store.save();
      if (order.carrierId) notify(order.carrierId, `Клиент отменил заказ ${order.id}.`, order.id);
      if (order.workshopId) notify(order.workshopId, `Клиент отменил заказ ${order.id}.`, order.id);
      store.save();
      return json(res, 200, { ok: true, order: orderView(order, me) });
    }

    if (action === 'position' && method === 'POST') {
      if (me.id !== order.carrierId) return fail(res, 403, 'Геопозицию отправляет перевозчик этого заказа');
      let body;
      try { body = await parseBody(req); } catch (e) { return fail(res, 400, 'Некорректный запрос'); }
      const lat = Number(body.lat), lng = Number(body.lng);
      if (!isFinite(lat) || !isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
        return fail(res, 422, 'Некорректные координаты');
      }
      const existing = db.positions.find((p) => p.orderId === order.id);
      const rec = {
        orderId: order.id,
        lat,
        lng,
        speed: isFinite(Number(body.speed)) ? Number(body.speed) : null,
        ts: Date.now()
      };
      if (existing) Object.assign(existing, rec);
      else db.positions.push(rec);
      store.save();
      return json(res, 200, { ok: true, etaMin: etaMinutes(order) });
    }

    if (action === 'messages' && method === 'GET') {
      const isParticipant = me.id === order.clientId || me.id === order.carrierId || me.id === order.workshopId;
      if (!isParticipant) return fail(res, 403, 'Чат доступен только участникам заказа');
      const msgs = db.messages.filter((x) => x.orderId === order.id)
        .sort((a, b) => a.ts - b.ts)
        .map((x) => ({
          id: x.id,
          from: x.from,
          fromName: (db.users.find((u) => u.id === x.from) || {}).name || '',
          text: x.text,
          ts: x.ts,
          priceChip: !!x.priceChip,
          fromMe: x.from === me.id
        }));
      return json(res, 200, { messages: msgs });
    }

    if (action === 'messages' && method === 'POST') {
      const isParticipant = me.id === order.clientId || me.id === order.carrierId || me.id === order.workshopId;
      if (!isParticipant) return fail(res, 403, 'Чат доступен только участникам заказа');
      let body;
      try { body = await parseBody(req); } catch (e) { return fail(res, 400, 'Некорректный запрос'); }
      const text = String(body.text || '').trim().slice(0, 2000);
      if (!text) return fail(res, 422, 'Пустое сообщение');
      db.messages.push({
        id: U.uid('m'),
        orderId: order.id,
        from: me.id,
        text,
        ts: Date.now(),
        priceChip: !!body.priceChip
      });
      store.save();
      [order.clientId, order.carrierId, order.workshopId]
        .filter((id) => id && id !== me.id)
        .forEach((id) => notify(id, `Новое сообщение по заказу ${order.id} от ${me.name}.`, order.id));
      store.save();
      return json(res, 200, { ok: true });
    }
  }

  /* ---------- уведомления ---------- */
  if (pathname === '/api/notifications' && method === 'GET') {
    if (!me) return fail(res, 401, 'Не авторизован');
    const list = db.notifications
      .filter((n) => n.userId === me.id)
      .slice(0, 100)
      .map((n) => ({ id: n.id, text: n.text, orderId: n.orderId, ts: n.ts, read: n.read }));
    return json(res, 200, { notifications: list });
  }
  if (pathname === '/api/notifications/read' && method === 'POST') {
    if (!me) return fail(res, 401, 'Не авторизован');
    db.notifications.forEach((n) => { if (n.userId === me.id) n.read = true; });
    store.save();
    return json(res, 200, { ok: true });
  }

  return fail(res, 404, 'Метод не найден');
}

function chickenWord(n) {
  const n10 = Math.abs(n) % 10, n100 = Math.abs(n) % 100;
  if (n10 === 1 && n100 !== 11) return 'курица';
  if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return 'курицы';
  return 'куриц';
}


/* входная точка: сам разбирает URL */
async function apiHandler(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const pathname = decodeURIComponent(url.pathname);
  return handleApi(req, res, pathname, url.searchParams);
}

module.exports = { apiHandler, handleApi, json, fail };
