// import chokidar from "chokidar";
// import fs from "fs";
// import path from "path";
// import youtubeController from "../controllers/YoutubeController.js";
// import { uploadFile } from "./s3.js";
// import db from "../models/index.js";
// import { VIDEO_REJECT_TEMPLATE } from "../constants/VideoRejectTemplate.js";
// import { VIDEO_ACCEPT_TEMPLATE } from "../constants/VideoAcceptTemplate.js";
// import EmailController from "../controllers/EmailController.js";

// // défini le chemin absolu du dossier ou les fichiers vidéo sont placés avant d'être traités
// const uploadFolder = path.join(process.cwd(), "uploads");
// const uploadedFolder = path.join(uploadFolder, "uploaded");
// const allowedExtensions = [".mp4", ".avi", ".m4v", ".mov", ".mpg", ".mpeg", ".wmv"];
// const queue = [];
// let isUploading = false;
// const Movie = db.Movie;

// // Tentative de upload (si erreur reseau ou server -> retries n fois)
// async function uploadWithRetry(filePath, filename, id_user, retries = 3) {
//   // filePath: chemin vers le fichier à upload
//   // filename: nom du fichier 
//   // retries: nombre max de tentatives

//   // boucle for qui tente l'upload
//   for (let attempt = 1; attempt <= retries; attempt++) {
//     try {
//       // supprime l'extension pour affichage
//       const titleWithoutExt = path.parse(filename).name;
//       // appelle la fonction d'upload sur Youtube
//       return await youtubeController.uploadVideo(
//         filePath,
//         titleWithoutExt,
//         id_user,
//         "unlisted",
//         "unlisted"
//       );
//     } catch (err) {
//       // Déterminer si l'erreur est "retryable" (réexécuter l'opération après erreur)
//       const retryable =
//         // si coupure de connexion
//         err.code === "ECONNRESET" ||
//         // si err de délai d'attente
//         err.code === "ETIMEDOUT" ||
//         // si err côté serveur
//         err.response?.status >= 500;
//       // si err === false ou nd de retries atteint on lance l'erreur
//       if (!retryable || attempt === retries) throw err;
//       // affiche un avertissement en console à chaque nouvelle tentative de upload
//       console.warn(`Retry ${attempt} pour ${filename}...`);
//       // introduit un délai avec temps d'attente qui progresse de façon exponentielle à chaque tentative
//       await new Promise(res => setTimeout(res, 2000 * attempt));
//     }
//   }
// }

// // Traitement de la file d’attente (s'assurer que les fichiers sont uploadés un  par un et retry auto si server error)
// async function processQueue() {
//   // booléen qui indique si un uload est en cours
//   if (isUploading || queue.length === 0) return;
//   // extraction du premier fichier, retire le premier élément de la queue et le retourne
//   const { filePath, filename, id_user, userEmail } = queue.shift();
//   isUploading = true;

//   try {
//     console.log(`Upload en cours : ${filename}`);

//     const data = await uploadWithRetry(filePath, filename, id_user);

//     console.log(`✓ Upload terminé : ${data.id}`);
//     console.log(`Content licensed : ${data.licensedContent}`);
//     console.log(`URL YouTube : https://www.youtube.com/watch?v=${data.id}`);
//     console.log(`ID USER ${id_user}`);

//     // Appelle de la fonction de s3.js pour upload dans Scaleway
//     await uploadFile(filePath);

//     if (data.licensedContent === true) {
//       EmailController.sendMail(
//         userEmail,
//         "Video rejected, content under license",
//         VIDEO_REJECT_TEMPLATE,
//       );
//     } else {
//       EmailController.sendMail(
//         userEmail,
//         "Your video has been accepted.",
//         VIDEO_ACCEPT_TEMPLATE,
//       );
//     }

//     console.log(`Envoyé à ${userEmail}`);


// a comenter ---------------------------------------

//     // déplace le fichier uploader vers back/uploads/uploaded
//     if (!fs.existsSync(uploadedFolder)) fs.mkdirSync(uploadedFolder, { recursive: true });
//     const destPath = path.join(uploadedFolder, `${Date.now()}-${filename}`);
//     fs.renameSync(filePath, destPath);
//     console.log(`Fichier déplacé dans /uploaded : ${destPath}`);

// -----------------------------------------------------------




//   } catch (err) {
//     console.error(`Erreur upload pour ${filename} : ${err.message}`);
//   } finally {
//     // on continue la queue
//     isUploading = false;
//     processQueue();
//   }
// }

// // Démarrage du watcher sur le dossier uploads
// function startYoutubeWatcher() {
//   // vérifie présence des dossiers et créé si besoin
//   if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder, { recursive: true });
//   if (!fs.existsSync(uploadedFolder)) fs.mkdirSync(uploadedFolder, { recursive: true });

//   // surveille les fichiers dans uploads
//   const watcher = chokidar.watch(uploadFolder, {
//     // ignore les fichiers présents au démarrage
//     ignoreInitial: true,
//     // ignore tous les fichiers dans /back/uploads
//     ignored: /\/uploaded\//,
//     // verif de la stabilité du file avant de add
//     awaitWriteFinish: { stabilityThreshold: 3000, pollInterval: 100 },
//   });

//   watcher.on("add", async (filePath) => {
//     const filename = path.basename(filePath);
//     const ext = path.extname(filename).toLowerCase();

//     if (!allowedExtensions.includes(ext) || filename.startsWith("poster-")) {
//       console.log(`Format non autorisé : ${filename}`);
//       return;
//     }

//     console.log(`Nouvelle vidéo détectée : ${filename}`);

//     try {
//       const movie = await Movie.findOne({
//         where: { trailer: filename },
//         include: [{ 
//           model: db.User,
//           as: 'Producer',
//           attributes: ['email', 'first_name']
//          }]
//       });

//       if (!movie || !movie.Producer) {
//         console.warn(`Aucun film ou producteur trouvé pour ${filename}`);
//         return;
//       }

//       const id_user = movie.id_user;
//       const userEmail = movie.Producer.email;

//       queue.push({ filePath, filename, id_user, userEmail });
//       processQueue();
//     } catch (err) {
//       console.error("Erreur récupération film :", err.message);
//     }
//   });

//   console.log("✓ youtubewatcher on back/uploads :", uploadFolder);
// }

// export default startYoutubeWatcher;


// import chokidar from "chokidar";
// import fs from "fs";
// import path from "path";
// import youtubeController from "../controllers/YoutubeController.js";
// import { uploadFile } from "./s3.js";
// import db from "../models/index.js";
// import { VIDEO_REJECT_TEMPLATE } from "../constants/VideoRejectTemplate.js";
// import { VIDEO_ACCEPT_TEMPLATE } from "../constants/VideoAcceptTemplate.js";
// import EmailController from "../controllers/EmailController.js";

// // défini le chemin absolu du dossier ou les fichiers vidéo sont placés avant d'être traités
// const uploadFolder = path.join(process.cwd(), "uploads");
// const uploadedFolder = path.join(uploadFolder, "uploaded");
// const allowedExtensions = [".mp4", ".avi", ".m4v", ".mov", ".mpg", ".mpeg", ".wmv"];
// const queue = [];
// let isUploading = false;
// const Movie = db.Movie;

// // Tentative de upload (si erreur reseau ou server -> retries n fois)
// async function uploadWithRetry(filePath, filename, id_user, retries = 3) {
//   // filePath: chemin vers le fichier à upload
//   // filename: nom du fichier 
//   // retries: nombre max de tentatives

//   // boucle for qui tente l'upload
//   for (let attempt = 1; attempt <= retries; attempt++) {
//     try {
//       // supprime l'extension pour affichage
//       const titleWithoutExt = path.parse(filename).name;
//       // appelle la fonction d'upload sur Youtube
//       return await youtubeController.uploadVideo(
//         filePath,
//         titleWithoutExt,
//         id_user,
//         "unlisted",
//         "unlisted"
//       );
//     } catch (err) {
//       // Déterminer si l'erreur est "retryable" (réexécuter l'opération après erreur)
//       const retryable =
//         // si coupure de connexion
//         err.code === "ECONNRESET" ||
//         // si err de délai d'attente
//         err.code === "ETIMEDOUT" ||
//         // si err côté serveur
//         err.response?.status >= 500;
//       // si err === false ou nd de retries atteint on lance l'erreur
//       if (!retryable || attempt === retries) throw err;
//       // affiche un avertissement en console à chaque nouvelle tentative de upload
//       console.warn(`Retry ${attempt} pour ${filename}...`);
//       // introduit un délai avec temps d'attente qui progresse de façon exponentielle à chaque tentative
//       await new Promise(res => setTimeout(res, 2000 * attempt));
//     }
//   }
// }

// // Traitement de la file d’attente (s'assurer que les fichiers sont uploadés un  par un et retry auto si server error)
// async function processQueue() {
//   // booléen qui indique si un uload est en cours
//   if (isUploading || queue.length === 0) return;
//   // extraction du premier fichier, retire le premier élément de la queue et le retourne
//   const { filePath, filename, id_user, userEmail } = queue.shift();
//   isUploading = true;

//   try {
//     console.log(`Upload en cours : ${filename}`);

//     const data = await uploadWithRetry(filePath, filename, id_user);

//     console.log(`✓ Upload terminé : ${data.id}`);
//     console.log(`Content licensed : ${data.licensedContent}`);
//     console.log(`URL YouTube : https://www.youtube.com/watch?v=${data.id}`);
//     console.log(`ID USER ${id_user}`);

//     // Appelle de la fonction de s3.js pour upload dans Scaleway
//     await uploadFile(filePath);

//     if (data.licensedContent === true) {
//       EmailController.sendMail(
//         userEmail,
//         "Video rejected, content under license",
//         VIDEO_REJECT_TEMPLATE,
//       );
//     } else {
//       EmailController.sendMail(
//         userEmail,
//         "Your video has been accepted.",
//         VIDEO_ACCEPT_TEMPLATE,
//       );
//     }

//     console.log(`Envoyé à ${userEmail}`);


// a comenter ---------------------------------------

//     // déplace le fichier uploader vers back/uploads/uploaded
//     if (!fs.existsSync(uploadedFolder)) fs.mkdirSync(uploadedFolder, { recursive: true });
//     const destPath = path.join(uploadedFolder, `${Date.now()}-${filename}`);
//     fs.renameSync(filePath, destPath);
//     console.log(`Fichier déplacé dans /uploaded : ${destPath}`);

// -----------------------------------------------------------




//   } catch (err) {
//     console.error(`Erreur upload pour ${filename} : ${err.message}`);
//   } finally {
//     // on continue la queue
//     isUploading = false;
//     processQueue();
//   }
// }

// // Démarrage du watcher sur le dossier uploads
// function startYoutubeWatcher() {
//   // vérifie présence des dossiers et créé si besoin
//   if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder, { recursive: true });
//   if (!fs.existsSync(uploadedFolder)) fs.mkdirSync(uploadedFolder, { recursive: true });

//   // surveille les fichiers dans uploads
//   const watcher = chokidar.watch(uploadFolder, {
//     // ignore les fichiers présents au démarrage
//     ignoreInitial: true,
//     // ignore tous les fichiers dans /back/uploads
//     ignored: /\/uploaded\//,
//     // verif de la stabilité du file avant de add
//     awaitWriteFinish: { stabilityThreshold: 3000, pollInterval: 100 },
//   });

//   watcher.on("add", async (filePath) => {
//     const filename = path.basename(filePath);
//     const ext = path.extname(filename).toLowerCase();

//     if (!allowedExtensions.includes(ext) || filename.startsWith("poster-")) {
//       console.log(`Format non autorisé : ${filename}`);
//       return;
//     }

//     console.log(`Nouvelle vidéo détectée : ${filename}`);

//     try {
//       const movie = await Movie.findOne({
//         where: { trailer: filename },
//         include: [{ 
//           model: db.User,
//           as: 'Producer',
//           attributes: ['email', 'first_name']
//          }]
//       });

//       if (!movie || !movie.Producer) {
//         console.warn(`Aucun film ou producteur trouvé pour ${filename}`);
//         return;
//       }

//       const id_user = movie.id_user;
//       const userEmail = movie.Producer.email;

//       queue.push({ filePath, filename, id_user, userEmail });
//       processQueue();
//     } catch (err) {
//       console.error("Erreur récupération film :", err.message);
//     }
//   });

//   console.log("✓ youtubewatcher on back/uploads :", uploadFolder);
// }

// export default startYoutubeWatcher;




import chokidar from "chokidar";
import fs from "fs";
import path from "path";
import youtubeController from "../controllers/YoutubeController.js";
import { uploadFile } from "./s3.js";
import db from "../models/index.js";
import { VIDEO_REJECT_TEMPLATE } from "../constants/VideoRejectTemplate.js";
import { VIDEO_ACCEPT_TEMPLATE } from "../constants/VideoAcceptTemplate.js";
import EmailController from "../controllers/EmailController.js";

// défini le chemin absolu du dossier ou les fichiers vidéo sont placés avant d'être traités
const uploadFolder = path.join(process.cwd(), "uploads");
const uploadedFolder = path.join(uploadFolder, "uploaded");
const allowedExtensions = [".mp4", ".avi", ".m4v", ".mov", ".mpg", ".mpeg", ".wmv"];
const queue = [];
let isUploading = false;
const Movie = db.Movie;

// Tentative de upload (si erreur reseau ou server -> retries n fois)
async function uploadWithRetry(filePath, filename, id_user, retries = 3) {
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
        /* BUG #9 FIX: 3rd param is `description`, not id_user.
           id_user was being set as the YouTube video description. */
        `Film soumis via MarsAI — producteur #${id_user}`,
        "unlisted",
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
  const { filePath, filename, id_user, userEmail, movie } = queue.shift();
  isUploading = true;

  try {
    console.log(`Upload en cours : ${filename}`);

    // ── YouTube upload (optionnel : ne bloque pas le reste si réseau indispo) ──
    // En dev sans accès internet (ENOTFOUND), ou si YouTube est indisponible,
    // on log l'erreur mais on continue : S3 + archivage + email se déroulent quand même.
    let youtubeData = null;
    try {
      youtubeData = await uploadWithRetry(filePath, filename, id_user);
      const youtubeUrl = `https://www.youtube.com/watch?v=${youtubeData.id}`;
      console.log(`✓ Upload YouTube terminé : ${youtubeData.id}`);
      console.log(`Content licensed : ${youtubeData.licensedContent}`);
      console.log(`URL YouTube : ${youtubeUrl}`);
      // Met à jour youtube_link en base — le front peut utiliser ce lien comme fallback
      try {
        await movie.update({ youtube_link: youtubeUrl });
        console.log(`✓ DB youtube_link mis à jour`);
      } catch (dbErr) {
        console.error(`Erreur mise à jour youtube_link :`, dbErr.message);
      }
    } catch (ytErr) {
      // Erreur YouTube non bloquante : réseau indispo, quota dépassé, token expiré...
      console.warn(`⚠ YouTube upload ignoré pour ${filename} : ${ytErr.message}`);
      console.warn(`  Le fichier reste accessible localement via /uploads/${filename}`);
    }

    console.log(`ID USER ${id_user}`);

    // ── Upload S3 Scaleway ──
    try {
      await uploadFile(filePath);
    } catch (s3Err) {
      console.error(`Erreur S3 pour ${filename} :`, s3Err.message);
    }

    // ── Email producteur ──
    try {
      /* BUG #5 FIX: when YouTube is unreachable youtubeData is null.
         The old code fell through to the else branch and sent an acceptance
         email even on failure. Guard with if(youtubeData) first. */
      if (youtubeData) {
        if (youtubeData.licensedContent === true) {
          await EmailController.sendMail(userEmail, "Video rejected, content under license", VIDEO_REJECT_TEMPLATE);
        } else {
          /* BUG #9 FIX: pass a real description string to uploadVideo instead of id_user */
          await EmailController.sendMail(userEmail, "Your video has been accepted.", VIDEO_ACCEPT_TEMPLATE);
        }
      } else {
        console.warn(`⚠ Email non envoyé pour ${userEmail} : YouTube non disponible lors du traitement.`);
      }
      console.log(`Envoyé à ${userEmail}`);
    } catch (mailErr) {
      console.error(`Erreur email pour ${userEmail} :`, mailErr.message);
    }

    // Déplace le fichier vers uploads/uploaded/ et met à jour le trailer en DB.
    // Le polling côté front (toutes les 5s pendant 90s après soumission) rattrape
    // automatiquement le nouveau chemin dès que le watcher a terminé.
    if (!fs.existsSync(uploadedFolder)) fs.mkdirSync(uploadedFolder, { recursive: true });
    const ts = Date.now();
    const movedFilename = `${ts}-${filename}`;
    const destPath = path.join(uploadedFolder, movedFilename);
    try {
      fs.renameSync(filePath, destPath);
      console.log(`Fichier déplacé dans /uploaded : ${destPath}`);
      const newRelativePath = `uploaded/${movedFilename}`;
      await movie.update({ trailer: newRelativePath });
      console.log(`✓ DB trailer mis à jour : ${newRelativePath}`);
    } catch (moveErr) {
      console.error(`Erreur déplacement/DB pour ${filename} :`, moveErr.message);
    }

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
    // FIX: regex /\/uploaded\// ne fonctionne pas sur Windows (backslashes).
    // On utilise une fonction qui normalise le chemin avant de tester.
    ignored: (p) => p.replace(/\\/g, '/').includes('/uploaded/'),
    // verif de la stabilité du file avant de add
    awaitWriteFinish: { stabilityThreshold: 3000, pollInterval: 100 },
  });

  watcher.on("add", async (filePath) => {
    const filename = path.basename(filePath);
    const ext = path.extname(filename).toLowerCase();

    if (!allowedExtensions.includes(ext) || filename.startsWith("poster-")) {
      console.log(`Format non autorisé : ${filename}`);
      return;
    }

    console.log(`Nouvelle vidéo détectée : ${filename}`);

    try {
      const movie = await Movie.findOne({
        where: { trailer: filename },
        include: [{ 
          model: db.User,
          as: 'Producer',
          attributes: ['email', 'first_name']
         }]
      });

      if (!movie || !movie.Producer) {
        console.warn(`Aucun film ou producteur trouvé pour ${filename}`);
        return;
      }

      const id_user = movie.id_user;
      const userEmail = movie.Producer.email;

      queue.push({ filePath, filename, id_user, userEmail, movie });
      processQueue();
    } catch (err) {
      console.error("Erreur récupération film :", err.message);
    }
  });

  console.log("✓ youtubewatcher on back/uploads :", uploadFolder);
}

export default startYoutubeWatcher;