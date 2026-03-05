import nodemailer from "nodemailer";

let transporter;

function getSenderName() {
  return process.env.MAIL_FROM_NAME || process.env.BREVO_SENDER_NAME || "MarsAI Festival";
}

function getSenderEmail() {
  return process.env.MAIL_FROM_EMAIL || process.env.BREVO_SENDER_EMAIL;
}

function isMailerConfigured() {
  return Boolean(
    process.env.SMTP_HOST
      && process.env.SMTP_PORT
      && process.env.SMTP_USER
      && process.env.SMTP_PASS
      && getSenderEmail()
  );
}

function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true" || Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
}

function normalizeToRecipients(to) {
  if (Array.isArray(to)) {
    return to.map((entry) =>
      typeof entry === "string" ? { email: entry } : entry
    );
  }

  if (typeof to === "string") {
    return [{ email: to }];
  }

  return [];
}

async function sendEmail({ to, subject, html, text }) {
  if (!isMailerConfigured()) {
    throw new Error("Mailer non configuré (SMTP)");
  }

  const senderName = getSenderName();
  const senderEmail = getSenderEmail();
  const recipients = normalizeToRecipients(to);

  if (!recipients.length) {
    throw new Error("Destinataire email manquant");
  }

  return await getTransporter().sendMail({
    from: `${senderName} <${senderEmail}>`,
    to: recipients.map((recipient) => recipient.email).join(", "),
    subject,
    html,
    text,
  });
}

async function sendTemplateEmail({ to, templateId, params = {}, subject }) {
  const paramsText = Object.entries(params)
    .map(([key, value]) => `${key}: ${value ?? ""}`)
    .join("\n");

  const paramsHtml = Object.entries(params)
    .map(([key, value]) => `<li><strong>${key}</strong>: ${value ?? ""}</li>`)
    .join("");

  return await sendEmail({
    to,
    subject: subject || `Notification MarsAI (template ${templateId})`,
    text: paramsText || `Template ${templateId}`,
    html: paramsHtml
      ? `<p>Template: <strong>${templateId}</strong></p><ul>${paramsHtml}</ul>`
      : `<p>Template: <strong>${templateId}</strong></p>`,
  });
}

export { isMailerConfigured, sendEmail, sendTemplateEmail };
