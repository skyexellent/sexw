'use strict';
/* Отправка кодов на e-mail.
   Настраивается через SMTP_* в .env (Яндекс, Mail.ru, Gmail с паролем приложения и т.п.).
   EMAIL_PROVIDER=console — код пишется в лог сервера (удобно для разработки). */

function enabled() {
  if (process.env.EMAIL_PROVIDER === 'console') return true;
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function isConsole() {
  return process.env.EMAIL_PROVIDER === 'console' || !(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

let transporter = null;
function getTransporter() {
  if (transporter) return transporter;
  let nodemailer;
  try {
    nodemailer = require('nodemailer');
  } catch (err) {
    return null;
  }
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || 'true') !== 'false',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
  return transporter;
}

async function sendMail(to, subject, text) {
  if (isConsole()) {
    console.log(`[email:console] ${to} | ${subject} | ${text}`);
    return { ok: true, devCode: (String(text).match(/\b(\d{4})\b/) || [])[1] };
  }
  const tr = getTransporter();
  if (!tr) return { ok: false, error: 'Модуль nodemailer не установлен (выполните npm install)' };
  try {
    await tr.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text
    });
    return { ok: true };
  } catch (err) {
    console.error('[email]', err.message);
    return { ok: false, error: 'Не удалось отправить письмо. Проверьте SMTP-настройки в .env' };
  }
}

module.exports = { sendMail, enabled, isConsole };
