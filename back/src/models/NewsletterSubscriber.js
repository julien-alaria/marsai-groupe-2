'use strict';

export default (sequelize, DataTypes) => {
  const NewsletterSubscriber = sequelize.define(
    'NewsletterSubscriber',
    {
      id_subscriber: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      first_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      last_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      source: {
        type: DataTypes.ENUM('PUBLIC', 'FILM_CANDIDACY'),
        allowNull: false,
        defaultValue: 'PUBLIC',
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: 'newsletter_subscribers',
      timestamps: true,
    }
  );

  return NewsletterSubscriber;
};
