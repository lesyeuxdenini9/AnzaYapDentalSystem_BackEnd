'use strict';
module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    userId: DataTypes.INTEGER,
    isread: DataTypes.INTEGER,
    isadmin: DataTypes.INTEGER,
    transactionId: DataTypes.INTEGER,
    reservationId: DataTypes.INTEGER,
    message: DataTypes.TEXT,
    targetLink: DataTypes.STRING,
    isAnnounce: DataTypes.INTEGER,
    branchId: DataTypes.INTEGER,
  }, {});
  Notification.associate = function(models) {
    Notification.belongsTo(models.Branch)
  };
  return Notification;
};