import db from "../models/index.js";
const User = db.User;
const Movie = db.Movie;
const Collaborator = db.Collaborator;
import { comparePassword } from "../utils/password.js";
import { hashPassword } from "../utils/password.js";
import UserController from "./UserController.js";
import jwt from "jsonwebtoken";
import { isMailerConfigured, sendEmail, sendTemplateEmail } from "../utils/mailer.js";

const NewsletterSubscriber = db.NewsletterSubscriber;

/**
 * Fonction de connexion (Login)
 * Valide les identifiants de l'utilisateur et crée un JWT
 * @param {Object} req - La requête HTTP contenant { email, password }
 * @param {Object} res - La réponse HTTP
 * @returns {Object} Un token JWT et les infos utilisateur si succès, sinon erreur 401
 */
function login(req, res) {
  const { email, password } = req.body;

  // Chercher l'utilisateur par son email
  User.findOne({ where: { email } }).then((user) => {
    if (!user) {
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    // Comparer le mot de passe fourni avec le hash en base de données
    comparePassword(password, user.password).then((isMatch) => {
      if (!isMatch) {
        return res.status(401).json({ error: "Identifiants invalides" });
      }

      // Créer un JWT valide avec id_user au lieu de id 1 heure par défaut
      const token = jwt.sign(
      { id: user.id_user, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );


    // Ritornare il token e le info utente con wrapper data
      const responseData = {
        message: "Connexion réussie",
        data: {
          email: user.email,
          first_name: user.first_name,
          role: user.role,
          token,
        }
      };
      return res.status(200).json(responseData);
    }).catch(err => {
      return res.status(500).json({ error: "Erreur serveur" });
    });
  }).catch(err => {
    return res.status(500).json({ error: "Erreur serveur" });
  });
}

/**
 * Fonction d'enregistrement (Register)
 * Crée un nouvel utilisateur dans la base de données
 * @param {Object} req - La requête HTTP contenant les données d'enregistrement
 * @param {Object} res - La réponse HTTP
 */
function register(req, res) {
  // Déléguer à UserController pour créer l'utilisateur
  UserController.createUser(req, res);
}

/**
 * Enregistrement d'un producteur + soumission de film avec fichiers
 * Crée l'utilisateur, puis le film rattaché au compte
 */
async function registerWithFilm(req, res) {
  const transaction = await db.sequelize.transaction();
  try {
    const {
      first_name,
      firstName,
      last_name,
      lastName,
      email,
      password,
      phone,
      mobile,
      birth_date,
      birthDate,
      street,
      postal_code,
      postalCode,
      city,
      country,
      biography,
      job,
      portfolio,
      youtube,
      instagram,
      linkedin,
      facebook,
      tiktok,
      known_by_mars_ai,
      knownByMarsAi,
      role,
      filmTitleOriginal,
      durationSeconds,
      filmLanguage,
      releaseYear,
      nationality,
      translation,
      youtubeLink,
      synopsisOriginal,
      synopsisEnglish,
      aiClassification,
      aiStack,
      aiMethodology
    } = req.body;

    const userFirstName = first_name || firstName;
    const userLastName = last_name || lastName;
    const userBirthDate = birth_date || birthDate || null;
    const userPostalCode = postal_code || postalCode;
    const userKnownByMarsAi = known_by_mars_ai || knownByMarsAi;
    const userRole = role || "PRODUCER";

    if (!userFirstName || !userLastName || !email || !password) {
      await transaction.rollback();
      return res.status(400).json({ error: "Champs utilisateur obligatoires manquants" });
    }

    const durationNumber = Number(durationSeconds);
    if (!filmTitleOriginal || !durationSeconds || Number.isNaN(durationNumber)) {
      await transaction.rollback();
      return res.status(400).json({ error: "Le titre du film et la durée sont obligatoires" });
    }

    if (durationNumber > 120) {
      await transaction.rollback();
      return res.status(400).json({ error: "La durée maximale est de 120 secondes" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      await transaction.rollback();
      return res.status(409).json({ error: "Cet utilisateur existe déjà" });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await User.create({
      first_name: userFirstName,
      last_name: userLastName,
      email,
      password: hashedPassword,
      phone,
      mobile,
      birth_date: userBirthDate,
      street,
      postal_code: userPostalCode,
      city,
      country,
      biography,
      job,
      portfolio,
      youtube,
      instagram,
      linkedin,
      facebook,
      tiktok,
      known_by_mars_ai: userKnownByMarsAi,
      role: userRole
    }, { transaction });

    const files = req.files || {};
    const filmFile = files.filmFile?.[0]?.filename || null;
    const thumb1 = files.thumbnail1?.[0]?.filename || null;
    const thumb2 = files.thumbnail2?.[0]?.filename || null;
    const thumb3 = files.thumbnail3?.[0]?.filename || null;
    const subtitleFile = files.subtitlesSrt?.[0]?.filename || null;

    const newMovie = await Movie.create({
      title: filmTitleOriginal,
      description: synopsisOriginal,
      duration: durationNumber,
      main_language: filmLanguage,
      release_year: releaseYear || null,
      nationality,
      translation,
      youtube_link: youtubeLink,
      synopsis: synopsisOriginal,
      synopsis_anglais: synopsisEnglish,
      ai_tool: aiStack,
      workshop: aiMethodology,
      production: aiClassification,
      trailer: filmFile,
      subtitle: subtitleFile,
      picture1: thumb1,
      picture2: thumb2,
      picture3: thumb3,
      thumbnail: thumb1,
      id_user: newUser.id_user
    }, { transaction });

    const collaboratorsRaw = req.body.collaborators;
    let collaborators = [];
    if (collaboratorsRaw) {
      if (typeof collaboratorsRaw === "string") {
        try {
          collaborators = JSON.parse(collaboratorsRaw);
        } catch (parseError) {
          collaborators = [];
        }
      } else if (Array.isArray(collaboratorsRaw)) {
        collaborators = collaboratorsRaw;
      }
    }

    if (collaborators.length) {
      const collaboratorRecords = await Promise.all(
        collaborators
          .filter(collab => collab?.email)
          .map(async (collab) => {
          const [record] = await Collaborator.findOrCreate({
            where: { email: collab.email },
            defaults: {
              first_name: collab.first_name || "",
              last_name: collab.last_name || "",
              email: collab.email,
              job: collab.job || null
            },
            transaction
          });
          return record;
        })
      );

      await newMovie.setCollaborators(collaboratorRecords, { transaction });
    }

    await transaction.commit();

    let mailNotification = "Email non envoyé (SMTP non configuré)";
    try {
      const [subscriber, created] = await NewsletterSubscriber.findOrCreate({
        where: { email: newUser.email },
        defaults: {
          email: newUser.email,
          first_name: newUser.first_name,
          last_name: newUser.last_name,
          source: "FILM_CANDIDACY",
          is_active: true
        }
      });

      if (!created) {
        subscriber.first_name = newUser.first_name || subscriber.first_name;
        subscriber.last_name = newUser.last_name || subscriber.last_name;
        subscriber.source = "FILM_CANDIDACY";
        subscriber.is_active = true;
        await subscriber.save();
      }

      if (isMailerConfigured()) {
        const candidacyTemplateId = process.env.BREVO_TEMPLATE_FILM_CANDIDACY_CONFIRMATION;
        if (candidacyTemplateId) {
          await sendTemplateEmail({
            to: newUser.email,
            templateId: candidacyTemplateId,
            params: {
              first_name: newUser.first_name,
              last_name: newUser.last_name,
              movie_title: newMovie.title,
              email: newUser.email,
            },
          });
        } else {
          await sendEmail({
            to: newUser.email,
            subject: "Confirmation de candidature - MarsAI Festival",
            text: `Bonjour ${newUser.first_name}, votre candidature (${newMovie.title}) a bien été reçue.`,
            html: `<p>Bonjour <strong>${newUser.first_name}</strong>,</p><p>Votre candidature pour le film <strong>${newMovie.title}</strong> a bien été reçue.</p><p>Merci pour votre participation au MarsAI Festival.</p>`
          });
        }
        mailNotification = "Email de confirmation envoyé";
      }
    } catch (emailError) {
      console.warn("registerWithFilm email/newsletter error:", emailError.message);
      mailNotification = "Candidature créée, mais email de confirmation non envoyé";
    }

    return res.status(201).json({
      message: "Candidature créée avec succès",
      user: { id_user: newUser.id_user, email: newUser.email },
      movie: { id_movie: newMovie.id_movie, title: newMovie.title },
      notification: mailNotification
    });
  } catch (error) {
    console.error("registerWithFilm error:", error);
    await transaction.rollback();
    return res.status(500).json({
      error: error.message,
      details: error?.original?.message || error?.errors?.[0]?.message || null
    });
  }
}

export default { login, register, registerWithFilm };
