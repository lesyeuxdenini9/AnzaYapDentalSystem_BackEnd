'use strict';
module.exports = (sequelize, DataTypes) => {
  const Prescription = sequelize.define('Prescription', {
    transactionId: DataTypes.INTEGER,
    date: DataTypes.DATEONLY,
    archive: DataTypes.INTEGER,
    prescriptionNo: DataTypes.STRING,
    actionId: DataTypes.INTEGER,
    treatmentId: DataTypes.INTEGER,
  }, {});
  Prescription.associate = function(models) {
    Prescription.belongsTo(models.Transaction)
    Prescription.hasMany(models.Prescriptitem)
  };

  Prescription.loadscope = function(models){
    Prescription.addScope("active",{
      where: {
        archive: 0,
      }
    })
  }
  return Prescription;
};