import express from "express";
import NewsletterController from "../controllers/NewsletterController.js";
import AuthMiddleware from "../middlewares/AuthMiddleware.js";

const newsletterRouter = express.Router();

newsletterRouter.post("/subscribe", NewsletterController.subscribe);
newsletterRouter.get(
  "/subscribers",
  AuthMiddleware(["ADMIN"]),
  NewsletterController.listSubscribers
);
newsletterRouter.post(
  "/send",
  AuthMiddleware(["ADMIN"]),
  NewsletterController.sendNewsletter
);

export default newsletterRouter;
