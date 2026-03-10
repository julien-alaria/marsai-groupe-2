/**
 * Modèle Movie (Film)
 * Représente un film soumis à la plateforme du festival
 * Gère les informations du film, son statut de sélection, et ses relations
 * avec les utilisateurs (producteur), les votes et les prix
 * 
 * Champs principales:
 * - Identité: title, description, duration, release_year, nationality
 * - Médias: poster_image, image1-3, trailer_video, thumbnail
 * - Technique: main_language, subtitle, ai_tool, workshop, production
 * - Statut: selection_status (submitted, assigned, to_discuss, candidate, awarded, refused, selected, finalist)
 * - Propriétaire: id_user (producteur qui a soumis le film)
 * 
 * Associations:
 * - belongsTo User: Chaque film appartient à un utilisateur (producteur)
 * - hasMany Award: Un film peut recevoir plusieurs prix
 * - hasMany Vote: Un film peut recevoir plusieurs votes du jury
 */

'use strict';

export default (sequelize, DataTypes) => {
  /**
   * Définition du modèle Movie
   * Crée une table 'movies' avec les colonnes définies ci-dessous
   */
  const Movie = sequelize.define('Movie', {
    // Identifiant unique et clé primaire
    id_movie: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    // Titre du film (requis)
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },

    // Description/synopsis du film
    description: DataTypes.TEXT,
    
    // Durée du film en minutes
    duration: DataTypes.INTEGER,
    
    // Langue principale du film
    main_language: DataTypes.STRING,
    
    // Année de sortie du film
    release_year: DataTypes.INTEGER,
    
    // Nationalité/pays d'origine
    nationality: DataTypes.STRING,

    // Images du film (affiche et visuels)
    display_picture: DataTypes.STRING,
    picture1: DataTypes.STRING,
    picture2: DataTypes.STRING,
    picture3: DataTypes.STRING,

    // Vidéos du film
    trailer: DataTypes.STRING,
    youtube_link: DataTypes.STRING(255),
    
    // Informations de production
    production: DataTypes.STRING,
    workshop: DataTypes.STRING(255),

    // Champs ajoutés pour améliorer les métadonnées
    translation: DataTypes.STRING(255),      // Langue de traduction
    synopsis: DataTypes.TEXT,                // Synopsis en français
    synopsis_anglais: DataTypes.TEXT,        // Synopsis en anglais
    subtitle: DataTypes.STRING(255),         // Langue des sous-titres
    ai_tool: DataTypes.STRING(255),          // Outil IA utilisé
    thumbnail: DataTypes.STRING(255),        // Image thumbnail
    admin_comment: DataTypes.TEXT,           // Commentaire admin
    jury_comment: DataTypes.TEXT,            // Message jury (candidature)
    assigned_jury_id: DataTypes.INTEGER,     // Jury qui propose la nomination

    // Statut de sélection du film dans le processus de jury
    selection_status: {
      type: DataTypes.ENUM(
        'submitted',   // Soumis (état initial)
        'assigned',    // Assigné au jury, 1ère votation
        'to_discuss',  // 2e votation ouverte
        'candidate',   // Candidat à la récompense
        'awarded',     // Film premié
        'refused',     // Rejeté par le jury
        'selected',    // Sélectionné (legacy)
        'finalist'     // Film finaliste (legacy)
      ),
      allowNull: false,
      defaultValue: 'submitted'
    },
    youtube_status: DataTypes.STRING(255),
    youtube_movie_id: DataTypes.STRING(255),
    // Clé étrangère: Producteur qui a soumis le film
    id_user: {
      type: DataTypes.INTEGER,
      allowNull: false
    }

  }, {
    tableName: 'movies',
    timestamps: true  // Ajoute createdAt et updatedAt automatiquement
  });

  /**
   * Définition des associations du modèle Movie
   * Établit les relations avec d'autres modèles
   * @param {Object} models - Objet contenant tous les modèles
   */
  Movie.associate = function(models) {

    // Relation: Un film appartient à un utilisateur (producteur)
    // La clé étrangère id_user relie le film à son créateur
    Movie.belongsTo(models.User, {
      as: 'Producer',
      foreignKey: 'id_user'
    });

    // Relation: Jury qui a proposé la nomination (workflow admin)
    Movie.belongsTo(models.User, {
      as: 'NominatorJury',
      foreignKey: 'assigned_jury_id'
    });

    // Relation: Un film peut avoir plusieurs prix (Awards)
    // Un film peut remporter plusieurs prix différents
    Movie.hasMany(models.Award, {
      foreignKey: 'id_movie'
    });

    // Relation: Un film peut recevoir plusieurs votes du jury
    // Chaque membre du jury peut voter sur ce film
    Movie.hasMany(models.Vote, {
      foreignKey: 'id_movie'
    });

    Movie.belongsToMany(models.Categorie, {
      through: 'movies_categories',
      foreignKey: 'id_movie',
      otherKey: 'id_categorie'
    });

    Movie.belongsToMany(models.Collaborator, {
      through: 'collaborators_movies',
      foreignKey: 'id_movie',
      otherKey: 'id_collaborator'
    });


    // Relation N–N : Movie ↔ User (JURY)
    Movie.belongsToMany(models.User, {
      as: 'Juries',
      through: 'movies_juries',
      foreignKey: 'id_movie',
      otherKey: 'id_user'
   });


  };

  return Movie;
};
