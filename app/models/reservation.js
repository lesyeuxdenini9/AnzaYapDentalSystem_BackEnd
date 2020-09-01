'use strict';
module.exports = (sequelize, DataTypes) => {
  const Reservation = sequelize.define('Reservation', {
    reservationNo: DataTypes.STRING,
    date: DataTypes.DATEONLY,
    starttime: DataTypes.DATE,
    endtime: DataTypes.DATE,
    userId: DataTypes.INTEGER,
    dentistId: DataTypes.INTEGER,
    status: DataTypes.INTEGER,
    type: DataTypes.INTEGER,
    expired: DataTypes.INTEGER,
    approvedBy: DataTypes.STRING,
    transactionId: DataTypes.INTEGER,
    branchId: DataTypes.INTEGER,
    Start: DataTypes.STRING,
    End: DataTypes.STRING,
    isResched: DataTypes.INTEGER,
  }, {});
  Reservation.associate = function(models) {
    // associations can be defined here
    Reservation.belongsTo(models.User)
    Reservation.belongsTo(models.Dentist)
    Reservation.belongsTo(models.Transaction)
    Reservation.hasMany(models.Treatment)
    Reservation.belongsTo(models.Branch)
  };
  return Reservation;
};