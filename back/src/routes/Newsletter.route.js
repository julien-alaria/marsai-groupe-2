import express from "express";
import NewsletterController from "../controllers/NewsletterController.js";
import AuthMiddleware from "../middlewares/AuthMiddleware.js";
import EmailController from "../controllers/EmailController.js";

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
newsletterRouter.post(
  "/test-email",
  AuthMiddleware(["ADMIN"]),
  NewsletterController.sendTestEmail
);
newsletterRouter.post(
  "/test-reject-email",
  AuthMiddleware(["ADMIN"]),
  EmailController.sendRejectTest
);
newsletterRouter.post(
  "/movie/:id/send-reject-email",
  AuthMiddleware(["ADMIN"]),
  EmailController.sendRejectForMovie
);

export default newsletterRouter;
