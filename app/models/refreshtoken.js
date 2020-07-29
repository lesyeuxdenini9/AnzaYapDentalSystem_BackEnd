'use strict';
module.exports = (sequelize, DataTypes) => {
  const Refreshtoken = sequelize.define('Refreshtoken', {
    userId: DataTypes.INTEGER,
    token: DataTypes.TEXT,
    revoke: DataTypes.INTEGER,
    expiresAt: DataTypes.DATE,
  }, {});
  Refreshtoken.associate = function(models) {
    // associations can be defined here
    Refreshtoken.belongsTo(models.User)
  };
  return Refreshtoken;
};