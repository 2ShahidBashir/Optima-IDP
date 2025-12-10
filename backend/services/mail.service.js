const nodemailer = require("nodemailer");
const logger = require("../config/logger");

// Create transporter lazily so we can warn if env vars are missing
const createTransporter = () => {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASS,
    SMTP_FROM
  } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    logger.warn("SMTP env vars missing; emails will not be sent.");
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE === "true",
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });
};

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = createTransporter();
  }
  return transporter;
};

async function sendMail({ to, subject, text, html }) {
  const tx = getTransporter();
  if (!tx) {
    logger.warn(`Email not sent (transporter missing). Intended recipient: ${to}`);
    return;
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  await tx.sendMail({
    from,
    to,
    subject,
    text,
    html
  });
}

module.exports = {
  sendMail
};

