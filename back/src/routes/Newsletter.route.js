import express from "express";
import NewsletterController from "../controllers/NewsletterController.js";

const newsletterRouter = express.Router();

newsletterRouter.post("/", NewsletterController.main);

export default newsletterRouter;



// import express from "express";
// import NewsletterController from "../controllers/NewsletterController.js";
// import AuthMiddleware from "../middlewares/AuthMiddleware.js";

// const newsletterRouter = express.Router();

// // POST /newsletter/subscribe — inscription à la newsletter
// newsletterRouter.post("/subscribe", NewsletterController.subscribe);

// // GET /newsletter/subscribers — liste des abonnés (admin)
// newsletterRouter.get("/subscribers", AuthMiddleware(["ADMIN"]), NewsletterController.getSubscribers);

// // POST /newsletter/send — envoi d'une newsletter (admin)
// newsletterRouter.post("/send", AuthMiddleware(["ADMIN"]), NewsletterController.send);

// // POST /newsletter/movie/:id/send-reject-email — email de rejet d'un film
// newsletterRouter.post("/movie/:id/send-reject-email", AuthMiddleware(["ADMIN"]), NewsletterController.sendRejectEmail);

// export default newsletterRouter;