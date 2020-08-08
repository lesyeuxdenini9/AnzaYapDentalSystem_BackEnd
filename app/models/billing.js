'use strict';
module.exports = (sequelize, DataTypes) => {
  const Billing = sequelize.define('Billing', {
    billrefNo: DataTypes.STRING,
    type: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    customerName: DataTypes.STRING,
    date: DataTypes.DATEONLY,
    totalAmount: DataTypes.FLOAT,
    payment: DataTypes.FLOAT,
    status: DataTypes.INTEGER,
    transactionId: DataTypes.INTEGER,
    createdBy: DataTypes.STRING,
    modifiedBy: DataTypes.STRING,
    prescriptionId: DataTypes.INTEGER,
    branchId: DataTypes.INTEGER,
    change: DataTypes.FLOAT,
    isPharmacy: DataTypes.INTEGER,
    discount: DataTypes.FLOAT,
  }, {});
  Billing.associate = function(models) {
    // associations can be defined here
    Billing.belongsTo(models.Transaction)
    Billing.belongsTo(models.Branch)
    Billing.belongsTo(models.User)
    Billing.hasOne(models.Healthcard)
    Billing.hasMany(models.Billitem)
  };
  return Billing;
};