'use strict';
module.exports = (sequelize, DataTypes) => {
  const Medicine = sequelize.define('Medicine', {
    archive: DataTypes.INTEGER,
    medicine: DataTypes.STRING,
    description: DataTypes.STRING,
    price: DataTypes.FLOAT,
    manufacturer: DataTypes.STRING,
    stocks: DataTypes.FLOAT,
    code: DataTypes.STRING,
    branchId: DataTypes.INTEGER,
    type: DataTypes.INTEGER,
    uom: DataTypes.STRING,
    limitMin: DataTypes.FLOAT,
    scientificName: DataTypes.TEXT,
    brand: DataTypes.STRING,
  }, {});
  Medicine.associate = function(models) {
    // associations can be defined here
    Medicine.belongsTo(models.Branch)
    Medicine.hasMany(models.Stockinitem)
    Medicine.hasMany(models.Stockout)
    Medicine.hasMany(models.Billitem)
  };

  Medicine.loadscope = function(models){
    Medicine.addScope("active",{
      where: {
        archive: 0,
      }
    })

    Medicine.addScope("inventory",{
      where: {
        type: 0,
      }
    })

    Medicine.addScope("pharmacy",{
      where: {
        type: 1,
      }
    })
  }
  return Medicine;
};