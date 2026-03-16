import db from "../models/index.js";
import path from "path";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import { Op } from "sequelize";
import EmailController from "./EmailController.js";

const {
  Movie,
  Categorie,
  Collaborator,
  User,
  Award
} = db;

const uploadDir = path.join(process.cwd(), "uploads");
const uploadedDir = path.join(uploadDir, "uploaded");

function generatePosterFromVideo(videoFilename) {
  if (!videoFilename) return Promise.resolve(null);

  const posterName = `poster-${Date.now()}-${Math.round(Math.random() * 1e9)}.jpg`;

  return new Promise((resolve, reject) => {
    ffmpeg(path.join(uploadDir, videoFilename))
      .on("end", () => resolve(posterName))
      .on("error", (err) => reject(err))
      .screenshots({
        count: 1,
        timemarks: ["1"],
        filename: posterName,
        folder: uploadDir,
        size: "1280x720"
      });
  });
}

//////////////////////////////////////////////////////////// Récupérer tous les films

async function getMovies(req, res) {
  try {
    const movies = await Movie.findAll({
      include: [
        {
          model: Categorie,
          through: { attributes: [] }
        },
        {
          model: Collaborator,
          through: { attributes: [] }
        },
        {
          model: Award,
          required: false
        },
        {
          model: User,
          as: "Producer",
          attributes: ["id_user", "first_name", "last_name"]
        },
        {
          model: User,
          as: "NominatorJury",
          attributes: ["id_user", "first_name", "last_name", "email"],
          required: false
        },
        {
          model: User,
          as: "Juries",
          attributes: ["id_user", "first_name", "last_name", "email", "role"],
          through: { attributes: [] },
          required: false
        }
      ]
    });

    res.json(movies);

  } catch (error) {
    console.error("getMovies error:", error);
    res.status(500).json({
      error: error.message,
      name: error.name,
      detail: error?.parent?.sqlMessage || error?.original?.message
    });
  }
}

//////////////////////////////////////////////////////////// Mes films (producteur connecté)

async function getMyMovies(req, res) {
  try {
    const id_user = req.user.id_user;
    const movies = await Movie.findAll({
      where: { id_user },
      include: [
        {
          model: Categorie,
          through: { attributes: [] }
        },
        {
          model: Collaborator,
          through: { attributes: [] }
        }
      ]
    });

    res.json(movies);
  } catch (error) {
    console.error("getMyMovies error:", error);
    res.status(500).json({
      error: error.message,
      name: error.name,
      detail: error?.parent?.sqlMessage || error?.original?.message
    });
  }
}


/////////////////////////////////////////////////////////////////////// Récupérer un film par ID

async function getMovieById(req, res) {
  try {
    const { id } = req.params;

    const movie = await Movie.findByPk(id, {
      include: [
        { model: Categorie,
          through: { attributes: [] }
        },
        { model: Collaborator,
          through: { attributes: [] }
         },
        { model: Award, required: false },
        { model: User, as: "Producer", attributes: ["id_user", "first_name", "last_name"] },
        {
          model: User,
          as: "NominatorJury",
          attributes: ["id_user", "first_name", "last_name", "email"],
          required: false
        },
        {
          model: User,
          as: "Juries",
          attributes: ["id_user", "first_name", "last_name", "email", "role"],
          through: { attributes: [] }
        }
      ]
    });

    if (!movie) {
      return res.status(404).json({ error: "Film non trouvé" });
    }

    res.json(movie);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


/////////////////////////////////////////////////////////////////////////////// Soumettre un film

async function createMovie(req, res) {
  try {

    // -1- Récupérer utilisateur connecté
    const id_user = req.user.id_user;

    // -2- Récupérer les données du formulaire
    const {
      title,
      description,
      duration,
      main_language,
      release_year,
      nationality,
      display_picture,
      picture1,
      picture2,
      picture3,
      trailer,
      youtube_link,
      production,
      workshop,
      translation,
      synopsis,
      synopsis_anglais,
      subtitle,
      ai_tool,
      thumbnail,
      categories,
      collaborators,
      filmTitleOriginal,
      durationSeconds,
      filmLanguage,
      releaseYear,
      youtubeLink,
      synopsisOriginal,
      synopsisEnglish,
      aiClassification,
      aiStack,
      aiMethodology
    } = req.body;

    const knownByMarsAi = req.body.knownByMarsAi || req.body.known_by_mars_ai;

    const files = req.files || {};
    const filmFile = files.filmFile?.[0]?.filename || null;
    const thumb1 = files.thumbnail1?.[0]?.filename || null;
    const thumb2 = files.thumbnail2?.[0]?.filename || null;
    const thumb3 = files.thumbnail3?.[0]?.filename || null;
    const subtitleFile = files.subtitlesSrt?.[0]?.filename || null;

    const movieTitle = filmTitleOriginal || title;
    const movieDescription = synopsisOriginal || description || synopsis;
    const movieDurationRaw = durationSeconds ?? duration;
    const movieDuration = movieDurationRaw !== undefined && movieDurationRaw !== null
      ? Number(movieDurationRaw)
      : null;
    const movieMainLanguage = filmLanguage || main_language;
    const movieReleaseYear = releaseYear || release_year || null;
    const movieYoutubeLink = youtubeLink || youtube_link;
    const movieSynopsisEnglish = synopsisEnglish || synopsis_anglais;
    const movieProduction = aiClassification || production;
    const movieWorkshop = aiMethodology || workshop;
    const movieAiTool = aiStack || ai_tool;
    const movieSubtitle = subtitleFile || subtitle || null;
    const movieThumbnail = thumb1 || thumbnail || null;
    const movieDisplayPicture = display_picture || null;

    // -3- Validation minimale
    if (!movieTitle || !movieDescription) {
      return res.status(400).json({
        error: "Le titre et la description sont obligatoires"
      });
    }

    if (movieDuration !== null && Number.isNaN(movieDuration)) {
      return res.status(400).json({
        error: "La durée du film est invalide"
      });
    }

    if (durationSeconds && movieDuration > 120) {
      return res.status(400).json({
        error: "La durée maximale est de 120 secondes"
      });
    }

    // -4- Création du film
    const newMovie = await Movie.create({
      title: movieTitle,
      description: movieDescription,
      duration: movieDuration,
      main_language: movieMainLanguage,
      release_year: movieReleaseYear,
      nationality,
      display_picture: movieDisplayPicture,
      trailer: filmFile || req.body.trailer || req.body.trailer_video || null,
      youtube_link: movieYoutubeLink,
      production: movieProduction,
      workshop: movieWorkshop,
      translation,
      synopsis: movieDescription,
      synopsis_anglais: movieSynopsisEnglish,
      subtitle: movieSubtitle,
      ai_tool: movieAiTool,
      picture1: thumb1 || req.body.picture1 || null,
      picture2: thumb2 || req.body.picture2 || null,
      picture3: thumb3 || req.body.picture3 || null,
      thumbnail: movieThumbnail,
      id_user
    });

    if (!movieThumbnail && filmFile) {
      try {
        const generatedPoster = await generatePosterFromVideo(filmFile);
        if (generatedPoster) {
          await newMovie.update({
            thumbnail: generatedPoster,
            display_picture: movieDisplayPicture || generatedPoster,
            picture1: thumb1 || req.body.picture1 || generatedPoster
          });
        }
      } catch (posterError) {
        console.warn("Poster generation failed:", posterError.message);
      }
    }

    // -5- Associer les catégories (N–N)
    let parsedCategories = categories;
    if (typeof categories === "string") {
      try {
        parsedCategories = JSON.parse(categories);
      } catch (parseError) {
        parsedCategories = [];
      }
    }

    if (parsedCategories?.length) {
      await newMovie.setCategories(parsedCategories);
    }

    // -6- Associer les collaborateurs
    let parsedCollaborators = collaborators;
    if (typeof collaborators === "string") {
      try {
        parsedCollaborators = JSON.parse(collaborators);
      } catch (parseError) {
        parsedCollaborators = [];
      }
    }

    if (parsedCollaborators?.length) {
      const collaboratorRecords = await Promise.all(
        parsedCollaborators
          .filter((collab) => collab?.email)
          .map(async (collab) => {
            const [record] = await Collaborator.findOrCreate({
              where: { email: collab.email },
              defaults: {
                first_name: collab.first_name || collab.firstname || "",
                last_name: collab.last_name || collab.lastname || "",
                email: collab.email,
                job: collab.job || null
              }
            });

            const needsUpdate =
              (collab.first_name && collab.first_name !== record.first_name)
              || (collab.last_name && collab.last_name !== record.last_name)
              || (collab.job && collab.job !== record.job);

            if (needsUpdate) {
              await record.update({
                first_name: collab.first_name || record.first_name,
                last_name: collab.last_name || record.last_name,
                job: collab.job || record.job
              });
            }

            return record;
          })
      );

      await newMovie.setCollaborators(collaboratorRecords);
    }

    res.status(201).json({
      message: "Film soumis avec succès",
      movie: newMovie
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}



///////////////////////////////////////////////////////////////////////// Modifier un film (ADMIN ou PRODUCER propriétaire)

async function updateMovie(req, res) {
  try {
    const { id } = req.params;

    const movie = await Movie.findByPk(id);

    if (!movie) {
      return res.status(404).json({ error: "Film non trouvé" });
    }

    // Sécurité : ADMIN peut tout modifier, PRODUCER seulement ses films
    if (req.user.role !== "ADMIN" && movie.id_user !== req.user.id_user) {
      return res.status(403).json({
        error: "Vous n'êtes pas autorisé à modifier ce film"
      });
    }

    // Gestion fichiers uploadés (film, vignettes, SRT)
    const files = req.files || {};
    const filmFile = files.filmFile?.[0]?.filename || null;
    const thumb1 = files.thumbnail1?.[0]?.filename || null;
    const thumb2 = files.thumbnail2?.[0]?.filename || null;
    const thumb3 = files.thumbnail3?.[0]?.filename || null;
    const subtitleFile = files.subtitlesSrt?.[0]?.filename || null;

    const updateData = { ...req.body };
    if (filmFile) updateData.trailer = filmFile;
    if (thumb1) updateData.picture1 = thumb1;
    if (thumb2) updateData.picture2 = thumb2;
    if (thumb3) updateData.picture3 = thumb3;
    if (thumb1) updateData.thumbnail = thumb1;
    if (subtitleFile) updateData.subtitle = subtitleFile;

    await movie.update(updateData);

    res.status(200).json({
      message: "Film mis à jour avec succès",
      movie
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


// FIX B-04: helper pour supprimer un fichier en cherchant dans uploads/ ET uploads/uploaded/
// Le watcher YouTube déplace les vidéos dans uploaded/ avec un préfixe timestamp,
// donc il faut chercher aux deux endroits pour garantir la suppression.
function unlinkUploadFile(filename) {
  if (!filename) return;
  const candidates = [
    path.join(uploadDir, filename),
    path.join(uploadedDir, filename),
    // Si filename contient déjà "uploaded/" comme préfixe (chemin relatif stocké en DB)
    path.join(uploadDir, filename.replace(/^uploaded\//, ""))
  ];
  for (const filePath of candidates) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      if (err.code !== "ENOENT") {
        console.error(`Failed to delete file ${filePath}:`, err.message);
      }
    }
  }
}

///////////////////////////////////////////////////////////////////////////////////////// Supprimer un film

async function deleteMovie(req, res) {
  try {
    const { id } = req.params;
    /* BUG #4 FIX: AuthMiddleware sets req.user, NOT req.userId.
       Using req.userId was always undefined → ownership check was
       always false → any PRODUCER could delete any film. */
    const userId = req.user.id_user;
    const userRole = req.user?.role;

    const movie = await Movie.findByPk(id);

    if (!movie) {
      return res.status(404).json({ error: "Film non trouvé" });
    }

    // Se l'utente è PRODUCER, verifica che sia il proprietario del film
    if (userRole === "PRODUCER" && movie.id_user !== userId) {
      return res.status(403).json({ error: "Vous n'êtes pas autorisé à supprimer ce film" });
    }

    // FIX B-04: Utilise unlinkUploadFile qui cherche dans uploads/ ET uploads/uploaded/
    const fileFields = ["trailer", "display_picture", "picture1", "picture2", "picture3", "thumbnail", "subtitle"];
    for (const field of fileFields) {
      unlinkUploadFile(movie[field]);
    }

    await movie.destroy();

    res.status(200).json({ message: "Film supprimé" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}



///////////////////////////////////////////////////////////////////////// Mettre à jour le statut

async function updateMovieStatus(req, res) {
  try {
    const { id } = req.params;
    const { selection_status, jury_comment, force_transition } = req.body;

    const allowed = [
      "submitted",
      "assigned",
      "to_discuss",
      "candidate",
      "awarded",
      "refused",
      "selected",
      "finalist"
    ];
    if (!allowed.includes(selection_status)) {
      return res.status(400).json({ error: "Statut invalide" });
    }

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

    const previousStatus = movie.selection_status;

    // FIX B-02: transitionMap complétée avec toutes les transitions manquantes :
    //   • to_discuss  → selected, finalist  (étaient absentes → "Passer en Sélection/Finaliste" bloqué)
    //   • selected    → finalist            (manquait → "Passer Finaliste" bloqué depuis Sélectionné)
    //   • candidate   → finalist            (manquait → cohérence avec selected)
    //   • awarded     → finalist            (manquait → "Retirer du palmarès" bloqué)
    //   • refused     → submitted           (manquait → "Remettre en attente" bloqué)
    const transitionMap = {
      submitted:  ["assigned", "candidate", "refused"],
      assigned:   ["to_discuss", "candidate", "refused"],
      to_discuss: ["selected", "finalist", "candidate", "refused"],
      candidate:  ["finalist", "awarded", "refused"],
      selected:   ["finalist", "candidate", "awarded", "refused"],
      finalist:   ["awarded", "candidate", "refused"],
      awarded:    ["finalist"],
      refused:    ["submitted"]
    };

    const allowedTargets = transitionMap[previousStatus] || [];
    const forceTransition = Boolean(force_transition);
    if (
      !forceTransition
      && previousStatus !== selection_status
      && !allowedTargets.includes(selection_status)
    ) {
      return res.status(400).json({
        error: `Transition invalide: ${previousStatus} -> ${selection_status}`,
      });
    }

    movie.selection_status = selection_status;
    if (typeof jury_comment === "string" && jury_comment.trim()) {
      movie.jury_comment = jury_comment.trim();
    }
    await movie.save();

    let rejectEmail = null;
    if (
      previousStatus !== "refused"
      && selection_status === "refused"
      && movie?.Producer?.email
    ) {
      try {
        await EmailController.sendVideoRejectedEmail({
          to: movie.Producer.email,
          firstName: movie.Producer.first_name,
          movieTitle: movie.title,
          juryComment: movie.jury_comment,
        });
        rejectEmail = "sent";
      } catch (emailError) {
        console.warn("Reject email error:", emailError.message);
        rejectEmail = "failed";
      }
    }

    res.json({ message: "Statut mis à jour", movie, rejectEmail, forceTransition });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

///////////////////////////////////////////////////////////////////////// Promotion candidature par jury

async function promoteMovieToCandidateByJury(req, res) {
  try {
    const { id } = req.params;
    const { jury_comment } = req.body || {};
    const id_user = req.user.id_user;

    const movie = await Movie.findByPk(id, {
      include: [
        {
          model: User,
          as: "Juries",
          attributes: ["id_user"],
          through: { attributes: [] },
          required: false
        }
      ]
    });

    if (!movie) {
      return res.status(404).json({ error: "Film non trouvé" });
    }

    const assignedToJury = (movie.Juries || []).some((jury) => jury.id_user === id_user);
    if (!assignedToJury) {
      return res.status(403).json({ error: "Ce film n'est pas assigné à ce jury." });
    }

    if (movie.selection_status !== "to_discuss") {
      return res.status(400).json({ error: "Le film doit être en statut to_discuss pour proposer une candidature." });
    }

    // Proposition jury: l'admin doit valider/refuser ensuite.
    movie.selection_status = "selected";
    movie.assigned_jury_id = id_user;
    if (typeof jury_comment === "string") {
      movie.jury_comment = jury_comment.trim();
    }
    await movie.save();

    return res.json({ message: "Film proposé à la nomination", movie });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

///////////////////////////////////////////////////////////////////////// Films assignés à un jury

async function getAssignedMovies(req, res) {
  try {
    const id_user = req.user.id_user;

    const movies = await Movie.findAll({
      where: {
        selection_status: {
          [Op.in]: ["assigned", "to_discuss", "candidate", "selected", "finalist"]
        }
      },
      include: [
        {
          model: Categorie,
          through: { attributes: [] }
        },
        {
          model: Collaborator,
          through: { attributes: [] }
        },
        {
          model: Award,
          required: false
        },
        {
          model: User,
          as: "Producer",
          attributes: ["id_user", "first_name", "last_name", "known_by_mars_ai"]
        },
        {
          model: User,
          as: "NominatorJury",
          attributes: ["id_user", "first_name", "last_name", "email"],
          required: false
        },
        {
          model: User,
          as: "Juries",
          attributes: ["id_user", "first_name", "last_name", "email", "role"],
          through: { attributes: [] },
          where: { id_user }
        }
      ]
    });

    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

///////////////////////////////////////////////////////////////////////// Assigner des catégories (ADMIN)

async function updateMovieCategories(req, res) {
  try {
    const { id } = req.params;
    let { categories } = req.body;

    if (typeof categories === "string") {
      try {
        categories = JSON.parse(categories);
      } catch (parseError) {
        categories = [];
      }
    }

    if (!Array.isArray(categories)) {
      categories = [];
    }

    const categoryIds = categories
      .map((value) => Number(value))
      .filter((value) => Number.isInteger(value));

    const movie = await Movie.findByPk(id);
    if (!movie) {
      return res.status(404).json({ error: "Film non trouvé" });
    }

    await movie.setCategories(categoryIds);

    const updatedMovie = await Movie.findByPk(id, {
      include: [
        { model: Categorie, through: { attributes: [] } }
      ]
    });

    res.json({ message: "Catégories mises à jour", movie: updatedMovie });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

///////////////////////////////////////////////////////////////////////// Assigner des jurys (ADMIN)

async function updateMovieJuries(req, res) {
  try {
    const { id } = req.params;
    let { juryIds } = req.body;

    if (typeof juryIds === "string") {
      try {
        juryIds = JSON.parse(juryIds);
      } catch (parseError) {
        juryIds = [];
      }
    }

    if (!Array.isArray(juryIds)) {
      juryIds = [];
    }

    const normalizedIds = juryIds
      .map((value) => Number(value))
      .filter((value) => Number.isInteger(value));

    const movie = await Movie.findByPk(id);
    if (!movie) {
      return res.status(404).json({ error: "Film non trouvé" });
    }

    const juries = await User.findAll({
      where: {
        id_user: normalizedIds,
        role: "JURY"
      }
    });

    await movie.setJuries(juries);

    // Si au moins un jury est assigné et le statut n'est pas encore avancé → passer à "assigned"
    const advancedStatuses = ["to_discuss", "candidate", "selected", "finalist", "awarded", "refused"];
    if (juries.length > 0 && !advancedStatuses.includes(movie.selection_status)) {
      movie.selection_status = "assigned";
      await movie.save();
    }

    const updatedMovie = await Movie.findByPk(id, {
      include: [
        {
          model: User,
          as: "Juries",
          attributes: ["id_user", "first_name", "last_name", "email", "role"],
          through: { attributes: [] }
        }
      ]
    });

    res.json({ message: "Jurys assignés", movie: updatedMovie });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

///////////////////////////////////////////////////////////////////////// Assigner des collaborateurs (PRODUCER/ADMIN)

async function updateMovieCollaborators(req, res) {
  try {
    const { id } = req.params;
    let { collaborators } = req.body;

    if (typeof collaborators === "string") {
      try {
        collaborators = JSON.parse(collaborators);
      } catch (parseError) {
        collaborators = [];
      }
    }

    if (!Array.isArray(collaborators)) {
      collaborators = [];
    }

    const movie = await Movie.findByPk(id);
    if (!movie) {
      return res.status(404).json({ error: "Film non trouvé" });
    }

    if (req.user.role !== "ADMIN" && movie.id_user !== req.user.id_user) {
      return res.status(403).json({ error: "Accès refusé" });
    }

    const collaboratorRecords = await Promise.all(
      collaborators
        .filter((collab) => collab?.email)
        .map(async (collab) => {
          const [record] = await Collaborator.findOrCreate({
            where: { email: collab.email },
            defaults: {
              first_name: collab.first_name || collab.firstname || "",
              last_name: collab.last_name || collab.lastname || "",
              email: collab.email,
              job: collab.job || null
            }
          });
          const needsUpdate =
            (collab.first_name && collab.first_name !== record.first_name)
            || (collab.last_name && collab.last_name !== record.last_name)
            || (collab.job && collab.job !== record.job);
          if (needsUpdate) {
            await record.update({
              first_name: collab.first_name || record.first_name,
              last_name: collab.last_name || record.last_name,
              job: collab.job || record.job
            });
          }
          return record;
        })
    );

    await movie.setCollaborators(collaboratorRecords);

    // FIX B-01: Le bloc ci-dessous (gestion des fichiers + mise à jour du film) contenait
    // du code orphelin copié depuis updateMovieJuries qui référençait une variable "juries"
    // inexistante dans ce contexte → ReferenceError à chaque appel.
    // Correction : le code orphelin (movie.setJuries / advancedStatuses) est supprimé.
    // Seule la gestion légitime des fichiers uploadés est conservée.
    if (req.user.role === "ADMIN" || movie.id_user === req.user.id_user) {
      const files = req.files || {};
      const filmFile = files.filmFile?.[0]?.filename || null;
      const thumb1 = files.thumbnail1?.[0]?.filename || null;
      const thumb2 = files.thumbnail2?.[0]?.filename || null;
      const thumb3 = files.thumbnail3?.[0]?.filename || null;
      const subtitleFile = files.subtitlesSrt?.[0]?.filename || null;

      const updateData = { ...req.body };
      // Supprimer les champs non-colonne qui viendraient du body pour éviter les erreurs Sequelize
      delete updateData.collaborators;

      if (filmFile) updateData.trailer = filmFile;
      if (thumb1) updateData.picture1 = thumb1;
      if (thumb2) updateData.picture2 = thumb2;
      if (thumb3) updateData.picture3 = thumb3;
      if (thumb1) updateData.thumbnail = thumb1;
      if (subtitleFile) updateData.subtitle = subtitleFile;

      await movie.update(updateData);
    }

    const updatedMovie = await Movie.findByPk(id, {
      include: [
        { model: Collaborator, through: { attributes: [] } }
      ]
    });

    res.json({ message: "Collaborateurs mis à jour", movie: updatedMovie });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function phase2Movies(req, res) {
  // Phase 2 publique : films en délibération / sélectionnés / finalistes
  // Statuts éligibles : to_discuss, selected, candidate, finalist
  try {
    const phase2 = await Movie.findAll({
      where: {
        selection_status: { [Op.in]: ["to_discuss", "selected", "candidate", "finalist"] }
      },
      include: [{ model: Award, required: false }],
      order: [["createdAt", "DESC"]],
      limit: 50
    });
    res.json(phase2);
  } catch (error) {
    console.error("phase2Movies error:", error);
    res.status(500).json({
      error: error.message,
      name: error.name,
      detail: error?.parent?.sqlMessage || error?.original?.message
    });
  }
}

async function phase3Movies(req, res) {
  // Phase 3 publique : palmarès — films primés uniquement
  try {
    const movies = await Movie.findAll({
      where: {
        selection_status: "awarded"
      },
      include: [{ model: Award, required: false }],
      order: [["createdAt", "DESC"]],
      limit: 50
    });
    res.json(movies);
  } catch (error) {
    console.error("phase3Movies error:", error);
    res.status(500).json({
      error: error.message,
      name: error.name,
      detail: error?.parent?.sqlMessage || error?.original?.message
    });
  }
}





export default {
  getMovies,
  getMyMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  updateMovieStatus,
  promoteMovieToCandidateByJury,
  getAssignedMovies,
  updateMovieCategories,
  updateMovieJuries,
  updateMovieCollaborators,
  phase2Movies,
  phase3Movies
};