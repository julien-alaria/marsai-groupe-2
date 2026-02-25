import db from "../models/index.js";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import { Op } from "sequelize";

const {
  Movie,
  Categorie,
  Collaborator,
  User,
  Award
} = db;

const uploadDir = path.join(process.cwd(), "uploads");

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
    console.error("createMovie error:", error);
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
    // ...
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

    // -3.5- Mettre à jour l'origine de connaissance du festival si fournie
    // if (knownByMarsAi) {
    //   await User.update(
    //     { known_by_mars_ai: knownByMarsAi },
    //     { where: { id_user } }
    //   );
    // }

    // -4-Création du film
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
      // selection_status = 'submitted' automatiquement
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

    // -5-Associer les catégories (N–N)
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



///////////////////////////////////////////////////////////////////////// Modifier un film (ADMIN uniquement)

async function updateMovie(req, res) {
  try {
    const { id } = req.params;

    const movie = await Movie.findByPk(id);

    if (!movie) {
      return res.status(404).json({ error: "Film non trouvé" });
    }

    // Sécurité : uniquement ADMIN
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        error: "Seul un administrateur peut modifier un film"
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




///////////////////////////////////////////////////////////////////////////////////////// Supprimer un film
 
async function deleteMovie(req, res) {
  try {
    const { id } = req.params;

    const movie = await Movie.findByPk(id);

    if (!movie) {
      return res.status(404).json({ error: "Film non trouvé" });
    }

    await movie.destroy();

    res.status(200).json({
      message: "Film supprimé"
    });
    //correction du status 204 (pas de JSON avec 204)
    //return res.status(204).send(); 

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}



///////////////////////////////////////////////////////////////////////// Mettre à jour le statut

async function updateMovieStatus(req, res) {
  try {
    const { id } = req.params;
    const { selection_status, jury_comment } = req.body;

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

    const movie = await Movie.findByPk(id);
    if (!movie) {
      return res.status(404).json({ error: "Film non trouvé" });
    }

    movie.selection_status = selection_status;
    if (typeof jury_comment === "string" && jury_comment.trim()) {
      movie.jury_comment = jury_comment.trim();
    }
    await movie.save();

    res.json({ message: "Statut mis à jour", movie });
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
      return res.status(400).json({ error: "Le film doit être en statut to_discuss pour être promu candidat." });
    }

    movie.selection_status = "candidate";
    if (typeof jury_comment === "string") {
      movie.jury_comment = jury_comment.trim();
    }
    await movie.save();

    return res.json({ message: "Film promu à la candidature", movie });
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

    // Gestione file upload (ADMIN o owner)
    if (req.user.role === "ADMIN" || movie.id_user === req.user.id_user) {
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
  updateMovieCollaborators
};
