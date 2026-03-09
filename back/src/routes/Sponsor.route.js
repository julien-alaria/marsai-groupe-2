import express from "express";
import SponsorController from "../controllers/SponsorController.js";
import AuthMiddleware from "../middlewares/AuthMiddleware.js";
import upload from "../middlewares/uploadSponsorLogo.js";

const sponsorRouter = express.Router();



// PUBLIC

sponsorRouter.get("/", SponsorController.getAllSponsors);

sponsorRouter.get("/:id", SponsorController.getSponsorById);




// ADMIN ONLY
 
sponsorRouter.post("/", AuthMiddleware(["ADMIN"]), upload.single("logo"),SponsorController.createSponsor);

sponsorRouter.put("/:id", AuthMiddleware(["ADMIN"]), upload.single("logo"), SponsorController.updateSponsor);

sponsorRouter.delete("/:id", AuthMiddleware(["ADMIN"]), SponsorController.deleteSponsor);

export default sponsorRouter;

