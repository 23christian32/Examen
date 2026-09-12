const nodemailer = require('nodemailer');

async function main() {
  const account = await nodemailer.createTestAccount();
  console.log('Cuenta de prueba Ethereal creada. Copia estos valores a tu .env:\n');
  console.log(`SMTP_HOST=${account.smtp.host}`);
  console.log(`SMTP_PORT=${account.smtp.port}`);
  console.log(`SMTP_USER=${account.user}`);
  console.log(`SMTP_PASS=${account.pass}`);
  console.log('\nWebmail para ver los correos recibidos: https://ethereal.email/login');
  console.log(`(usuario: ${account.user} / password: ${account.pass})`);
}

main().catch((err) => {
  console.error('No se pudo crear la cuenta Ethereal:', err);
  process.exit(1);
});
