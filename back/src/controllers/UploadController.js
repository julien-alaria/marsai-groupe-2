import EmailController from "./EmailController.js";
 
async function upload(req, res) {
  try {
    const { to, movieTitle, firstName, juryComment, rejected } = req.body || {};

    if (rejected !== true) {
      return res.status(200).json({
        message: "Upload traité sans refus",
      });
    }

    if (!to) {
      return res.status(400).json({ error: "to est requis si rejected=true" });
    }

    await EmailController.sendVideoRejectedEmail({
      to,
      movieTitle,
      firstName,
      juryComment,
    });

    return res.status(200).json({
      message: "Upload refusé: email envoyé",
      to,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export default { upload };
