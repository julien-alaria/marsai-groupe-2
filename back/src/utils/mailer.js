import * as brevo from "@getbrevo/brevo";

let apiInstance;

function isMailerConfigured() {
  return Boolean(process.env.BREVO_API_KEY && process.env.BREVO_SENDER_EMAIL);
}

function getApiInstance() {
  if (apiInstance) return apiInstance;

  apiInstance = new brevo.TransactionalEmailsApi();
  apiInstance.setApiKey(
    brevo.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY
  );

  return apiInstance;
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
    throw new Error("Mailer non configuré (Brevo API)");
  }

  const senderName = process.env.BREVO_SENDER_NAME || "MarsAI Festival";
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const recipients = normalizeToRecipients(to);

  if (!recipients.length) {
    throw new Error("Destinataire email manquant");
  }

  const message = new brevo.SendSmtpEmail();
  message.sender = { name: senderName, email: senderEmail };
  message.to = recipients;
  message.subject = subject;
  message.htmlContent = html;
  if (text) {
    message.textContent = text;
  }

  return await getApiInstance().sendTransacEmail(message);
}

async function sendTemplateEmail({ to, templateId, params = {}, subject }) {
  if (!isMailerConfigured()) {
    throw new Error("Mailer non configuré (Brevo API)");
  }

  const senderName = process.env.BREVO_SENDER_NAME || "MarsAI Festival";
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const recipients = normalizeToRecipients(to);

  if (!recipients.length) {
    throw new Error("Destinataire email manquant");
  }

  const message = new brevo.SendSmtpEmail();
  message.sender = { name: senderName, email: senderEmail };
  message.to = recipients;
  message.templateId = Number(templateId);
  message.params = params;
  if (subject) {
    message.subject = subject;
  }

  return await getApiInstance().sendTransacEmail(message);
}

export { isMailerConfigured, sendEmail, sendTemplateEmail };
