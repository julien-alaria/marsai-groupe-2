function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildVideoRejectTemplate({ firstName, movieTitle, juryComment }) {
  const safeFirstName = escapeHtml(firstName || "Créateur");
  const safeMovieTitle = escapeHtml(movieTitle || "votre film");
  const safeJuryComment = juryComment ? escapeHtml(juryComment) : null;

  return /* html */ `
<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>MarsAI Festival - Statut de votre film</title>
  </head>
  <body style="margin:0;padding:0;background:#0b0b12;font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b0b12;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#13131d;border:1px solid #2a2a38;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:24px 24px 12px 24px;background:linear-gradient(135deg,#ad46ff,#f6339a);">
                <h1 style="margin:0;font-size:24px;line-height:1.25;color:#ffffff;font-weight:700;">MarsAI Festival</h1>
                <p style="margin:8px 0 0 0;font-size:14px;line-height:1.5;color:#ffffff;opacity:.92;">Mise à jour sur votre soumission</p>
              </td>
            </tr>

            <tr>
              <td style="padding:24px;">
                <p style="margin:0 0 14px 0;font-size:16px;line-height:1.6;color:#f4f4f5;">Bonjour <strong>${safeFirstName}</strong>,</p>

                <p style="margin:0 0 14px 0;font-size:15px;line-height:1.7;color:#d4d4d8;">
                  Après examen, votre film <strong style="color:#ffffff;">${safeMovieTitle}</strong>
                  n’a pas été retenu pour la prochaine étape de sélection.
                </p>

                ${safeJuryComment ? `
                <div style="margin:0 0 16px 0;padding:14px;border:1px solid #3d3d4f;border-radius:12px;background:#1a1a28;">
                  <p style="margin:0 0 8px 0;font-size:13px;color:#ad46ff;font-weight:700;text-transform:uppercase;letter-spacing:.4px;">Commentaire du jury</p>
                  <p style="margin:0;font-size:14px;line-height:1.7;color:#e5e7eb;">${safeJuryComment}</p>
                </div>
                ` : ""}

                <p style="margin:0 0 14px 0;font-size:15px;line-height:1.7;color:#d4d4d8;">
                  Merci pour votre participation et pour votre confiance envers le festival.
                </p>

                <p style="margin:0;font-size:14px;line-height:1.7;color:#a1a1aa;">
                  L’équipe MarsAI Festival
                </p>
              </td>
            </tr>
          </table>

          <p style="margin:12px 0 0 0;font-size:12px;line-height:1.5;color:#7c7c87;">
            Cet email est envoyé automatiquement par MarsAI Festival.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function buildVideoRejectText({ firstName, movieTitle, juryComment }) {
  const identity = firstName || "Créateur";
  const title = movieTitle || "votre film";
  const comment = juryComment ? `\n\nCommentaire du jury:\n${juryComment}` : "";

  return `Bonjour ${identity},\n\nAprès examen, votre film \"${title}\" n’a pas été retenu pour la prochaine étape de sélection.${comment}\n\nMerci pour votre participation.\n\nL’équipe MarsAI Festival`;
}
