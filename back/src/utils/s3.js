import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";

// Configuration du client S3 pour Scaleway
const s3Client = new S3Client({
  region: "fr-par",
  endpoint: `https://s3.fr-par.scw.cloud`,
  credentials: {
    accessKeyId: process.env.SCW_ACCESS_KEY,
    secretAccessKey: process.env.SCW_SECRET_KEY,
  },
});

const BUCKET_NAME = process.env.SCW_BUCKET;
const FOLDER = "grp2";

// Verif d'upload
// listFiles();

// Liste des fichiers dans le dossier "grp3"
async function listFiles() {
  const command = new ListObjectsCommand({
    Bucket: BUCKET_NAME,
    Prefix: FOLDER + "/",
  });
  const response = await s3Client.send(command);
  console.log(response.Contents);
}

// Uploader un fichier dans le dossier "grp3"
async function uploadFile(filePath) {
  const fileStream = fs.createReadStream(filePath);
  const fileName = path.basename(filePath);

  const uploadCommand = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: `${FOLDER}/${Date.now()}-${fileName}`,
    Body: fileStream,
  });
  await s3Client.send(uploadCommand);
  console.log("✓ S3 File uploaded successfully", fileName);
}

// Télécharger un fichier depuis le dossier "grp3"
async function downloadFile() {
  const downloadCommand = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: `${FOLDER}/test-file.txt`,
  });
  const downloadResponse = await s3Client.send(downloadCommand);
  const downloadedContent = await streamToString(downloadResponse.Body);
  console.log("Downloaded content:", downloadedContent);
}

// Supprimer un fichier du dossier "grp3"
async function deleteFile() {
  const deleteCommand = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: `${FOLDER}/test-file.txt`,
  });
  await s3Client.send(deleteCommand);
  console.log("File deleted successfully!");
}

export { uploadFile };