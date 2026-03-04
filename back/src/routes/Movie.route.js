import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import MovieController from "../controllers/MovieController.js";
import AuthMiddleware from "../middlewares/AuthMiddleware.js";

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

const filmUpload = upload.fields([
  { name: "filmFile",     maxCount: 1 },
  { name: "thumbnail1",   maxCount: 1 },
  { name: "thumbnail2",   maxCount: 1 },
  { name: "thumbnail3",   maxCount: 1 },
  { name: "subtitlesSrt", maxCount: 1 }
]);

// PUBLIC
movieRouter.get("/", MovieController.getMovies);

// PRODUCER
movieRouter.get("/mine", AuthMiddleware(["PRODUCER"]), MovieController.getMyMovies);

// FIX: Single unified upload route for film submission (PRODUCER + ADMIN).
// Previously two routes existed (POST /movies and POST /movies/upload) and
// the frontend only called /movies/upload — making admin film submission impossible.
movieRouter.post("/upload", AuthMiddleware(["PRODUCER", "ADMIN"]), filmUpload, MovieController.createMovie);

// Update collaborators (PRODUCER or ADMIN)
movieRouter.put("/:id/collaborators", AuthMiddleware(["ADMIN", "PRODUCER"]), MovieController.updateMovieCollaborators);

// JURY
// FIX: Added "ADMIN" role so admins can audit the assigned-films view without impersonating jury.
movieRouter.get("/assigned", AuthMiddleware(["JURY", "ADMIN"]), MovieController.getAssignedMovies);

// Jury-initiated promotion to candidate
movieRouter.put("/:id/jury-candidate", AuthMiddleware(["JURY"]), MovieController.promoteMovieToCandidateByJury);

// Get single film (public)
movieRouter.get("/:id", MovieController.getMovieById);

// ADMIN
movieRouter.delete("/:id", AuthMiddleware(["ADMIN"]), MovieController.deleteMovie);
movieRouter.put("/:id", AuthMiddleware(["ADMIN"]), MovieController.updateMovie);
movieRouter.put("/:id/status", AuthMiddleware(["ADMIN"]), MovieController.updateMovieStatus);
movieRouter.put("/:id/categories", AuthMiddleware(["ADMIN"]), MovieController.updateMovieCategories);
movieRouter.put("/:id/juries", AuthMiddleware(["ADMIN"]), MovieController.updateMovieJuries);

export default movieRouter;
