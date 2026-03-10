/**
 * Modèle User (Utilisateur)
 * Représente un utilisateur de la plateforme (Producteur, Jury, Admin)
 * Champs principales:
 * - Identité: first_name, last_name, email, password (bcrypt hashé)
 * - Professionnel: job, biography, portfolio, réseaux sociaux
 * - Adresse: street, postal_code, city, country
 * - Contact: phone, mobile
 * - Rôle: role (ADMIN, JURY, PRODUCER)
 * 
 * Associations:
 * - hasMany Movie: Un utilisateur peut soumettre plusieurs films
 * - hasMany Vote: Un utilisateur (jury) peut voter sur plusieurs films
 * - hasMany Award: Un utilisateur peut recevoir plusieurs prix
 */

'use strict';
export default (sequelize, DataTypes) => {
  /**
   * Définition du modèle User
   * Crée une table 'users' avec les colonnes définies ci-dessous
   */
  const User = sequelize.define('User', {
    // Identifiant unique et clé primaire
    id_user: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    // Prénom de l'utilisateur (requis)
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },

    // Nom de l'utilisateur (requis)
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },

    // Email unique pour la connexion et l'authentification
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },

    // Mot de passe hashé avec bcrypt (10 salt rounds)
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },

    // Numéro de téléphone fixe (optionnel)
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },

    // Numéro de téléphone mobile (optionnel)
    mobile: {
      type: DataTypes.STRING(20),
      allowNull: true
    },

    // Date de naissance (optionnelle)
    birth_date: {
      type: DataTypes.DATE,
      allowNull: true
    },

    // Rue/Adresse (optionnelle)
    street: {
      type: DataTypes.STRING(50),
      allowNull: true
    },

    // Code postal (optionnel)
    postal_code: {
      type: DataTypes.STRING(10),
      allowNull: true
    },

    // Ville de résidence (optionnelle)
    city: {
      type: DataTypes.STRING(50),
      allowNull: true
    },

    // Pays de résidence (optionnel)
    country: {
      type: DataTypes.STRING(50),
      allowNull: true
    },

    // Biographie professionnelle (optionnelle)
    biography: {
      type: DataTypes.STRING(255),
      allowNull: true
    },

    // Profession/métier de l'utilisateur
    job: {
      type: DataTypes.ENUM(
        'ACTOR',       // Acteur
        'DIRECTOR',    // Réalisateur
        'PRODUCER',    // Producteur
        'WRITER',      // Scénariste
        'OTHER'        // Autre
      ),
      allowNull: true
    },

    portfolio: {
      type: DataTypes.STRING(50),
      allowNull: true
    },

    youtube: {
      type: DataTypes.STRING(50),
      allowNull: true
    },

    instagram: {
      type: DataTypes.STRING(50),
      allowNull: true
    },

    linkedin: {
      type: DataTypes.STRING(50),
      allowNull: true
    },

    facebook: {
      type: DataTypes.STRING(50),
      allowNull: true
    },

    tiktok: {
      type: DataTypes.STRING(50),
      allowNull: true
    },

    known_by_mars_ai: {
      type: DataTypes.ENUM(
        'Par un ami',
        'Vu une publicité du festival',
        "Via le site internet ou application de l'IA"
      ),
      allowNull: true
    },

    role: {
      type: DataTypes.ENUM('ADMIN', 'JURY', 'PRODUCER'),
      allowNull: false,
      defaultValue: 'PRODUCER'
    }

  }, {
    tableName: 'users'
  });

 
  User.associate = function(models) {
    User.hasMany(models.Movie, {
      foreignKey: 'id_user'
    });
    User.hasMany(models.Movie, {
      as: 'ProposedMovies',
      foreignKey: 'assigned_jury_id'
    });
    User.hasMany(models.Vote, {
      foreignKey: 'id_user'
    });

  // Relation N–N : User (JURY) ↔ Movie
  User.belongsToMany(models.Movie, {
  as: 'JuryMovies',
  through: 'movies_juries',
  foreignKey: 'id_user',
  otherKey: 'id_movie'
  });


  };
  
  return User;
};