'use strict';
module.exports = (sequelize, DataTypes) => {
  const Resettoken = sequelize.define('Resettoken', {
    userId: DataTypes.INTEGER,
    token: DataTypes.STRING,
    email: DataTypes.STRING
  }, {});
  Resettoken.associate = function(models) {
    // associations can be defined here
  };
  return Resettoken;
};