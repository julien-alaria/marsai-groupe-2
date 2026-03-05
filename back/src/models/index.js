import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { Sequelize } from "sequelize";
import configFile from "../../config/config.cjs"; // <-- Utilise config.cjs comme module

// Charge les variables d'environnement
dotenv.config();

/**
 * Obtient le répertoire courant du module
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basename = path.basename(__filename);

/**
 * Détermine l'environnement d'exécution
 */
const env = process.env.NODE_ENV || "development";

/**
 * Charge la configuration depuis config.cjs
 */
const config = configFile[env];

const db = {};

/**
 * Initialise l'instance Sequelize
 */
let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

/**
 * Fonction asynchrone pour charger tous les modèles
 */
async function loadModels() {
  const files = fs
    .readdirSync(__dirname)
    .filter(
      (file) =>
        file.indexOf(".") !== 0 &&
        file !== basename &&
        (file.slice(-3) === ".js" || file.slice(-3) === ".mjs")
    );

  for (const file of files) {
    const modelModule = await import(path.join(__dirname, file));
    const model = modelModule.default || modelModule;
    // Si c'est une classe avec init
    if (typeof model.init === "function") {
      db[model.name] = model.init(sequelize, Sequelize.DataTypes);
    }
    // Si c'est une fonction (ancienne version, comme les vôtres)
    else if (typeof model === "function") {
      const definedModel = model(sequelize, Sequelize.DataTypes);
      db[definedModel.name] = definedModel;
    }
  }

  Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
      db[modelName].associate(db);
    }
  });
}

/**
 * Charge les modèles et initialise les associations
 */
await loadModels();

/**
 * Ajoute l'instance Sequelize et la classe Sequelize à l'objet db
 */
db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
