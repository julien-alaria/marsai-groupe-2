import express from "express";
import NewsLetterController from "../controllers/NewsLetterController.js";

const newsLetterRouter = express.Router();

newsLetterRouter.post("/", NewsLetterController.main);

export default newsLetterRouter;