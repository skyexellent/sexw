{
  "name": "kurovoz",
  "version": "1.0.0",
  "private": true,
  "description": "КУРОВОЗ — сервис заказа, перевозки и приёмки куриц (клиент, перевозчик, чистка)",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "test": "node test/smoke-api.js && node test/smoke-login.js && node test/smoke-ui.js && node test/store-pg-test.js"
  },
  "engines": {
    "node": ">=18"
  },
  "dependencies": {
    "nodemailer": "^6.9.14",
    "pg": "^8.12.0"
  },
  "devDependencies": {
    "pg-mem": "^3.0.14"
  }
}
