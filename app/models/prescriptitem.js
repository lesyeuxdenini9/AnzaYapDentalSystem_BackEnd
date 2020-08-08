'use strict';
module.exports = (sequelize, DataTypes) => {
  const Prescriptitem = sequelize.define('Prescriptitem', {
    prescriptionId: DataTypes.INTEGER,
    medicine: DataTypes.STRING,
    qty: DataTypes.FLOAT,
    amount: DataTypes.FLOAT,
    archive: DataTypes.INTEGER,
    medicineId: DataTypes.INTEGER,
    dosage: DataTypes.STRING,
    days: DataTypes.STRING,
    remarks: DataTypes.STRING,
  }, {});
  Prescriptitem.associate = function(models) {
    Prescriptitem.belongsTo(models.Prescription)
  };

  
  Prescriptitem.loadscope = function(models){
    Prescriptitem.addScope("active",{
      where: {
        archive: 0,
      }
    })
  }

  return Prescriptitem;
};