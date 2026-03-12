import express from "express";
import FestivalController from "../controllers/FestivalController.js";
import AuthMiddleware from "../middlewares/AuthMiddleware.js";

const festivalRouter = express.Router();

// PUBLIC — le front public lit la phase active
festivalRouter.get("/phase", FestivalController.getPhase);

// ADMIN — seul l'admin peut changer la phase
festivalRouter.put("/phase", AuthMiddleware(["ADMIN"]), FestivalController.setPhase);

export default festivalRouter;