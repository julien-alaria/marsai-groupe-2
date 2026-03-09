import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import MovieController from "../controllers/MovieController.js";
import AuthMiddleware from "../middlewares/AuthMiddleware.js";

// const router = express.Router();
const movieRouter = express.Router();

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${unique}${ext}`);
  }
});

const upload = multer({ storage });

// PUBLIC
// Voir tous les films (public)
movieRouter.get("/", MovieController.getMovies);

// PRODUCER
// Seulement pour PRODUCER connecté (PRODUCER)
movieRouter.get("/mine", AuthMiddleware(["PRODUCER"]),MovieController.getMyMovies);

// Soumettre un film (PRODUCER) NOUVELLE URL movies/upload
movieRouter.post("/upload", AuthMiddleware(["PRODUCER"]),
  upload.fields([
    { name: "filmFile", maxCount: 1 },
    { name: "thumbnail1", maxCount: 1 },
    { name: "thumbnail2", maxCount: 1 },
    { name: "thumbnail3", maxCount: 1 },
    { name: "subtitlesSrt", maxCount: 1 }
  ]),
  MovieController.createMovie
);

// JURY
// Films assignés (JURY)
movieRouter.get("/assigned", AuthMiddleware(["JURY"]),MovieController.getAssignedMovies);
movieRouter.put("/:id/jury-candidate", AuthMiddleware(["JURY"]), MovieController.promoteMovieToCandidateByJury);

// Voir un film par ID (public)
movieRouter.get("/:id", MovieController.getMovieById);

// Soumettre un film (PRODUCER & ADMIN uniquement)
movieRouter.post("/", 
  AuthMiddleware(["ADMIN","PRODUCER"]),
  upload.fields([
    { name: "filmFile", maxCount: 1 },
    { name: "thumbnail1", maxCount: 1 },
    { name: "thumbnail2", maxCount: 1 },
    { name: "thumbnail3", maxCount: 1 },
    { name: "subtitlesSrt", maxCount: 1 }
  ]),
  MovieController.createMovie
);


// ADMIN
// Supprimer un film (ADMIN)
movieRouter.delete("/:id", AuthMiddleware(["ADMIN"]),MovieController.deleteMovie);

// Modifier un film (ADMIN)
movieRouter.put(
  "/:id",
  AuthMiddleware(["ADMIN"]),
  upload.fields([
    { name: "filmFile", maxCount: 1 },
    { name: "thumbnail1", maxCount: 1 },
    { name: "thumbnail2", maxCount: 1 },
    { name: "thumbnail3", maxCount: 1 },
    { name: "subtitlesSrt", maxCount: 1 }
  ]),
  MovieController.updateMovie
);

// Assigner un film à des juries(ADMIN)
// movieRouter.post("/:id/assign-juries", AuthMiddleware(["ADMIN"]),MovieController.assignJuriesToMovie);

// Mettre à jour le statut (ADMIN)
movieRouter.put("/:id/status", AuthMiddleware(["ADMIN"]),MovieController.updateMovieStatus);

// Assigner catégories (ADMIN)
movieRouter.put("/:id/categories", AuthMiddleware(["ADMIN"]),MovieController.updateMovieCategories);

// Assigner jurys (ADMIN)
movieRouter.put("/:id/juries", AuthMiddleware(["ADMIN"]),MovieController.updateMovieJuries);

// Assigner un film à des juries(ADMIN)
// movieRouter.post("/:id/assign-juries", AuthMiddleware(["ADMIN"]),MovieController.assignJuriesToMovie);

// Assigner collaborateurs (PRODUCER/ADMIN)
movieRouter.put("/:id/collaborators", AuthMiddleware(["ADMIN", "PRODUCER"]),MovieController.updateMovieCollaborators);


export default movieRouter;
