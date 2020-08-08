'use strict';
module.exports = (sequelize, DataTypes) => {
  const Billitem = sequelize.define('Billitem', {
    billingId: DataTypes.INTEGER,
    item: DataTypes.STRING,
    description: DataTypes.STRING,
    medicineId: DataTypes.INTEGER,
    qty: DataTypes.FLOAT,
    price: DataTypes.FLOAT,
    amount: DataTypes.FLOAT
  }, {});
  Billitem.associate = function(models) {
    // associations can be defined here
    Billitem.belongsTo(models.Billing)
    Billitem.belongsTo(models.Medicine)
  };
  return Billitem;
};