'use strict';
module.exports = (sequelize, DataTypes) => {
  const Stockinitem = sequelize.define('Stockinitem', {
    stockinId: DataTypes.INTEGER,
    medicineId: DataTypes.INTEGER,
    medicine: DataTypes.STRING,
    qty: DataTypes.FLOAT,
    uom: DataTypes.STRING,
    ExpirationDate: DataTypes.DATEONLY
  }, {});
  Stockinitem.associate = function(models) {
    // associations can be defined here
    Stockinitem.belongsTo(models.Stockin)
    Stockinitem.belongsTo(models.Medicine)
  };
  return Stockinitem;
};