import express from "express";
import { google } from "googleapis";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// New: Import du controller pour gérer les uploads après l'authentification
import youtubeController from "../controllers/YoutubeController.js";


const googleRouter = express.Router();

dotenv.config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:3000/google/oauth2callback"
);

const scopes = [
  "https://www.googleapis.com/auth/youtube.upload"
];

// Redirection vers Google
googleRouter.get("/auth", (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent", // refresh_token
    scope: scopes,
  });

  res.redirect(authUrl);
});

// Callback OAuth après Auth
googleRouter.get("/oauth2callback", async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send("Code manquant");
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Écrit le token dans le fichier
    const tokenPath = path.join(process.cwd(), "config/youtube_token.json");
    fs.writeFileSync(tokenPath, JSON.stringify(tokens, null, 2));
    console.log("Tokens sauvegardés dans :", tokenPath);
    // console.log("Tokens obtenus :", tokens);

    res.send("✓ Authentification réussie ! Vous pouvez maintenant uploader des vidéos via le controller.");
  } catch (error) {
    console.error("Erreur OAuth :", error);
    res.status(500).send("Erreur d'authentification");
  }
});


// Statut de la connexion Google/YouTube
googleRouter.get("/status", (req, res) => {
  try {
    const active = youtubeController.isGoogleAuthActive();
    res.json({ active });
  } catch (err) {
    res.json({ active: false });
  }
});
export default googleRouter;
