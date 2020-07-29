'use strict';
module.exports = (sequelize, DataTypes) => {
  const Address = sequelize.define('Address', {
    address: DataTypes.STRING,
    householdNo: DataTypes.STRING,
    streetId: DataTypes.INTEGER,
    barangayId: DataTypes.INTEGER,
    archive: DataTypes.INTEGER,
  }, {});
  Address.associate = function(models) {
    // associations can be defined here
    Address.hasOne(models.Family)
    Address.belongsTo(models.Street)
    Address.belongsTo(models.Barangay)
  };
  Address.loadscope = function(models){
    Address.addScope("active",{
      where: {
        archive: 0,
      }
    })
  }
  return Address;
};