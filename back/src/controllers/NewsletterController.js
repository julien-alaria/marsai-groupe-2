import db from "../models/index.js";
import { isMailerConfigured, sendEmail, sendTemplateEmail } from "../utils/mailer.js";

const NewsletterSubscriber = db.NewsletterSubscriber;

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "");
}

async function subscribe(req, res) {
  try {
    const { email, first_name, firstName, last_name, lastName, source } = req.body;
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ error: "Email invalide" });
    }

    const inputFirstName = first_name || firstName || null;
    const inputLastName = last_name || lastName || null;
    const inputSource = source === "FILM_CANDIDACY" ? "FILM_CANDIDACY" : "PUBLIC";

    const existing = await NewsletterSubscriber.findOne({
      where: { email: normalizedEmail },
    });

    if (existing) {
      existing.first_name = inputFirstName || existing.first_name;
      existing.last_name = inputLastName || existing.last_name;
      existing.source = existing.source === "FILM_CANDIDACY" ? "FILM_CANDIDACY" : inputSource;
      existing.is_active = true;
      await existing.save();

      return res.status(200).json({
        message: "Déjà inscrit à la newsletter",
        subscriber: existing,
      });
    }

    const subscriber = await NewsletterSubscriber.create({
      email: normalizedEmail,
      first_name: inputFirstName,
      last_name: inputLastName,
      source: inputSource,
      is_active: true,
    });

    if (isMailerConfigured()) {
      try {
        const welcomeTemplateId = process.env.BREVO_TEMPLATE_NEWSLETTER_WELCOME;
        if (welcomeTemplateId) {
          await sendTemplateEmail({
            to: normalizedEmail,
            templateId: welcomeTemplateId,
            params: {
              first_name: inputFirstName || "",
              last_name: inputLastName || "",
              email: normalizedEmail,
            },
          });
        } else {
          await sendEmail({
            to: normalizedEmail,
            subject: "Inscription newsletter MarsAI confirmée",
            text: "Merci pour votre inscription à la newsletter MarsAI.",
            html: "<p>Merci pour votre inscription à la <strong>newsletter MarsAI</strong>.</p>",
          });
        }
      } catch (emailError) {
        console.warn("Newsletter welcome email error:", emailError.message);
      }
    }

    return res.status(201).json({
      message: "Inscription newsletter réussie",
      subscriber,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function listSubscribers(req, res) {
  try {
    const subscribers = await NewsletterSubscriber.findAll({
      where: { is_active: true },
      order: [["createdAt", "DESC"]],
    });
    return res.status(200).json(subscribers);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function sendNewsletter(req, res) {
  try {
    const { subject, html, text, templateId, params } = req.body;

    const hasTemplate = Boolean(templateId);
    const hasRawContent = Boolean(subject && (html || text));

    if (!hasTemplate && !hasRawContent) {
      return res.status(400).json({
        error: "Fournissez soit templateId, soit subject + contenu (html ou text)",
      });
    }

    if (!isMailerConfigured()) {
      return res.status(400).json({
        error: "SMTP non configuré (vérifiez les variables .env)",
      });
    }

    const subscribers = await NewsletterSubscriber.findAll({
      where: { is_active: true },
      attributes: ["email"],
    });

    if (!subscribers.length) {
      return res.status(200).json({ message: "Aucun abonné actif", sent: 0, failed: 0 });
    }

    const results = await Promise.allSettled(subscribers.map((subscriber) => {
      if (hasTemplate) {
        return sendTemplateEmail({
          to: subscriber.email,
          templateId,
          params: {
            ...(params || {}),
            email: subscriber.email,
          },
        });
      }

      return sendEmail({
        to: subscriber.email,
        subject,
        html: html || `<p>${text}</p>`,
        text: text || undefined,
      });
    }));

    const sent = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.length - sent;

    return res.status(200).json({
      message: "Newsletter envoyée",
      recipients: results.length,
      sent,
      failed,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function sendTestEmail(req, res) {
  try {
    const { to, subject, text, html } = req.body;
    const fallbackTo = req.user?.email || null;
    const target = String(to || fallbackTo || "").trim().toLowerCase();

    if (!isMailerConfigured()) {
      return res.status(400).json({
        error: "SMTP non configuré (vérifiez les variables .env)",
      });
    }

    if (!isValidEmail(target)) {
      return res.status(400).json({
        error: "Email destinataire invalide. Fournissez body.to",
      });
    }

    await sendEmail({
      to: target,
      subject: subject || "Test email SMTP - MarsAI",
      text: text || "Email de test SMTP envoyé avec succès.",
      html:
        html
        || "<p><strong>MarsAI</strong> : email de test SMTP envoyé avec succès.</p>",
    });

    return res.status(200).json({
      message: "Email de test envoyé",
      to: target,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export default { subscribe, listSubscribers, sendNewsletter, sendTestEmail };
