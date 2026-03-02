'use strict';

export default (sequelize, DataTypes) => {
  const Sponsor = sequelize.define('Sponsor', {

    id_sponsor: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },

    logo: {
      type: DataTypes.STRING(255),
      allowNull: false
    },

    url: {
      type: DataTypes.STRING(255),
      allowNull: true
    },

    category: {
      type: DataTypes.STRING(100),
      allowNull: true
    }

  }, {
    tableName: 'sponsors'
  });

  return Sponsor;
};