import express from "express";
import NewsLetterController from "../controllers/NewsLetterController";

const newsLetterRouter = express.Router();

newsLetterRouter.post("/", NewsLetterController.main);

export default newsLetterRouter;