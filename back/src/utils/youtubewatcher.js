import chokidar from "chokidar";
import fs from "fs";
import path from "path";
import youtubeController from "../controllers/YoutubeController.js";
import { uploadFile } from "./s3.js";

// défini le chemin absolu du dossier ou les fichiers vidéo sont placés avant d'être traités
const uploadFolder = path.join(process.cwd(), "uploads");
const uploadedFolder = path.join(uploadFolder, "uploaded");
const allowedExtensions = [".mp4", ".avi", ".m4v", ".mov", ".mpg", ".mpeg", ".wmv"];
const queue = [];
let isUploading = false;

// Tentative de upload (si erreur reseau ou server -> retries n fois)
async function uploadWithRetry(filePath, filename, retries = 3) {
  // filePath: chemin vers le fichier à upload
  // filename: nom du fichier 
  // retries: nombre max de tentatives

  // boucle for qui tente l'upload
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // supprime l'extension pour affichage
      const titleWithoutExt = path.parse(filename).name;
      // appelle la fonction d'upload sur Youtube
      return await youtubeController.uploadVideo(
        filePath,
        titleWithoutExt,
        "marsai",
        "unlisted"
      );
    } catch (err) {
      // Déterminer si l'erreur est "retryable" (réexécuter l'opération après erreur)
      const retryable =
        // si coupure de connexion
        err.code === "ECONNRESET" ||
        // si err de délai d'attente
        err.code === "ETIMEDOUT" ||
        // si err côté serveur
        err.response?.status >= 500;
      // si err === false ou nd de retries atteint on lance l'erreur
      if (!retryable || attempt === retries) throw err;
      // affiche un avertissement en console à chaque nouvelle tentative de upload
      console.warn(`Retry ${attempt} pour ${filename}...`);
      // introduit un délai avec temps d'attente qui progresse de façon exponentielle à chaque tentative
      await new Promise(res => setTimeout(res, 2000 * attempt));
    }
  }
}

// Traitement de la file d’attente (s'assurer que les fichiers sont uploadés un  par un et retry auto si server error)
async function processQueue() {
  // booléen qui indique si un uload est en cours
  if (isUploading || queue.length === 0) return;
  // extraction du premier fichier, retire le premier élément de la queue et le retourne
  const { filePath, filename } = queue.shift();
  isUploading = true;

  try {
    console.log(`Upload en cours : ${filename}`);

    const data = await uploadWithRetry(filePath, filename);

    console.log(`✓ Upload terminé : ${data.id}`);
    console.log(`Content licensed : ${data.licensedContent}`);
    console.log(`URL YouTube : https://www.youtube.com/watch?v=${data.id}`);

    // Appelle de la fonction de s3.js pour upload dans Scaleway
    await uploadFile(filePath);

    // déplace le fichier uploader vers back/uploads/uploaded
    if (!fs.existsSync(uploadedFolder)) fs.mkdirSync(uploadedFolder, { recursive: true });
    const destPath = path.join(uploadedFolder, `${Date.now()}-${filename}`);
    fs.renameSync(filePath, destPath);
    console.log(`Fichier déplacé dans /uploaded : ${destPath}`);

  } catch (err) {
    console.error(`Erreur upload pour ${filename} : ${err.message}`);
  } finally {
    // on continue la queue
    isUploading = false;
    processQueue();
  }
}

// Démarrage du watcher sur le dossier uploads
function startYoutubeWatcher() {
  // vérifie présence des dossiers et créé si besoin
  if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder, { recursive: true });
  if (!fs.existsSync(uploadedFolder)) fs.mkdirSync(uploadedFolder, { recursive: true });

  // surveille les fichiers dans uploads
  const watcher = chokidar.watch(uploadFolder, {
    // ignore les fichiers présents au démarrage
    ignoreInitial: true,
    // ignore tous les fichiers dans /back/uploads
    ignored: /\/uploaded\//,
    // verif de la stabilité du file avant de add
    awaitWriteFinish: { stabilityThreshold: 3000, pollInterval: 100 },
  });

  watcher.on("add", (filePath) => {
    const filename = path.basename(filePath);
    const ext = path.extname(filename).toLowerCase();

    if (!allowedExtensions.includes(ext) || filename.startsWith("poster-")) {
      console.log(`Format non autorisé : ${filename}`);
      return;
    }

    console.log(`Nouvelle vidéo détectée : ${filename}`);
    queue.push({ filePath, filename });
    processQueue();
  });

  console.log("✓ youtubewatcher on back/uploads :", uploadFolder);
}

export default startYoutubeWatcher;
