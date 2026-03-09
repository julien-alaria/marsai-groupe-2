import express from "express";

import userRouter from "./User.route.js";
import movieRouter from "./Movie.route.js";
import authRouter from "./Auth.route.js";
import awardRouter from "./Award.route.js";
import voteRouter from "./Vote.route.js";
import categorieRouter from "./Categorie.route.js";
import reservationRouter from "./Reservation.route.js";
import eventRouter from "./Event.route.js";
import dashboardRouter from "./Dashboard.route.js";
import googleRouter from "./googleAuth.route.js";
import youtubeRouter from "./Youtube.route.js";
import sponsorRouter from "./Sponsor.route.js";


const router = express.Router();

/**
 * Enregistrement de toutes les routes principales
 * Chaque groupe de routes est préfixé par son chemin
 */

router.use("/auth", authRouter);      // Routes d'authentification

router.use("/users", userRouter);     // Routes de gestion utilisateurs

router.use("/movies", movieRouter);   // Routes de gestion films/vidéos

router.use("/awards", awardRouter);  // Routes de gestion awards

router.use("/votes", voteRouter); // Routes de gestion votes

router.use("/categories", categorieRouter); // Routes de gestion catégories

router.use("/reservations", reservationRouter); // Routes de gestion réservations

router.use("/events", eventRouter); // Routes de gestion réservations

router.use("/admin/dashboard", dashboardRouter); // Routes de gestion du dashboard admin

router.use("/google", googleRouter) // Routes d'authentification Google

router.use("/sponsors", sponsorRouter);// Routes de gestion sponsors

// pour test via CLIENT HTTP
// router.use("/youtube", youtubeRouter);

export default router;
