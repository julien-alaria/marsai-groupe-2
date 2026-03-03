import db from "../models/index.js";
import { isMailerConfigured, sendEmail } from "../utils/mailer.js";
import {
  buildVideoRejectTemplate,
  buildVideoRejectText,
} from "../constants/VideoRejectTemplate.js";

const Movie = db.Movie;
const User = db.User;

async function sendMail({ to, subject, html, text }) {
  if (!isMailerConfigured()) {
    throw new Error("SMTP non configuré");
  }

  return sendEmail({ to, subject, html, text });
}

async function sendVideoRejectedEmail({ to, firstName, movieTitle, juryComment }) {
  const safeMovieTitle = movieTitle || "votre film";
  const safeFirstName = firstName || "Créateur";

  return sendMail({
    to,
    subject: `MarsAI Festival - Mise à jour de candidature: ${safeMovieTitle}`,
    text: buildVideoRejectText({
      firstName: safeFirstName,
      movieTitle: safeMovieTitle,
      juryComment,
    }),
    html: buildVideoRejectTemplate({
      firstName: safeFirstName,
      movieTitle: safeMovieTitle,
      juryComment,
    }),
  });
}

async function sendRejectTest(req, res) {
  try {
    const { to, movieTitle, firstName, juryComment } = req.body || {};

    if (!to) {
      return res.status(400).json({ error: "to est requis" });
    }

    await sendVideoRejectedEmail({
      to,
      firstName,
      movieTitle,
      juryComment,
    });

    return res.status(200).json({
      message: "Email de refus envoyé",
      to,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function sendRejectForMovie(req, res) {
  try {
    const { id } = req.params;

    const movie = await Movie.findByPk(id, {
      include: [
        {
          model: User,
          as: "Producer",
          attributes: ["email", "first_name"],
        },
      ],
    });

    if (!movie) {
      return res.status(404).json({ error: "Film non trouvé" });
    }

    if (!movie?.Producer?.email) {
      return res.status(400).json({
        error: "Email du réalisateur introuvable",
      });
    }

    await sendVideoRejectedEmail({
      to: movie.Producer.email,
      firstName: movie.Producer.first_name,
      movieTitle: movie.title,
      juryComment: movie.jury_comment,
    });

    return res.status(200).json({
      message: "Email de refus envoyé au réalisateur",
      movieId: movie.id_movie,
      to: movie.Producer.email,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export default {
  sendMail,
  sendVideoRejectedEmail,
  sendRejectTest,
  sendRejectForMovie,
};
