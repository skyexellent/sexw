'use strict';
/* Отправка SMS через sms.ru. Ключ ТОЛЬКО на сервере, в переменной окружения.
   Провайдеры:
     - sms.ru   (по умолчанию, если задан SMS_RU_API_KEY)
     - console  (SMS_PROVIDER=console — код пишется в лог сервера, баланс не тратится) */

const DEFAULT_TTL = Number(process.env.SMS_CODE_TTL || 300);

function enabled() {
  return process.env.SMS_PROVIDER === 'console' || !!process.env.SMS_RU_API_KEY;
}

function isConsole() {
  return process.env.SMS_PROVIDER === 'console' || !process.env.SMS_RU_API_KEY;
}

const SMS_RU_ERRORS = {
  101: 'Неправильный API-ключ sms.ru. Проверьте SMS_RU_API_KEY в .env',
  102: 'На аккаунте sms.ru недостаточно средств — пополните баланс в личном кабинете sms.ru',
  103: 'Неправильный номер получателя',
  105: 'Слишком много SMS: превышен лимит sms.ru, повторите позже',
  106: 'Недостаточно прав у API-ключа sms.ru (проверьте доступ к методу sms/send)',
  107: 'Номер получателя в стоп-листе sms.ru',
  108: 'Пустой текст сообщения',
  110: 'Слишком длинное сообщение',
  111: 'Не задан API-ключ sms.ru',
  112: 'IP сервера не в белом списке sms.ru (включите любой IP или добавьте свой)',
  201: 'Номер получателя не найден / не обслуживается',
  202: 'Номер получателя в чёрном списке sms.ru'
};

/**
 * Отправляет SMS с кодом.
 * @returns {Promise<{ok:boolean, devCode?:string, error?:string}>}
 */
async function sendSms(phoneNormalized, text) {
  if (isConsole()) {
    console.log(`[sms:console] ${phoneNormalized}: ${text}`);
    return { ok: true, devCode: extractCode(text) };
  }

  const params = new URLSearchParams({
    api_id: process.env.SMS_RU_API_KEY,
    to: phoneNormalized,
    text,
    json: '1'
  });
  if (process.env.SMS_RU_SENDER) params.set('from', process.env.SMS_RU_SENDER);
  if (process.env.SMS_RU_TEST === '1') params.set('test', '1');

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  try {
    const res = await fetch('https://sms.ru/sms/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
      signal: ctrl.signal
    });
    const data = await res.json();
    if (data.status === 'OK') {
      return { ok: true, devCode: process.env.SMS_RU_TEST === '1' ? extractCode(text) : undefined };
    }
    const code = Number(data.status_code);
    const err = SMS_RU_ERRORS[code] || `sms.ru ответил ошибкой: ${data.status_text || data.status || 'неизвестно'}`;
    console.error('[sms.ru]', code, err);
    return { ok: false, error: err };
  } catch (err) {
    console.error('[sms.ru] сеть:', err.message);
    return { ok: false, error: 'Не удалось связаться с sms.ru. Проверьте интернет-соединение сервера.' };
  } finally {
    clearTimeout(timer);
  }
}

function extractCode(text) {
  const m = String(text).match(/\b(\d{4})\b/);
  return m ? m[1] : undefined;
}

module.exports = { sendSms, enabled, isConsole, DEFAULT_TTL };
