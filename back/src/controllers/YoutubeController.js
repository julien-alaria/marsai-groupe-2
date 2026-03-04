import fs from "fs";
import path from "path";
import { google } from "googleapis";

const TOKEN_PATH = path.join(process.cwd(), "config/youtube_token.json");
let oauth2Client;
let tokenData;

//Initialise le client OAuth2
async function initYoutubeAuth() {
  oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "http://localhost:3000/google/oauth2callback"
  );

  if (!fs.existsSync(TOKEN_PATH)) {
    throw new Error("Token non trouvé, connectez-vous via /google/auth");
  }

  tokenData = JSON.parse(fs.readFileSync(TOKEN_PATH));
  oauth2Client.setCredentials(tokenData);

  // Valide le token au démarrage
  await oauth2Client.getAccessToken();
  // refresh
  oauth2Client.on("tokens", (tokens) => {
    tokenData = { ...tokenData, ...tokens };
    // écriture dans le JSON
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokenData, null, 2));
    console.log("Token mis à jour dans le JSON");
  });

  console.log("✓ initYoutubeAuth ON");
}

// Retourne le client OAuth2 déjà initialisé
function getOAuth2Client() {
  if (!oauth2Client) throw new Error("OAuth2 non initialisé, appelez initYoutubeAuth() au démarrage");
  return oauth2Client;
}

// Verification que GoogleAuth est actif
function isGoogleAuthActive() {
  if (oauth2Client) {
    return true;
  } else {
    return false;
  }
}

//Upload vidéo
async function uploadVideo(filePath, title, description, privacyStatus = "unlisted") {
  if (!fs.existsSync(filePath)) throw new Error("Fichier introuvable");

  // retourne OAuth2 déjà initialisé
  const client = getOAuth2Client();
  // crée un objet YouTube API prêt à l'emploi
  const youtube = google.youtube({ version: "v3", auth: client });

  try {
    const response = await youtube.videos.insert({
      // défini quelles parties de la ressource seront renvoyées
      part: ["snippet", "status", "contentDetails"],
      requestBody: {
        // titre et description
        snippet: { title, description },
        // visibilité
        status: { privacyStatus },
      },
      // contient le fichier vidéo (envoyé en stream)
      media: { body: fs.createReadStream(filePath) },
    });

    if (!response?.data?.id) throw new Error("Réponse YouTube invalide");

    // return response.data;
    return {
      id: response.data.id,
      licensedContent: response.data.contentDetails?.licensedContent ?? false,
      privacyStatus: response.data.status?.privacyStatus,
      duration: response.data.contentDetails?.duration
    };

  } catch (err) {
    if (err.response?.data?.error?.errors?.[0]?.reason === "quotaExceeded") {
      throw new Error("Quota YouTube dépassé pour aujourd’hui");
    }
    throw err;
  }
}

export default {
  initYoutubeAuth,
  getOAuth2Client,
  isGoogleAuthActive,
  uploadVideo,
};
