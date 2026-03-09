// function escapeHtml(value = "") {
//   return String(value)
//     .replace(/&/g, "&amp;")
//     .replace(/</g, "&lt;")
//     .replace(/>/g, "&gt;")
//     .replace(/\"/g, "&quot;")
//     .replace(/'/g, "&#39;");
// }

// export function buildVideoRejectTemplate({ firstName, movieTitle, juryComment }) {
//   const safeFirstName = escapeHtml(firstName || "Créateur");
//   const safeMovieTitle = escapeHtml(movieTitle || "votre film");
//   const safeJuryComment = juryComment ? escapeHtml(juryComment) : null;

//   return /* html */ `
// <!doctype html>
// <html lang="fr">
//   <head>
//     <meta charset="UTF-8" />
//     <meta name="viewport" content="width=device-width,initial-scale=1" />
//     <title>MarsAI Festival - Statut de votre film</title>
//   </head>
//   <body style="margin:0;padding:0;background:#0b0b12;font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
//     <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b0b12;padding:28px 12px;">
//       <tr>
//         <td align="center">
//           <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#13131d;border:1px solid #2a2a38;border-radius:16px;overflow:hidden;">
//             <tr>
//               <td style="padding:24px 24px 12px 24px;background:linear-gradient(135deg,#ad46ff,#f6339a);">
//                 <h1 style="margin:0;font-size:24px;line-height:1.25;color:#ffffff;font-weight:700;">MarsAI Festival</h1>
//                 <p style="margin:8px 0 0 0;font-size:14px;line-height:1.5;color:#ffffff;opacity:.92;">Mise à jour sur votre soumission</p>
//               </td>
//             </tr>

//             <tr>
//               <td style="padding:24px;">
//                 <p style="margin:0 0 14px 0;font-size:16px;line-height:1.6;color:#f4f4f5;">Bonjour <strong>${safeFirstName}</strong>,</p>

//                 <p style="margin:0 0 14px 0;font-size:15px;line-height:1.7;color:#d4d4d8;">
//                   Après examen, votre film <strong style="color:#ffffff;">${safeMovieTitle}</strong>
//                   n’a pas été retenu pour la prochaine étape de sélection.
//                 </p>

//                 ${safeJuryComment ? `
//                 <div style="margin:0 0 16px 0;padding:14px;border:1px solid #3d3d4f;border-radius:12px;background:#1a1a28;">
//                   <p style="margin:0 0 8px 0;font-size:13px;color:#ad46ff;font-weight:700;text-transform:uppercase;letter-spacing:.4px;">Commentaire du jury</p>
//                   <p style="margin:0;font-size:14px;line-height:1.7;color:#e5e7eb;">${safeJuryComment}</p>
//                 </div>
//                 ` : ""}

//                 <p style="margin:0 0 14px 0;font-size:15px;line-height:1.7;color:#d4d4d8;">
//                   Merci pour votre participation et pour votre confiance envers le festival.
//                 </p>

//                 <p style="margin:0;font-size:14px;line-height:1.7;color:#a1a1aa;">
//                   L’équipe MarsAI Festival
//                 </p>
//               </td>
//             </tr>
//           </table>

//           <p style="margin:12px 0 0 0;font-size:12px;line-height:1.5;color:#7c7c87;">
//             Cet email est envoyé automatiquement par MarsAI Festival.
//           </p>
//         </td>
//       </tr>
//     </table>
//   </body>
// </html>`;
// }

// export function buildVideoRejectText({ firstName, movieTitle, juryComment }) {
//   const identity = firstName || "Créateur";
//   const title = movieTitle || "votre film";
//   const comment = juryComment ? `\n\nCommentaire du jury:\n${juryComment}` : "";

//   return `Bonjour ${identity},\n\nAprès examen, votre film \"${title}\" n’a pas été retenu pour la prochaine étape de sélection.${comment}\n\nMerci pour votre participation.\n\nL’équipe MarsAI Festival`;
// }

export const VIDEO_REJECT_TEMPLATE = `
<!doctype html>
<html lang="en">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>Simple Transactional Email</title>
    <style media="all" type="text/css">


/* -------------------------------------
    GLOBAL RESETS
------------------------------------- */
    
    body {
      font-family: Helvetica, sans-serif;
      -webkit-font-smoothing: antialiased;
      font-size: 16px;
      line-height: 1.3;
      -ms-text-size-adjust: 100%;
      -webkit-text-size-adjust: 100%;
    }
    
    table {
      border-collapse: separate;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
      width: 100%;
    }
    
    table td {
      font-family: Helvetica, sans-serif;
      font-size: 16px;
      vertical-align: top;
    }

/* -------------------------------------
    BODY & CONTAINER
------------------------------------- */
    
    body {
      background-color: #f4f5f6;
      margin: 0;
      padding: 0;
    }
    
    .body {
      background-color: #f4f5f6;
      width: 100%;
    }
    
    .container {
      margin: 0 auto !important;
      max-width: 600px;
      padding: 0;
      padding-top: 24px;
      width: 600px;
    }
    
    .content {
      box-sizing: border-box;
      display: block;
      margin: 0 auto;
      max-width: 600px;
      padding: 0;
    }

/* -------------------------------------
    HEADER, FOOTER, MAIN
------------------------------------- */
    
    .main {
      background: #ffffff;
      border: 1px solid #eaebed;
      border-radius: 16px;
      width: 100%;
    }
    
    .wrapper {
      box-sizing: border-box;
      padding: 24px;
    }
    
    .footer {
      clear: both;
      padding-top: 24px;
      text-align: center;
      width: 100%;
    }
    
    .footer td,
    .footer p,
    .footer span,
    .footer a {
      color: #9a9ea6;
      font-size: 16px;
      text-align: center;
    }

/* -------------------------------------
    TYPOGRAPHY
------------------------------------- */
    
    p {
      font-family: Helvetica, sans-serif;
      font-size: 16px;
      font-weight: normal;
      margin: 0;
      margin-bottom: 16px;
    }
    
    a {
      color: #0867ec;
      text-decoration: underline;
    }

/* -------------------------------------
    BUTTONS
------------------------------------- */
    
    .btn {
      box-sizing: border-box;
      min-width: 100% !important;
      width: 100%;
    }
    
    .btn > tbody > tr > td {
      padding-bottom: 16px;
    }
    
    .btn table {
      width: auto;
    }
    
    .btn table td {
      background-color: #ffffff;
      border-radius: 4px;
      text-align: center;
    }
    
    .btn a {
      background-color: #ffffff;
      border: solid 2px #0867ec;
      border-radius: 4px;
      box-sizing: border-box;
      color: #0867ec;
      cursor: pointer;
      display: inline-block;
      font-size: 16px;
      font-weight: bold;
      margin: 0;
      padding: 12px 24px;
      text-decoration: none;
      text-transform: capitalize;
    }
    
    .btn-primary table td {
      background-color: #0867ec;
    }
    
    .btn-primary a {
      background-color: #0867ec;
      border-color: #0867ec;
      color: #ffffff;
    }
    
    @media all {
      .btn-primary table td:hover {
        background-color: #ec0867 !important;
      }
      .btn-primary a:hover {
        background-color: #ec0867 !important;
        border-color: #ec0867 !important;
      }
    }
    
/* -------------------------------------
    OTHER STYLES THAT MIGHT BE USEFUL
------------------------------------- */
    
    .last {
      margin-bottom: 0;
    }
    
    .first {
      margin-top: 0;
    }
    
    .align-center {
      text-align: center;
    }
    
    .align-right {
      text-align: right;
    }
    
    .align-left {
      text-align: left;
    }
    
    .text-link {
      color: #0867ec !important;
      text-decoration: underline !important;
    }
    
    .clear {
      clear: both;
    }
    
    .mt0 {
      margin-top: 0;
    }
    
    .mb0 {
      margin-bottom: 0;
    }
    
    .preheader {
      color: transparent;
      display: none;
      height: 0;
      max-height: 0;
      max-width: 0;
      opacity: 0;
      overflow: hidden;
      mso-hide: all;
      visibility: hidden;
      width: 0;
    }
    
    .powered-by a {
      text-decoration: none;
    }
    
/* -------------------------------------
    RESPONSIVE AND MOBILE FRIENDLY STYLES
------------------------------------- */
    
    @media only screen and (max-width: 640px) {
      .main p,
      .main td,
      .main span {
        font-size: 16px !important;
      }
      .wrapper {
        padding: 8px !important;
      }
      .content {
        padding: 0 !important;
      }
      .container {
        padding: 0 !important;
        padding-top: 8px !important;
        width: 100% !important;
      }
      .main {
        border-left-width: 0 !important;
        border-radius: 0 !important;
        border-right-width: 0 !important;
      }
      .btn table {
        max-width: 100% !important;
        width: 100% !important;
      }
      .btn a {
        font-size: 16px !important;
        max-width: 100% !important;
        width: 100% !important;
      }
    }

/* -------------------------------------
    PRESERVE THESE STYLES IN THE HEAD
------------------------------------- */
    
    @media all {
      .ExternalClass {
        width: 100%;
      }
      .ExternalClass,
      .ExternalClass p,
      .ExternalClass span,
      .ExternalClass font,
      .ExternalClass td,
      .ExternalClass div {
        line-height: 100%;
      }
      .apple-link a {
        color: inherit !important;
        font-family: inherit !important;
        font-size: inherit !important;
        font-weight: inherit !important;
        line-height: inherit !important;
        text-decoration: none !important;
      }
      #MessageViewBody a {
        color: inherit;
        text-decoration: none;
        font-size: inherit;
        font-family: inherit;
        font-weight: inherit;
        line-height: inherit;
      }
    }
    </style>
  </head>
  <body>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body">
      <tr>
        <td>&nbsp;</td>
        <td class="container">
          <div class="content">

            <!-- START CENTERED WHITE CONTAINER -->
            <span class="preheader">Your video submission has been declined due to licensed content.</span>
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="main">

              <!-- START MAIN CONTENT AREA -->
              <tr>
                <td class="wrapper">
                  <p>Dear Producer,</p>
                  <p>
                    We regret to inform you that your video cannot be accepted,
                    as it contains content that is subject to licensing rights.
                  </p>

                  <p>
                    We kindly ask you to review the materials used (music, images,
                    footage, etc.) and submit a revised version that complies
                    with the licensing requirements if you wish.
                  </p>

                  <p>
                    Thank you for your participation in the MarsAI Festival.
                  </p>

                  <p>
                    Best regards,<br>
                    The MarsAI Festival Team
                  </p>
                </td>
              </tr>

              <!-- END MAIN CONTENT AREA -->
              </table>

            <!-- START FOOTER -->
            <div class="footer">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td class="content-block">
                    <span class="apple-link">MarsAI Festival</span>
                  </td>
                </tr>
              </table>
            </div>

            <!-- END FOOTER -->
            
<!-- END CENTERED WHITE CONTAINER --></div>
        </td>
        <td>&nbsp;</td>
      </tr>
    </table>
  </body>
</html>
`;