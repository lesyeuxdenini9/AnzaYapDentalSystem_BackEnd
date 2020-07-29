'use strict';
module.exports = (sequelize, DataTypes) => {
  const Billitem = sequelize.define('Billitem', {
    billId: DataTypes.INTEGER,
    item: DataTypes.STRING,
    description: DataTypes.STRING,
    medicineId: DataTypes.INTEGER,
    qty: DataTypes.FLOAT,
    price: DataTypes.FLOAT,
    amount: DataTypes.FLOAT
  }, {});
  Billitem.associate = function(models) {
    // associations can be defined here
  };
  return Billitem;
};