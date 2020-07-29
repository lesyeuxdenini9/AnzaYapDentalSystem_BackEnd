'use strict';
module.exports = (sequelize, DataTypes) => {
  const Stockout = sequelize.define('Stockout', {
    actionId: DataTypes.INTEGER,
    transactionId: DataTypes.INTEGER,
    branchId: DataTypes.INTEGER,
    medicineId: DataTypes.INTEGER,
    qty: DataTypes.FLOAT,
    archive: DataTypes.INTEGER
  }, {});
  Stockout.associate = function(models) {
    // associations can be defined here
    Stockout.belongsTo(models.Action)
    Stockout.belongsTo(models.Transaction)
    Stockout.belongsTo(models.Medicine)
  };
  return Stockout;
};