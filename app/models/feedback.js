'use strict';
module.exports = (sequelize, DataTypes) => {
  const Feedback = sequelize.define('Feedback', {
    userId: DataTypes.INTEGER,
    branchId: DataTypes.INTEGER,
    dentistId: DataTypes.INTEGER,
    star: DataTypes.INTEGER,
    message: DataTypes.STRING,
    archive: DataTypes.INTEGER
  }, {});
  Feedback.associate = function(models) {
    // associations can be defined here

    Feedback.belongsTo(models.User)
  };
  return Feedback;
};