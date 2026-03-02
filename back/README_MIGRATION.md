# Gestion de la Base de Données

Sequelize CLI + MySQL

Cette section explique comment la base de données a été créée et comment gérer les modifications (création, ajout, suppression, modification de colonnes) en utilisant Sequelize CLI avec MySQL.

Méthodologie utilisée

✅ Les migrations ont été générées automatiquement avec Sequelize CLI.
✅ Les models ont été créés manuellement dans le dossier models afin d’avoir un meilleur 
✅ Toutes les modifications de la base passent par des migrations versionnées
contrôle sur :

Les associations
Les validations
Les hooks
La structure logique du code


## -1- Installation des dépendances

npm install sequelize mysql2
npm install --save-dev sequelize-cli


## -2- Initialisation de Sequelize

Initialisation de la structure Sequelize :
npx sequelize-cli init

Structure générée :

config/
models/
migrations/
seeders/

## -3- Création des Migrations (Automatique)

Les migrations ont été générées via Sequelize CLI :
npx sequelize-cli migration:generate --name create-user

ou lors de la génération d’un modèle :
npx sequelize-cli model:generate --name User --attributes name:string,email:string,password:string

Cela crée un fichier dans :
migrations/XXXXXXXXXXXX-create-user.js

Exemple de migration générée :

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: Sequelize.STRING,
      email: Sequelize.STRING,
      password: Sequelize.STRING,
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE

    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Users');
  }
};

## -4- Exécution des migrations

Pour créer les tables dans MySQL :

npx sequelize-cli db:migrate

Pour annuler la dernière migration :

npx sequelize-cli db:migrate:undo

Pour tout annuler :

npx sequelize-cli db:migrate:undo:all


## -5- Création des Models (Manuelle)

Contrairement aux migrations, les models ont été créés manuellement dans le dossier :

models/

Exemple : models/user.js

const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class User extends Model {}

User.init({
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'User',
});

module.exports = User;



## -6- Modifier une Table Existante

⚠️ Important :
On ne modifie jamais directement la base de données ou une migration déja executée.

Toute modification passe par une nouvelle migration.


### ➕ Ajouter une colonne

npx sequelize-cli migration:generate --name add-role-to-user

Puis dans le fichier migration :

async up(queryInterface, Sequelize) {
  await queryInterface.addColumn('Users', 'role', {
    type: Sequelize.STRING,
    defaultValue: 'user'
  });
}

### ✏️ Modifier une colonne

npx sequelize-cli migration:generate --name modify-email-users
async up(queryInterface, Sequelize) {
  await queryInterface.changeColumn('Users', 'email', {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  });
}


### ❌ Supprimer une colonne

npx sequelize-cli migration:generate --name remove-age-user
async up(queryInterface) {
  await queryInterface.removeColumn('Users', 'age');
}




# Gestion des Relations

Dans Sequelize, les relations entre les tables sont définies dans les models, pas dans les migrations.

Les migrations créent les tables et les colonnes.
Les models définissent la logique et les relations entre elles.


## -1- One-To-Many (1 → N)

➤ Un User peut créer plusieurs Movies
➤ Un Movie appartient à un seul User

📁 models/User.js
User.hasMany(Movie, { foreignKey: 'userId' });

📁 models/Movie.js
Movie.belongsTo(User, { foreignKey: 'userId' });

### Explication

hasMany() → 1 User possède plusieurs Movies
belongsTo() → chaque Movie appartient à 1 User
userId est la clé étrangère dans la table Movies

## -2- Many-To-Many (N ↔ N)
➤ Un User peut aimer plusieurs Movies
➤ Un Movie peut être aimé par plusieurs Users

On utilise une table intermédiaire : Favorites

📁 models/User.js
User.belongsToMany(Movie, {
  through: 'Favorites',
  foreignKey: 'userId'
});
📁 models/Movie.js
Movie.belongsToMany(User, {
  through: 'Favorites',
  foreignKey: 'movieId'
});


### Explication

belongsToMany() → relation plusieurs-à-plusieurs
through: 'Favorites' → table pivot
userId et movieId sont les clés étrangères dans Favorites

## -3- One-To-One (1 → 1)

➤ Un User possède un seul Profile
📁 models/User.js
User.hasOne(Profile, { foreignKey: 'userId' });
📁 models/Profile.js
Profile.belongsTo(User, { foreignKey: 'userId' });


### Explication

hasOne() → 1 User a 1 Profile
belongsTo() → le Profile appartient à 1 User
userId est la clé étrangère dans Profiles

Résumé

Type de relation	         Méthode Sequelize

One-To-Many	                 hasMany() + belongsTo()
One-To-One	                 hasOne() + belongsTo()
Many-To-Many                 belongsToMany()

