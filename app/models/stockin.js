'use strict';
module.exports = (sequelize, DataTypes) => {
  const Stockin = sequelize.define('Stockin', {
    date: DataTypes.DATEONLY,
    refno: DataTypes.STRING,
    manufacturer: DataTypes.STRING,
    manufactureRefno: DataTypes.STRING,
    invoiceRefno: DataTypes.STRING,
    archive: DataTypes.INTEGER,
    branchId: DataTypes.INTEGER,
    isPharmacy: DataTypes.INTEGER,
  }, {});
  Stockin.associate = function(models) {
    // associations can be defined here
    Stockin.hasMany(models.Stockinitem)
  };
  return Stockin;
};