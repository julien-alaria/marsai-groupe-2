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
  { name: "filmFile", maxCount: 1 },
  { name: "thumbnail1", maxCount: 1 },
  { name: "thumbnail2", maxCount: 1 },
  { name: "thumbnail3", maxCount: 1 },
  { name: "subtitlesSrt", maxCount: 1 }
]);

// PUBLIC
movieRouter.get("/", MovieController.getMovies);

// PUBLIC PHASE2 50 FILMS
movieRouter.get("/phase2", MovieController.phase2Movies);

// PUBLIC PHASE3 10 FILMS
movieRouter.get("/phase3", MovieController.phase3Movies)

// PRODUCER
movieRouter.get("/mine", AuthMiddleware(["PRODUCER"]), MovieController.getMyMovies);
movieRouter.post("/upload", AuthMiddleware(["PRODUCER", "ADMIN"]), filmUpload, MovieController.createMovie);

// JURY
movieRouter.get("/assigned", AuthMiddleware(["JURY", "ADMIN"]), MovieController.getAssignedMovies);
movieRouter.put("/:id/jury-candidate", AuthMiddleware(["JURY"]), MovieController.promoteMovieToCandidateByJury);

// ADMIN & PRODUCER
movieRouter.delete("/:id", AuthMiddleware(["ADMIN", "PRODUCER"]), MovieController.deleteMovie);
movieRouter.put("/:id", AuthMiddleware(["ADMIN", "PRODUCER"]), filmUpload, MovieController.updateMovie);
movieRouter.put("/:id/collaborators", AuthMiddleware(["ADMIN", "PRODUCER"]), MovieController.updateMovieCollaborators);

// ADMIN
movieRouter.put("/:id/status", AuthMiddleware(["ADMIN"]), MovieController.updateMovieStatus);
movieRouter.put("/:id/categories", AuthMiddleware(["ADMIN"]), MovieController.updateMovieCategories);
movieRouter.put("/:id/juries", AuthMiddleware(["ADMIN"]), MovieController.updateMovieJuries);

// PUBLIC
movieRouter.get("/:id", MovieController.getMovieById);

export default movieRouter;
