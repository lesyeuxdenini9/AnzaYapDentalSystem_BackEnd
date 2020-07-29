'use strict';
module.exports = (sequelize, DataTypes) => {
  const Dentist = sequelize.define('Dentist', {
    fullname: DataTypes.STRING,
    email: DataTypes.STRING,
    bday: DataTypes.DATEONLY,
    contact: DataTypes.STRING,
    address: DataTypes.STRING,
    img: DataTypes.STRING,
    archive: DataTypes.INTEGER,
    branchId: DataTypes.INTEGER,
    licence: DataTypes.STRING,
    ptr: DataTypes.STRING,
    gender: DataTypes.STRING,
  }, {});
  Dentist.associate = function(models) {
    // associations can be defined here
    Dentist.hasMany(models.Reservation)
    Dentist.belongsTo(models.Branch)
    Dentist.hasMany(models.Transaction)
  };
  Dentist.loadscope = function(models){
    Dentist.addScope("active",{
      where: {
        archive: 0,
      }
    })
  }
  return Dentist;
};